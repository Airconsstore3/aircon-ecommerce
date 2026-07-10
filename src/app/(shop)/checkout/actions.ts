"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { serviceRoleClient } from "@/lib/supabase-service";

const itemSchema = z.object({
  id: z.string(), // Accept composite IDs, will extract base UUID later
  quantity: z.coerce.number().int().min(1).max(99),
});

const checkoutSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(9),
  email: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional(),
  channel: z.enum(["whatsapp", "email", "both"]),
  consent: z.boolean().refine((value) => value === true, "Consent is required."),
  turnstileToken: z.string().optional(),
  website: z.string().max(0),
  items: z.array(itemSchema).min(1),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

type CheckoutResult =
  | { success: true; orderId: string; confirmationUrl: string; whatsappUrl: string | null }
  | { success: false; error: string };

function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");

  if (/^\+27[0-9]{9}$/.test(compact)) {
    return compact;
  }

  if (/^0[0-9]{9}$/.test(compact)) {
    return `+27${compact.slice(1)}`;
  }

  if (/^27[0-9]{9}$/.test(compact)) {
    return `+${compact}`;
  }

  throw new Error("Enter a valid South African phone number in E.164 format, for example +27821234567.");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildWhatsAppMessage(order: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  total_zar: number;
  items: Array<{ name: string; quantity: number; line_total_zar: number }>;
}) {
  const lines = [
    `New checkout request: ${order.id}`,
    "",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    order.email ? `Email: ${order.email}` : null,
    "",
    "Items:",
    ...order.items.map((item) => `${item.quantity} x ${item.name} - ${formatMoney(item.line_total_zar)}`),
    "",
    `Total: ${formatMoney(order.total_zar)}`,
    order.notes ? "" : null,
    order.notes ? `Notes: ${order.notes}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

async function verifyTurnstile(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return;
  }

  if (!token) {
    throw new Error("Security check failed. Please try again.");
  }

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

  if (!url || !token) {
    return;
  }

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

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    const parsed = checkoutSchema.parse(input);
    const phone = normalizePhone(parsed.phone);

    await rateLimit();
    await verifyTurnstile(parsed.turnstileToken);

    // Extract base UUIDs from composite cart IDs (UUID is 36 chars, variants appended after)
    const UUID_RE = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
    const productIds = parsed.items.map((item) => {
      const match = item.id.match(UUID_RE);
      return match ? match[1] : item.id;
    });
    const { data: products, error: productsError } = await serviceRoleClient
      .from("products")
      .select("id, name, slug, price_zar, sale_price_zar, images, is_published")
      .in("id", productIds)
      .eq("is_published", true);

    if (productsError) {
      throw productsError;
    }

    if (!products || products.length !== productIds.length) {
      throw new Error("One or more cart items are no longer available.");
    }

    const items = parsed.items.map((item) => {
      const match = item.id.match(UUID_RE);
      const baseId = match ? match[1] : item.id;
      const product = products.find((candidate) => candidate.id === baseId);

      if (!product) {
        throw new Error("One or more cart items are no longer available.");
      }

      const unitPrice = product.sale_price_zar || product.price_zar;

      return {
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        image: Array.isArray(product.images) ? product.images[0] || null : null,
        quantity: item.quantity,
        unit_price_zar: unitPrice,
        line_total_zar: unitPrice * item.quantity,
      };
    });

    const totalZar = items.reduce((sum, item) => sum + item.line_total_zar, 0);
    const whatsappNumber = parsed.channel === "email" ? null : await getWhatsAppNumber();
    const baseUrl = await getBaseUrl();

    const { data: order, error: orderError } = await serviceRoleClient
      .from("orders")
      .insert({
        name: parsed.name,
        phone,
        email: parsed.email || null,
        notes: parsed.notes || null,
        items,
        total_zar: totalZar,
        channel: parsed.channel,
        consent_accepted: true,
      })
      .select("id, name, phone, email, notes, total_zar")
      .single();

    if (orderError) {
      throw orderError;
    }

    const whatsappUrl = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          buildWhatsAppMessage({ ...order, items })
        )}`
      : null;

    if (whatsappUrl) {
      await serviceRoleClient
        .from("orders")
        .update({ whatsapp_url: whatsappUrl })
        .eq("id", order.id);
    }

    return {
      success: true,
      orderId: order.id,
      confirmationUrl: `${baseUrl}/order-confirmed/${order.id}`,
      whatsappUrl,
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
