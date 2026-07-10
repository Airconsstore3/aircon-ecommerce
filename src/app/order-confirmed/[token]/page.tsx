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
  title: "Order Request Confirmed | Aircons Store",
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
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
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

export default async function OrderConfirmedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    notFound();
  }

  await rateLimitLookup(token);

  const { data: order } = await serviceRoleClient
    .from("orders")
    .select("id, created_at, name, phone, email, notes, items, total_zar, channel, status, whatsapp_url, expires_at")
    .eq("id", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!order) {
    notFound();
  }

  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];

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
            <Badge className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Request submitted</Badge>
            <CardTitle className="text-3xl font-normal text-[#1E3A5F]">Order request confirmed</CardTitle>
            <p className="text-sm text-muted-foreground">Reference: {order.id}</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="rounded-lg bg-[#F1F8FC] p-4 text-sm text-[#1E3A5F]">
              We received your request and will confirm product availability, delivery, and installation details before payment.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-[#1E3A5F]">{order.name}</p>
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
            </div>

            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap text-[#1E3A5F]">{order.notes}</p>
              </div>
            )}

            <div>
              <h2 className="mb-4 text-xl font-normal text-[#1E3A5F]">Items</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between gap-4 border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium text-[#1E3A5F]">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x {formatPrice(item.unit_price_zar)}</p>
                    </div>
                    <p className="font-medium text-[#1E3A5F]">{formatPrice(item.line_total_zar)}</p>
                  </div>
                ))}
              </div>
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
