import { NextRequest, NextResponse } from "next/server";
import { serviceRoleClient } from "@/lib/supabase-service";
import { getProvider } from "@/lib/payment/provider";

// Payfast ITN source IPs.
// See: https://developers.payfast.co.za/documentation/#itn
const PAYFAST_IPS = ["41.74.179.228", "41.74.179.229", "41.74.179.230", "41.74.179.231"];
if (process.env.NODE_ENV !== "production") {
  PAYFAST_IPS.push("127.0.0.1", "::1", "::ffff:127.0.0.1");
}

// The client IP is the LAST hop in x-forwarded-for — earlier entries are
// supplied by the client and can be spoofed. On Vercel, x-real-ip is the
// trustworthy header set by the edge network.
function getSourceIp(request: NextRequest): string | null {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;
  const hops = forwardedFor.split(",").map((h) => h.trim()).filter(Boolean);
  return hops[hops.length - 1] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      body[key] = String(value);
    }

    const signature = body.signature || undefined;
    const sourceIp = getSourceIp(request);

    // Validate source IP (Payfast sends from known IPs). Fail closed: a
    // request with no identifiable source is not a legitimate ITN.
    if (!sourceIp || !PAYFAST_IPS.includes(sourceIp)) {
      console.warn(`[payfast-itn] Rejected ITN from unknown IP: ${sourceIp ?? "none"}`);
      return NextResponse.json({ error: "Invalid source" }, { status: 403 });
    }

    console.log("[payfast-itn] Received ITN", {
      m_payment_id: body.m_payment_id,
      pf_payment_id: body.pf_payment_id,
      payment_status: body.payment_status,
      amount_gross: body.amount_gross,
    });

    const provider = getProvider("payfast");
    if (!provider) {
      console.error("[payfast-itn] Payfast provider not registered");
      return NextResponse.json({ error: "Provider not available" }, { status: 500 });
    }

    const verification = await provider.verifyWebhook({ body, signature, sourceIp });

    if (!verification.valid) {
      console.error("[payfast-itn] Verification failed");
      return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
    }

    if (!verification.orderNumber) {
      console.error("[payfast-itn] No order number in notification");
      return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
    }

    // Fetch order by order_number
    const { data: order, error: orderError } = await serviceRoleClient
      .from("orders")
      .select("id, order_number, total_zar, payment_status, secure_token")
      .eq("order_number", verification.orderNumber)
      .single();

    if (orderError || !order) {
      console.error("[payfast-itn] Order not found:", verification.orderNumber);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ─── Validate amount ────────────────────────────────────────────────────
    // Exact match in cents — no rounding tolerance.
    if (verification.amountZar === null) {
      console.error("[payfast-itn] Missing amount_gross in notification");
      return NextResponse.json({ error: "Missing amount" }, { status: 400 });
    }
    if (Math.round(verification.amountZar * 100) !== Math.round(order.total_zar * 100)) {
      console.error(
        `[payfast-itn] Amount mismatch: expected ${order.total_zar}, got ${verification.amountZar}`
      );
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // ─── Idempotency: check if already paid ─────────────────────────────────
    if (order.payment_status === "paid") {
      console.log(`[payfast-itn] Order ${order.order_number} already paid, ignoring duplicate ITN`);
      return NextResponse.json({ status: "ok", message: "Already processed" });
    }

    // ─── Process payment status ─────────────────────────────────────────────
    if (verification.paymentStatus === "paid") {
      // Update order
      const { error: updateError } = await serviceRoleClient
        .from("orders")
        .update({
          payment_status: "paid",
          paid_at: new Date().toISOString(),
          provider_transaction_id: verification.providerTransactionId,
          status: "completed",
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("[payfast-itn] Failed to update order:", updateError);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      // Update payment record (idempotent — use upsert-like logic)
      const { error: paymentUpdateError } = await serviceRoleClient
        .from("payments")
        .update({
          status: "paid",
          provider_transaction_id: verification.providerTransactionId,
          provider_response: verification.rawResponse,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", order.id)
        .eq("provider_code", "payfast");

      if (paymentUpdateError) {
        console.error("[payfast-itn] Failed to update payment record:", paymentUpdateError);
      }

      console.log(`[payfast-itn] Order ${order.order_number} marked as paid`);
    } else if (verification.paymentStatus === "failed") {
      await serviceRoleClient
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);

      await serviceRoleClient
        .from("payments")
        .update({ status: "failed", provider_response: verification.rawResponse })
        .eq("order_id", order.id)
        .eq("provider_code", "payfast");

      console.log(`[payfast-itn] Order ${order.order_number} marked as failed`);
    } else if (verification.paymentStatus === "cancelled") {
      await serviceRoleClient
        .from("orders")
        .update({ payment_status: "cancelled" })
        .eq("id", order.id);

      await serviceRoleClient
        .from("payments")
        .update({ status: "cancelled" })
        .eq("order_id", order.id)
        .eq("provider_code", "payfast");

      console.log(`[payfast-itn] Order ${order.order_number} marked as cancelled`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[payfast-itn] Handler error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
