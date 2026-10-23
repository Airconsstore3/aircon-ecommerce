"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
import { useCart } from "@/components/shop/CartProvider";
import { getCartBreakdown } from "@/lib/cart-pricing";
import { fetchEnabledProviders } from "./providers-action";
import type { KitConfiguration } from "@/types/installation-kit";

import { markWhatsAppSent, submitCheckout } from "./actions";

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

export function CheckoutClient() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [channel, setChannel] = useState<"whatsapp" | "email" | "both">("both");
  const [paymentMethod, setPaymentMethod] = useState<string>("manual_eft");
  const [providers, setProviders] = useState<Array<{ code: string; name: string; description: string | null }>>([]);

  // Fetch enabled payment providers on mount
  useEffect(() => {
    fetchEnabledProviders().then(setProviders).catch(() => {});
  }, []);

  // Set default payment method to first provider once loaded
  useEffect(() => {
    if (providers.length > 0 && !providers.some((p) => p.code === paymentMethod)) {
      setPaymentMethod(providers[0].code);
    }
  }, [providers, paymentMethod]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Display-only breakdown — resolveOrderPricing() is authoritative server-side.
  const breakdown = useMemo(() => getCartBreakdown(items), [items]);
  const grandTotal = breakdown.total;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");

    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const result = await submitCheckout({
      name: String(formData.get("name") || ""),
      lastName: String(formData.get("lastName") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      deliveryAddress: String(formData.get("deliveryAddress") || ""),
      deliveryCity: String(formData.get("deliveryCity") || ""),
      deliveryProvince: String(formData.get("deliveryProvince") || ""),
      installationNotes: String(formData.get("installationNotes") || ""),
      notes: String(formData.get("notes") || ""),
      channel,
      paymentMethod: paymentMethod as "manual_eft",
      consent,
      turnstileToken: String(formData.get("cf-turnstile-response") || ""),
      website: String(formData.get("website") || ""),
      idempotencyKey,
      items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        has_installation: item.has_installation,
        installation_tier_id: item.installation_tier_id,
        kit_configuration: item.kit_configuration as KitConfiguration | null | undefined,
        maintenance_plan_id: item.maintenance_plan_id,
        warranty_option_id: item.warranty_option_id,
      })),
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    clearCart();

    if (result.whatsappUrl) {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      await markWhatsAppSent(result.orderId, result.secureToken);
    }

    // Go to confirmation page with secure token — payment is arranged
    // manually after we confirm availability (enquiry model).
    router.push(`/order-confirmed/${result.orderId}?token=${result.secureToken}`);
  };

  if (items.length === 0) {
    return (
      <section className="commerce-flow min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto text-center py-16">
          <h1 className="font-medium text-[#0A2540] mb-3">Your cart is empty</h1>
          <p className="text-[#5F6B7A] mb-8">Add products before checking out.</p>
          <Button className="bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-none" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="commerce-flow min-h-screen bg-[#FAFBFC] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-semibold text-[#0A2540]">Checkout</h1>
          <p className="text-[#5F6B7A] text-sm mt-1">Submit your order request — no account or payment needed now. We&apos;ll confirm availability and send you payment and delivery details.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Left column - Checkout form */}
          <div>
            <form action={handleSubmit} className="space-y-6">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

              {/* Contact */}
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                <h2 className="font-medium text-[#0A2540] mb-4">Contact</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-sm text-[#0A2540]">First name</Label>
                    <Input id="firstName" name="name" required minLength={2} placeholder="John" className="h-[46px] rounded-none" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-sm text-[#0A2540]">Last name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" className="h-[46px] rounded-none" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm text-[#0A2540]">
                      Email{channel !== "whatsapp" && <span className="text-[#5F6B7A]"> (required for email updates)</span>}
                    </Label>
                    <Input id="email" name="email" type="email" required={channel !== "whatsapp"} placeholder="you@example.com" className="h-[46px] rounded-none" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-sm text-[#0A2540]">Phone</Label>
                    <Input id="phone" name="phone" required placeholder="+27821234567" inputMode="tel" className="h-[46px] rounded-none" />
                  </div>
                </div>
              </div>

              {/* Delivery & installation */}
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                <h2 className="font-medium text-[#0A2540] mb-4">Delivery & installation</h2>
                <p className="mb-4 text-sm text-[#5F6B7A]">
                  Delivery is free within Cape Town. Outside Cape Town — or for larger items — we&apos;ll confirm the delivery fee when we confirm your order.
                </p>
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="deliveryAddress" className="text-sm text-[#0A2540]">Address</Label>
                    <Input id="deliveryAddress" name="deliveryAddress" required placeholder="123 Main Street, Suburb" className="h-[46px] rounded-none" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="deliveryCity" className="text-sm text-[#0A2540]">City</Label>
                      <Input id="deliveryCity" name="deliveryCity" required placeholder="Johannesburg" className="h-[46px] rounded-none" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="deliveryProvince" className="text-sm text-[#0A2540]">Province</Label>
                      <select
                        id="deliveryProvince"
                        name="deliveryProvince"
                        className="h-[46px] w-full rounded-none border border-[#E5E7EB] bg-white px-3 text-sm text-[#0A2540]"
                        defaultValue=""
                      >
                        <option value="" disabled>Select province</option>
                        {SA_PROVINCES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="installationNotes" className="text-sm text-[#0A2540]">Installation notes (optional)</Label>
                    <Textarea id="installationNotes" name="installationNotes" rows={3} placeholder="Preferred install date, property type, roof access, etc." className="rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="notes" className="text-sm text-[#0A2540]">Order notes (optional)</Label>
                    <Textarea id="notes" name="notes" rows={2} placeholder="Anything else we should know about your order or delivery." className="rounded-md" />
                  </div>
                </div>
              </div>

              {/* Payment — manual EFT only for now */}
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                <h2 className="font-medium text-[#0A2540] mb-4">Payment</h2>
                <div className="space-y-3">
                  {(providers.length > 0 ? providers : [{ code: "manual_eft", name: "EFT — Direct bank transfer", description: null }]).map((provider) => (
                    <label
                      key={provider.code}
                      className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                        paymentMethod === provider.code
                          ? "border-[#1C99D6] bg-[#F1F8FC]"
                          : "border-[#E5E7EB] hover:border-[#C5D3E0]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={provider.code}
                        checked={paymentMethod === provider.code}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 accent-[#1C99D6]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0A2540]">{provider.name}</p>
                        <p className="text-xs text-[#5F6B7A] mt-0.5">
                          {provider.description ?? "EFT — direct payment to Aircons Store after we confirm your order."}
                        </p>
                      </div>
                    </label>
                  ))}
                  <p className="text-xs text-[#5F6B7A]">
                    No payment is taken now. Once we confirm availability, our banking details are shown on your order confirmation page — use your order number as the EFT reference.
                  </p>
                </div>
              </div>

              {/* Contact method */}
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-5">
                <h2 className="font-medium text-[#0A2540] mb-4">Contact method</h2>
                <select
                  id="channel"
                  name="channel"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as "whatsapp" | "email" | "both")}
                  className="h-[46px] w-full rounded-none border border-[#E5E7EB] bg-white px-3 text-sm text-[#0A2540]"
                >
                  <option value="both">WhatsApp and email</option>
                  <option value="whatsapp">WhatsApp only</option>
                  <option value="email">Email only</option>
                </select>
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-white p-5">
                <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} className="mt-0.5" />
                <Label htmlFor="consent" className="text-sm font-normal text-[#0A2540] leading-relaxed">
                  <span>
                    I consent to Aircons Store processing my details to fulfil this order. I have read the{" "}
                    <Link href="/privacy" className="font-medium text-[#1478A8] underline underline-offset-2 hover:text-[#0A2540]">Privacy Policy</Link>.
                  </span>
                </Label>
              </div>

              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-size="invisible" />
              )}

              {error && <p className="rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={loading || !consent} className="h-[48px] w-full bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-lg text-[15px] font-semibold">
                {loading ? "Processing..." : "Submit order request"}
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-[#5F6B7A]">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Secure checkout — no payment is taken now.
              </p>
            </form>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] px-5 py-3">
                <h2 className="font-medium text-[#1C99D6]">Your order</h2>
              </div>
              <div className="px-5 py-4 space-y-4">
                {items.map((item) => {
                  const unitPrice = item.sale_price_zar || item.price_zar;
                  return (
                    <div key={item.id} className="flex justify-between gap-4 pb-3 border-b border-[#F0F0F0] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A2540] line-clamp-2">{item.name}</p>
                        <p className="text-xs text-[#5F6B7A] mt-0.5">Qty {item.quantity}</p>
                        {item.variant && (
                          <p className="text-xs text-[#5F6B7A]">{item.variant}</p>
                        )}
                        {item.has_quoted_extras && (
                          <p className="text-xs text-[#B45309]">Options quoted separately</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#0A2540] whitespace-nowrap">
                        {item.is_enquiry_only ? "Price on request" : formatPrice(unitPrice * item.quantity)}
                      </p>
                    </div>
                  );
                })}

                {/* Price breakdown */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-[#5F6B7A]">
                    <span>Subtotal</span>
                    <span>{formatPrice(breakdown.subtotal)}</span>
                  </div>
                  {breakdown.installationTotal > 0 && (
                    <div className="flex justify-between text-[#5F6B7A]">
                      <span>Installation</span>
                      <span>{formatPrice(breakdown.installationTotal)}</span>
                    </div>
                  )}
                  {breakdown.kitTotal > 0 && (
                    <div className="flex justify-between text-[#5F6B7A]">
                      <span>Installation kit</span>
                      <span>{formatPrice(breakdown.kitTotal)}</span>
                    </div>
                  )}
                  {breakdown.maintenanceTotal > 0 && (
                    <div className="flex justify-between text-[#5F6B7A]">
                      <span>Maintenance</span>
                      <span>{formatPrice(breakdown.maintenanceTotal)}</span>
                    </div>
                  )}
                  {breakdown.warrantyTotal > 0 && (
                    <div className="flex justify-between text-[#5F6B7A]">
                      <span>Warranty</span>
                      <span>{formatPrice(breakdown.warrantyTotal)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm text-[#5F6B7A]">
                  <span>Delivery</span>
                  <span className="text-right">Confirmed with your order</span>
                </div>

                <div className="flex justify-between text-lg font-semibold text-[#0A2540] pt-2 border-t border-[#E5E7EB]">
                  <span>Total</span>
                  <span>{breakdown.hasPricedItems ? formatPrice(grandTotal) : "On request"}</span>
                </div>

                {breakdown.hasEnquiryItems && (
                  <p className="text-xs text-[#5F6B7A] pt-1">
                    Excludes items priced on request — we&apos;ll quote these when we confirm your order.
                  </p>
                )}
                {breakdown.hasQuotedExtras && (
                  <p className="text-xs text-[#5F6B7A]">
                    Some selected options are quoted separately and aren&apos;t included in this total.
                  </p>
                )}

                <p className="text-xs text-[#5F6B7A] pt-1">
                  Final total is calculated securely from current prices when you submit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
