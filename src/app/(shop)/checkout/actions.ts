"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { serviceRoleClient } from "@/lib/supabase-service";
import { resolveOrderPricing, CartItemConfig } from "@/lib/server-pricing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonClient = createClient((supabaseUrl || "").trim(), (supabaseAnonKey || "").trim());

// ─── Validation schemas ──────────────────────────────────────────────────────

const itemSchema = z.object({
  id: z.string(),
  quantity: z.coerce.number().int().min(1).max(99),
  has_installation: z.boolean().optional(),
  installation_tier_id: z.string().optional(),
  kit_configuration: z.any().optional(),
  maintenance_plan_id: z.string().nullable().optional(),
  warranty_option_id: z.string().nullable().optional(),
});

const checkoutSchema = z.object({
  name: z.string().trim().min(2),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().min(9),
  email: z.string().trim().email().optional().or(z.literal("")),
  deliveryAddress: z.string().trim().min(5, "Delivery address is required."),
  deliveryCity: z.string().trim().min(2, "City is required."),
  deliveryProvince: z.string().trim().optional(),
  installationNotes: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(2000).optional(),
  channel: z.enum(["whatsapp", "email", "both"]),
  paymentMethod: z.enum(["payfast", "manual_eft"]),
  consent: z.boolean().refine((value) => value === true, "Consent is required."),
  turnstileToken: z.string().optional(),
  website: z.string().max(0),
  idempotencyKey: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

type CheckoutResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      secureToken: string;
      confirmationUrl: string;
      whatsappUrl: string | null;
      paymentMethod: string;
      paymentRedirectUrl: string | null;
    }
  | { success: false; error: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");

  if (/^\+27[0-9]{9}$/.test(compact)) return compact;
  if (/^0[0-9]{9}$/.test(compact)) return `+27${compact.slice(1)}`;
  if (/^27[0-9]{9}$/.test(compact)) return `+${compact}`;

  throw new Error("Enter a valid South African phone number, e.g. +27821234567.");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildWhatsAppMessage(order: {
  orderNumber: string;
  name: string;
  phone: string;
  email: string | null;
  deliveryAddress: string;
  total_zar: number;
  items: Array<{
    product_name: string;
    quantity: number;
    line_total_zar: number;
    has_installation: boolean;
    maintenance_plan_id: string | null;
    warranty_option_id: string | null;
  }>;
  paymentMethod: string;
}) {
  const lines = [
    `New order: ${order.orderNumber}`,
    "",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    order.email ? `Email: ${order.email}` : null,
    `Address: ${order.deliveryAddress}`,
    "",
    "Items:",
    ...order.items.map(
      (item) =>
        `${item.quantity} x ${item.product_name} - ${formatMoney(item.line_total_zar)}` +
        (item.has_installation ? " (incl. installation)" : "") +
        (item.maintenance_plan_id ? " (+ maintenance)" : "") +
        (item.warranty_option_id ? " (+ warranty)" : "")
    ),
    "",
    `Total: ${formatMoney(order.total_zar)}`,
    `Payment: ${order.paymentMethod === "payfast" ? "Payfast" : "Manual EFT"}`,
  ].filter(Boolean);

  return lines.join("\n");
}

async function verifyTurnstile(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return;
  if (!token) throw new Error("Security check failed. Please try again.");

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error("Security check failed. Please try again.");
  }
}

async function rateLimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || headersList.get("x-real-ip") || "unknown";
  const key = `checkout:${ip}`;

  const increment = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const incrementJson = await increment.json();
  const count = Number(incrementJson.result || 0);

  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/600`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  }

  if (count > 5) {
    throw new Error("Too many checkout attempts. Please wait 10 minutes and try again.");
  }
}

async function getBaseUrl() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host") || "airconsstore.co.za";
  return `${protocol}://${host}`;
}

async function getWhatsAppNumber() {
  const { data } = await serviceRoleClient
    .from("settings")
    .select("whatsapp_number")
    .single();

  if (!data?.whatsapp_number) {
    throw new Error("Business WhatsApp number is not configured.");
  }

  return normalizePhone(data.whatsapp_number).replace("+", "");
}

async function generateOrderNumber(): Promise<string> {
  const { data, error } = await serviceRoleClient.rpc("generate_order_number");
  if (error || !data) {
    const ts = Date.now().toString().slice(-6);
    return `AIR-${new Date().getFullYear()}-${ts}`;
  }
  return data as string;
}

// ─── Main checkout action ────────────────────────────────────────────────────

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const parsed = checkoutSchema.parse(input);
    const phone = normalizePhone(parsed.phone);

    await rateLimit();
    await verifyTurnstile(parsed.turnstileToken);

    // ─── Idempotency check ──────────────────────────────────────────────────
    if (parsed.idempotencyKey) {
      const { data: existing } = await serviceRoleClient
        .from("orders")
        .select("id, order_number, secure_token")
        .eq("idempotency_key", parsed.idempotencyKey)
        .maybeSingle();

      if (existing) {
        const baseUrl = await getBaseUrl();
        return {
          success: true,
          orderId: existing.id,
          orderNumber: existing.order_number,
          secureToken: existing.secure_token,
          confirmationUrl: `${baseUrl}/order-confirmed/${existing.id}?token=${existing.secure_token}`,
          whatsappUrl: null,
          paymentMethod: parsed.paymentMethod,
          paymentRedirectUrl: null,
        };
      }
    }

    // ─── Validate payment method is enabled ─────────────────────────────────
    const { data: provider } = await serviceRoleClient
      .from("payment_providers")
      .select("code, is_enabled")
      .eq("code", parsed.paymentMethod)
      .single();

    if (!provider || !provider.is_enabled) {
      throw new Error("Selected payment method is not available.");
    }

    // ─── Server-side price resolution ───────────────────────────────────────
    const cartItems: CartItemConfig[] = parsed.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      has_installation: item.has_installation,
      installation_tier_id: item.installation_tier_id,
      kit_configuration: item.kit_configuration,
      maintenance_plan_id: item.maintenance_plan_id ?? undefined,
      warranty_option_id: item.warranty_option_id ?? undefined,
    }));

    const pricing = await resolveOrderPricing(cartItems);

    if (pricing.items.length === 0) {
      throw new Error("Your cart appears to be empty.");
    }

    // ─── Generate order number ──────────────────────────────────────────────
    const orderNumber = await generateOrderNumber();

    // ─── Create order ───────────────────────────────────────────────────────
    const orderPayload = {
      order_number: orderNumber,
      name: parsed.name,
      last_name: parsed.lastName || null,
      phone,
      email: parsed.email || null,
      customer_email: parsed.email || null,
      delivery_address: parsed.deliveryAddress,
      delivery_city: parsed.deliveryCity,
      delivery_province: parsed.deliveryProvince || null,
      installation_notes: parsed.installationNotes || null,
      notes: parsed.notes || null,
      items: pricing.items.map((item) => ({
        product_id: item.product_id,
        name: item.product_name,
        slug: item.product_slug,
        quantity: item.quantity,
        unit_price_zar: item.base_unit_price_zar + item.installation_price_zar + item.kit_price_zar + item.maintenance_price_zar + item.warranty_price_zar,
        line_total_zar: item.line_total_zar,
        has_installation: item.has_installation,
        installation_price_zar: item.installation_price_zar,
        kit_price_zar: item.kit_price_zar,
        maintenance_plan_id: item.maintenance_plan_id,
        maintenance_price_zar: item.maintenance_price_zar,
        warranty_option_id: item.warranty_option_id,
        warranty_price_zar: item.warranty_price_zar,
      })),
      total_zar: pricing.total_zar,
      subtotal_zar: pricing.subtotal_zar,
      installation_total_zar: pricing.installation_total_zar,
      kit_total_zar: pricing.kit_total_zar,
      maintenance_total_zar: pricing.maintenance_total_zar,
      warranty_total_zar: pricing.warranty_total_zar,
      channel: parsed.channel,
      consent_accepted: true,
      payment_method: parsed.paymentMethod,
      payment_status: "pending",
      payment_provider: parsed.paymentMethod,
      idempotency_key: parsed.idempotencyKey || null,
    } as const;

    console.log(`[checkout] Creating order ${orderNumber}`, {
      total: pricing.total_zar,
      items: pricing.items.length,
      paymentMethod: parsed.paymentMethod,
    });

    const { data: order, error: orderError } = await serviceRoleClient
      .from("orders")
      .insert(orderPayload)
      .select("id, order_number, secure_token, total_zar, name, phone, email, delivery_address")
      .single();

    if (orderError || !order) {
      console.error("[checkout] Order creation error:", orderError);
      throw new Error("We couldn't complete your order. Please try again.");
    }

    // ─── Insert order_items (normalised snapshot) ───────────────────────────
    const orderItemsRows = pricing.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name_snapshot: item.product_name,
      product_slug: item.product_slug,
      quantity: item.quantity,
      base_unit_price_zar: item.base_unit_price_zar,
      has_installation: item.has_installation,
      installation_tier_id: item.installation_tier_id,
      installation_price_zar: item.installation_price_zar,
      kit_configuration: item.kit_configuration ?? {},
      kit_price_zar: item.kit_price_zar,
      maintenance_plan_id: item.maintenance_plan_id,
      maintenance_price_zar: item.maintenance_price_zar,
      warranty_option_id: item.warranty_option_id,
      warranty_price_zar: item.warranty_price_zar,
      line_total_zar: item.line_total_zar,
    }));

    const { error: itemsError } = await serviceRoleClient
      .from("order_items")
      .insert(orderItemsRows);

    if (itemsError) {
      console.error("[checkout] Order items creation error:", itemsError);
    }

    // ─── Create initial payment record ─────────────────────────────────────
    const { error: paymentError } = await serviceRoleClient
      .from("payments")
      .insert({
        order_id: order.id,
        provider_code: parsed.paymentMethod,
        amount_zar: pricing.total_zar,
        status: "pending",
        payment_reference: orderNumber,
      });

    if (paymentError) {
      console.error("[checkout] Payment record creation error:", paymentError);
    }

    // ─── Build WhatsApp message ─────────────────────────────────────────────
    const whatsappNumber = parsed.channel === "email" ? null : await getWhatsAppNumber();
    const baseUrl = await getBaseUrl();

    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          buildWhatsAppMessage({
            orderNumber: order.order_number,
            name: order.name,
            phone: order.phone,
            email: order.email,
            deliveryAddress: order.delivery_address,
            total_zar: order.total_zar,
            items: pricing.items,
            paymentMethod: parsed.paymentMethod,
          })
        )}`
      : null;

    if (whatsappUrl) {
      await serviceRoleClient
        .from("orders")
        .update({ whatsapp_url: whatsappUrl, status: "sent_whatsapp" })
        .eq("id", order.id);
    }

    // ─── Generate Payfast redirect URL if needed ────────────────────────────
    let paymentRedirectUrl: string | null = null;

    if (parsed.paymentMethod === "payfast") {
      paymentRedirectUrl = `${baseUrl}/api/payfast/redirect?order=${order.id}&token=${order.secure_token}`;
    }

    console.log(`[checkout] Order ${orderNumber} created successfully`, {
      orderId: order.id,
      total: pricing.total_zar,
      paymentMethod: parsed.paymentMethod,
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      secureToken: order.secure_token,
      confirmationUrl: `${baseUrl}/order-confirmed/${order.id}?token=${order.secure_token}`,
      whatsappUrl,
      paymentMethod: parsed.paymentMethod,
      paymentRedirectUrl,
    };
  } catch (error) {
    console.error("[checkout] submitCheckout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed. Please try again.",
    };
  }
}

export async function markWhatsAppSent(orderId: string) {
  await serviceRoleClient
    .from("orders")
    .update({ status: "sent_whatsapp" })
    .eq("id", orderId);
}
