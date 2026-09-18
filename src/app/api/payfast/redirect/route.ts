import { NextRequest, NextResponse } from "next/server";
import { serviceRoleClient } from "@/lib/supabase-service";
import { getProvider } from "@/lib/payment/provider";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order");
  const token = searchParams.get("token");

  if (!orderId || !token) {
    return NextResponse.json({ error: "Missing order or token" }, { status: 400 });
  }

  // Validate UUID format
  const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRe.test(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  // Fetch order with secure token validation
  const { data: order, error } = await serviceRoleClient
    .from("orders")
    .select("id, order_number, secure_token, total_zar, name, phone, email, payment_status, payment_method")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Verify secure token
  if (order.secure_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Only allow Payfast redirect for payfast orders
  if (order.payment_method !== "payfast") {
    return NextResponse.json({ error: "Not a Payfast order" }, { status: 400 });
  }

  // Don't redirect if already paid
  if (order.payment_status === "paid") {
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(
      `${baseUrl}/order-confirmed/${order.id}?token=${order.secure_token}`
    );
  }

  const provider = getProvider("payfast");
  if (!provider) {
    return NextResponse.json({ error: "Payfast provider not available" }, { status: 500 });
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const result = await provider.createPayment({
      orderId: order.id,
      orderNumber: order.order_number,
      amountZar: order.total_zar,
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.phone,
      baseUrl,
      secureToken: order.secure_token,
    });

    // Update payment status to processing
    await serviceRoleClient
      .from("orders")
      .update({ payment_status: "processing" })
      .eq("id", order.id);

    await serviceRoleClient
      .from("payments")
      .update({ status: "processing" })
      .eq("order_id", order.id)
      .eq("provider_code", "payfast");

    console.log(`[payfast] Redirecting order ${order.order_number} to Payfast`);

    return NextResponse.redirect(result.redirectUrl);
  } catch (error) {
    console.error("[payfast] Redirect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment. Please try again." },
      { status: 500 }
    );
  }
}
