"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/shop/CartProvider";

import { markWhatsAppSent, submitCheckout } from "./actions";

export function CheckoutClient() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [channel, setChannel] = useState<"whatsapp" | "email" | "both">("both");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    const result = await submitCheckout({
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      notes: String(formData.get("notes") || ""),
      channel,
      consent,
      turnstileToken: String(formData.get("cf-turnstile-response") || ""),
      website: String(formData.get("website") || ""),
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearCart();

    if (result.whatsappUrl) {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      await markWhatsAppSent(result.orderId);
    }

    router.push(`/order-confirmed/${result.orderId}`);
  };

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto text-center py-16">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add products before requesting a checkout quote.</p>
          <Button className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">Checkout request</h1>
          <p className="text-muted-foreground">Submit your details and choose WhatsApp, email, or both.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E3A5F]">Your details</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-5">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required minLength={2} placeholder="Your full name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required placeholder="+27821234567" inputMode="tel" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email optional</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" rows={5} placeholder="Delivery address, preferred install date, property type, or installation context" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Contact method</Label>
                  <select
                    id="channel"
                    name="channel"
                    value={channel}
                    onChange={(event) => setChannel(event.target.value as "whatsapp" | "email" | "both")}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="both">WhatsApp and email</option>
                    <option value="whatsapp">WhatsApp only</option>
                    <option value="email">Email only</option>
                  </select>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I consent to Aircons Store processing my details to respond to this quote request. I have read the <Link href="/privacy" className="text-[#1C99D6] underline">Privacy Policy</Link>.
                  </Label>
                </div>

                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-size="invisible" />
                )}

                {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

                <Button type="submit" disabled={loading || !consent} className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg">
                  {loading ? "Submitting..." : "Submit checkout request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit rounded-xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1E3A5F]">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-b pb-3 text-sm last:border-0">
                  <div>
                    <p className="font-medium text-[#1E3A5F]">{item.name}</p>
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice((item.sale_price_zar || item.price_zar) * item.quantity)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-lg font-semibold text-[#1E3A5F]">
                <span>Displayed total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Final total is recalculated securely from current product prices when you submit.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
