"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/shop/CartProvider";
import { fetchEnabledProviders } from "./providers-action";

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

  // Calculate breakdown from cart items
  const breakdown = useMemo(() => {
    let subtotal = 0;
    let installationTotal = 0;
    let kitTotal = 0;
    let maintenanceTotal = 0;
    let warrantyTotal = 0;

    for (const item of items) {
      const base = item.sale_price_zar || item.price_zar;
      const install = item.installation_price_zar ?? 0;
      const kit = item.kit_price_zar ?? 0;
      const maint = item.maintenance_price_zar ?? 0;
      const warranty = item.warranty_price_zar ?? 0;

      subtotal += base * item.quantity;
      installationTotal += install * item.quantity;
      kitTotal += kit * item.quantity;
      maintenanceTotal += maint * item.quantity;
      warrantyTotal += warranty * item.quantity;
    }

    return { subtotal, installationTotal, kitTotal, maintenanceTotal, warrantyTotal };
  }, [items]);

  // Grand total = subtotal + all add-ons. Matches the cart page and the
  // server-side resolveOrderPricing total (server is authoritative).
  const grandTotal =
    breakdown.subtotal +
    breakdown.installationTotal +
    breakdown.kitTotal +
    breakdown.maintenanceTotal +
    breakdown.warrantyTotal;

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
      paymentMethod: paymentMethod as "payfast" | "manual_eft",
      consent,
      turnstileToken: String(formData.get("cf-turnstile-response") || ""),
      website: String(formData.get("website") || ""),
      idempotencyKey,
      items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        has_installation: item.has_installation,
        installation_tier_id: item.installation_tier_id,
        kit_configuration: item.kit_configuration,
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
      await markWhatsAppSent(result.orderId);
    }

    // If Payfast, redirect to payment gateway
    if (result.paymentRedirectUrl && result.paymentMethod === "payfast") {
      window.location.href = result.paymentRedirectUrl;
      return;
    }

    // Otherwise go to confirmation page with secure token
    router.push(`/order-confirmed/${result.orderId}?token=${result.secureToken}`);
  };

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto text-center py-16">
          <h1 className="text-2xl font-medium text-[#0A2540] mb-3">Your cart is empty</h1>
          <p className="text-[#5F6B7A] mb-8">Add products before checking out.</p>
          <Button className="bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-none" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-[#0A2540] mb-2">Checkout</h1>
          <p className="text-[#5F6B7A] text-sm">Complete your order securely. No account required.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          {/* Left column - Checkout form */}
          <div className="space-y-8">
            <form action={handleSubmit} className="space-y-8">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

              {/* Contact */}
              <div>
                <h2 className="text-lg font-medium text-[#0A2540] mb-4">Contact</h2>
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
                    <Label htmlFor="email" className="text-sm text-[#0A2540]">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" className="h-[46px] rounded-none" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-sm text-[#0A2540]">Phone</Label>
                    <Input id="phone" name="phone" required placeholder="+27821234567" inputMode="tel" className="h-[46px] rounded-none" />
                  </div>
                </div>
              </div>

              {/* Delivery & installation */}
              <div className="border-t border-[#E5E7EB] pt-8">
                <h2 className="text-lg font-medium text-[#0A2540] mb-4">Delivery & installation</h2>
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
                    <Textarea id="installationNotes" name="installationNotes" rows={3} placeholder="Preferred install date, property type, roof access, etc." className="rounded-none" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              {providers.length > 0 && (
                <div className="border-t border-[#E5E7EB] pt-8">
                  <h2 className="text-lg font-medium text-[#0A2540] mb-4">Payment</h2>
                  <div className="space-y-3">
                    {providers.map((provider) => (
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
                          {provider.description && (
                            <p className="text-xs text-[#5F6B7A] mt-0.5">{provider.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact method */}
              <div className="border-t border-[#E5E7EB] pt-8">
                <h2 className="text-lg font-medium text-[#0A2540] mb-4">Contact method</h2>
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
              <div className="flex items-start gap-3 pt-4">
                <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} />
                <Label htmlFor="consent" className="text-sm text-[#5F6B7A] leading-relaxed">
                  I consent to Aircons Store processing my details to fulfil this order. I have read the <Link href="/privacy" className="text-[#1C99D6] underline">Privacy Policy</Link>.
                </Label>
              </div>

              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-size="invisible" />
              )}

              {error && <p className="rounded-sm bg-red-50 p-3 text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={loading || !consent} className="h-[48px] w-full bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-none text-[15px] font-semibold">
                {loading
                  ? "Processing..."
                  : paymentMethod === "payfast"
                    ? "Pay securely"
                    : "Place order"}
              </Button>
            </form>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] px-5 py-4">
                <h2 className="text-lg font-medium text-[#0A2540]">Order summary</h2>
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
                      </div>
                      <p className="text-sm font-medium text-[#0A2540] whitespace-nowrap">
                        {item.is_enquiry_only ? "Price TBC" : formatPrice(unitPrice * item.quantity)}
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

                <div className="flex justify-between text-lg font-semibold text-[#0A2540] pt-2 border-t border-[#E5E7EB]">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>

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
