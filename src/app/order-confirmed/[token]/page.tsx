import { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceRoleClient } from "@/lib/supabase-service";

import { LeadTracking } from "./LeadTracking";
import { PrintButton } from "./PrintButton";
import { WhatsAppButton } from "./WhatsAppButton";

export const metadata: Metadata = {
  title: "Order Confirmed | Aircons Store",
  robots: {
    index: false,
    follow: false,
  },
};

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price_zar: number;
  line_total_zar: number;
  has_installation?: boolean;
  installation_price_zar?: number;
  kit_price_zar?: number;
  maintenance_plan_id?: string | null;
  maintenance_price_zar?: number;
  warranty_option_id?: string | null;
  warranty_price_zar?: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

async function rateLimitLookup(token: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !redisToken) {
    return;
  }

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || headersList.get("x-real-ip") || "unknown";
  const key = `order_lookup:${ip}:${token.slice(0, 8)}`;

  const increment = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: "no-store",
  });
  const json = await increment.json();
  const count = Number(json.result || 0);

  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/600`, {
      headers: { Authorization: `Bearer ${redisToken}` },
      cache: "no-store",
    });
  }

  if (count > 20) {
    notFound();
  }
}

const PAYMENT_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Payment Pending", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  processing: { label: "Payment Processing", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  paid: { label: "Payment Confirmed", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  failed: { label: "Payment Failed", className: "bg-red-100 text-red-700 hover:bg-red-100" },
  cancelled: { label: "Payment Cancelled", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  refunded: { label: "Refunded", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
};

export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ token?: string; cancelled?: string }>;
}) {
  const { token: orderToken } = await params;
  const { token: secureToken, cancelled } = await searchParams;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderToken)) {
    notFound();
  }

  await rateLimitLookup(orderToken);

  const { data: order } = await serviceRoleClient
    .from("orders")
    .select(`
      id, order_number, created_at, name, last_name, phone, email,
      delivery_address, delivery_city, delivery_province, installation_notes, notes,
      items, total_zar, subtotal_zar, installation_total_zar, kit_total_zar,
      maintenance_total_zar, warranty_total_zar,
      channel, status, whatsapp_url, expires_at,
      payment_status, payment_method, secure_token
    `)
    .eq("id", orderToken)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!order) {
    notFound();
  }

  // Verify secure token
  if (order.secure_token !== secureToken) {
    notFound();
  }

  // Fetch banking details for Manual EFT
  let bankingDetails: {
    bank_name: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
    bank_branch_code: string | null;
    bank_reference_prefix: string | null;
  } | null = null;

  if (order.payment_method === "manual_eft") {
    const { data: settings } = await serviceRoleClient
      .from("settings")
      .select("bank_name, bank_account_name, bank_account_number, bank_branch_code, bank_reference_prefix")
      .single();

    bankingDetails = settings;
  }

  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
  const paymentStatusInfo = PAYMENT_STATUS_STYLES[order.payment_status] || PAYMENT_STATUS_STYLES.pending;
  const orderRef = order.order_number || order.id;

  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <LeadTracking value={order.total_zar} email={order.email} phone={order.phone} itemIds={items.map((item) => item.product_id)} />
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; }
          section { padding: 0 !important; }
          .print-card { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>
      <div className="container max-w-3xl mx-auto">
        <Card className="print-card rounded-xl border-0 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge className={paymentStatusInfo.className}>{paymentStatusInfo.label}</Badge>
              {cancelled === "1" && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Payment Cancelled</Badge>
              )}
            </div>
            <CardTitle className="text-3xl font-normal text-[#1E3A5F]">
              {order.payment_status === "paid" ? "Order confirmed" : "Order received"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Order: {orderRef}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Status message */}
            <div className={`rounded-lg p-4 text-sm ${order.payment_status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-[#F1F8FC] text-[#1E3A5F]"}`}>
              {order.payment_status === "paid" && (
                <p>Your payment has been confirmed. We will contact you shortly to arrange delivery and installation.</p>
              )}
              {order.payment_status === "pending" && order.payment_method === "manual_eft" && (
                <p>Your order has been received. Please complete the bank transfer below to confirm your order.</p>
              )}
              {order.payment_status === "pending" && order.payment_method === "payfast" && (
                <div className="space-y-3">
                  <p>Your order has been received. Complete your payment securely via Payfast.</p>
                  <form action={`/api/payfast/redirect?order=${order.id}&token=${order.secure_token}`} method="GET">
                    <Button type="submit" className="bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-none">
                      Pay securely via Payfast
                    </Button>
                  </form>
                </div>
              )}
              {order.payment_status === "processing" && (
                <p>Your payment is being processed. Please wait while we confirm.</p>
              )}
              {order.payment_status === "failed" && (
                <p>Your payment could not be completed. Please try again or contact us for assistance.</p>
              )}
              {order.payment_status === "cancelled" && (
                <p>Your payment was cancelled. You can try again or contact us for assistance.</p>
              )}
            </div>

            {/* Manual EFT banking details */}
            {order.payment_method === "manual_eft" && order.payment_status !== "paid" && bankingDetails && (
              <div className="rounded-lg border border-[#E5E7EB] p-5 space-y-3">
                <h3 className="text-lg font-medium text-[#1E3A5F]">Banking Details</h3>
                <p className="text-sm text-muted-foreground">Please use your order number as the payment reference.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {bankingDetails.bank_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Bank</p>
                      <p className="font-medium text-[#1E3A5F]">{bankingDetails.bank_name}</p>
                    </div>
                  )}
                  {bankingDetails.bank_account_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Account name</p>
                      <p className="font-medium text-[#1E3A5F]">{bankingDetails.bank_account_name}</p>
                    </div>
                  )}
                  {bankingDetails.bank_account_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">Account number</p>
                      <p className="font-medium text-[#1E3A5F]">{bankingDetails.bank_account_number}</p>
                    </div>
                  )}
                  {bankingDetails.bank_branch_code && (
                    <div>
                      <p className="text-xs text-muted-foreground">Branch code</p>
                      <p className="font-medium text-[#1E3A5F]">{bankingDetails.bank_branch_code}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Reference</p>
                    <p className="font-medium text-[#1E3A5F]">{orderRef}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount due</p>
                    <p className="font-medium text-[#1E3A5F]">{formatPrice(order.total_zar)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-[#1E3A5F]">
                  {order.name}{order.last_name ? ` ${order.last_name}` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-[#1E3A5F]">{order.phone}</p>
              </div>
              {order.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-[#1E3A5F]">{order.email}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Contact method</p>
                <p className="font-medium capitalize text-[#1E3A5F]">{order.channel}</p>
              </div>
              {order.delivery_address && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Delivery address</p>
                  <p className="font-medium text-[#1E3A5F]">
                    {order.delivery_address}
                    {order.delivery_city ? `, ${order.delivery_city}` : ""}
                    {order.delivery_province ? `, ${order.delivery_province}` : ""}
                  </p>
                </div>
              )}
            </div>

            {order.installation_notes && (
              <div>
                <p className="text-sm text-muted-foreground">Installation notes</p>
                <p className="whitespace-pre-wrap text-[#1E3A5F]">{order.installation_notes}</p>
              </div>
            )}

            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap text-[#1E3A5F]">{order.notes}</p>
              </div>
            )}

            {/* Order items */}
            <div>
              <h2 className="mb-4 text-xl font-normal text-[#1E3A5F]">Items</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between gap-4 border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-[#1E3A5F]">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.unit_price_zar)}</p>
                      {item.has_installation && item.installation_price_zar ? (
                        <p className="text-xs text-muted-foreground">incl. installation ({formatPrice(item.installation_price_zar)})</p>
                      ) : null}
                      {item.kit_price_zar ? (
                        <p className="text-xs text-muted-foreground">incl. kit ({formatPrice(item.kit_price_zar)})</p>
                      ) : null}
                      {item.maintenance_price_zar ? (
                        <p className="text-xs text-muted-foreground">incl. maintenance ({formatPrice(item.maintenance_price_zar)})</p>
                      ) : null}
                      {item.warranty_price_zar ? (
                        <p className="text-xs text-muted-foreground">incl. warranty ({formatPrice(item.warranty_price_zar)})</p>
                      ) : null}
                    </div>
                    <p className="font-medium text-[#1E3A5F]">{formatPrice(item.line_total_zar)}</p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              {(order.installation_total_zar > 0 || order.kit_total_zar > 0 || order.maintenance_total_zar > 0 || order.warranty_total_zar > 0) && (
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal_zar)}</span>
                  </div>
                  {order.installation_total_zar > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Installation</span>
                      <span>{formatPrice(order.installation_total_zar)}</span>
                    </div>
                  )}
                  {order.kit_total_zar > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Installation kits</span>
                      <span>{formatPrice(order.kit_total_zar)}</span>
                    </div>
                  )}
                  {order.maintenance_total_zar > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Maintenance</span>
                      <span>{formatPrice(order.maintenance_total_zar)}</span>
                    </div>
                  )}
                  {order.warranty_total_zar > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Warranty</span>
                      <span>{formatPrice(order.warranty_total_zar)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 flex justify-between border-t pt-4 text-xl font-semibold text-[#1E3A5F]">
                <span>Total</span>
                <span>{formatPrice(order.total_zar)}</span>
              </div>
            </div>

            <div className="no-print flex flex-col gap-3 sm:flex-row">
              {order.whatsapp_url && <WhatsAppButton orderId={order.id} whatsappUrl={order.whatsapp_url} />}
              <PrintButton />
              <Button variant="outline" className="rounded-lg" asChild>
                <Link href="/products">Continue browsing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
