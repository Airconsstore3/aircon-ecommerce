"use client";

import { Button } from "@/components/ui/button";
import { Truck, BadgeCheck, X } from "lucide-react";
import { useCart } from "@/components/shop/CartProvider";
import { getCartBreakdown } from "@/lib/cart-pricing";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQty, itemCount } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Display-only breakdown — the server re-resolves pricing at checkout time.
  const breakdown = getCartBreakdown(items);

  if (items.length === 0) {
    return (
      <section className="commerce-flow min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center py-16">
            <h1 className="font-medium text-[#0A2540] mb-2">
              Your cart is empty
            </h1>
            <p className="text-[#5F6B7A] mb-8">
              Start adding products to request a quote
            </p>
            <Button
              className="bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-lg"
              asChild
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="commerce-flow min-h-screen bg-[#FAFBFC] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-6xl mx-auto">
        {/* Page Heading */}
        <div className="mb-6">
          <h1 className="font-semibold text-[#0A2540]">Cart</h1>
          <p className="text-[#5F6B7A] text-sm mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* Left column - Cart items table + info banners */}
          <div className="space-y-4">
            <div className="rounded-lg border border-[#E5E7EB] bg-white overflow-hidden">
              {/* Table header — desktop only */}
              <div className="hidden md:grid grid-cols-[1fr_120px_140px_120px] gap-4 border-b border-[#E5E7EB] bg-[#F8FAFC] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#5F6B7A]">
                <span>Product</span>
                <span className="text-right">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Subtotal</span>
              </div>

              {/* Rows */}
              <ul className="divide-y divide-[#F0F0F0]">
                {items.map((item) => {
                  const unitPrice = item.sale_price_zar || item.price_zar;
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <li key={item.id} className="px-4 py-4 md:px-5">
                      <div className="grid gap-3 md:grid-cols-[1fr_120px_140px_120px] md:items-center md:gap-4">
                        {/* Product cell */}
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-red-400 hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1C99D6]"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                          <Link
                            href={`/products/${item.slug}`}
                            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#F5F5F5]"
                          >
                            {item.images[0] && (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            )}
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-sm font-medium text-[#0A2540] line-clamp-2 hover:text-[#1C99D6]"
                            >
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="text-xs text-[#5F6B7A] mt-0.5 line-clamp-2">
                                {item.variant}
                              </p>
                            )}
                            {item.has_quoted_extras && (
                              <p className="text-xs text-[#B45309] mt-0.5">
                                Includes options quoted separately
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <p className="hidden md:block text-right text-sm text-[#0A2540]">
                          {item.is_enquiry_only ? "On request" : formatPrice(unitPrice)}
                        </p>

                        {/* Quantity */}
                        <div className="flex items-center justify-between md:justify-center">
                          <div className="flex items-center rounded-full border border-[#E5E5E5]">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center text-[#0A2540] hover:bg-[#F5F5F5] rounded-l-full transition-colors text-sm"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="flex h-8 w-8 items-center justify-center text-[13px] font-medium text-[#0A2540]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center text-[#0A2540] hover:bg-[#F5F5F5] rounded-r-full transition-colors text-sm"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          {/* Line total — mobile only */}
                          <p className="text-sm font-semibold text-[#0A2540] md:hidden">
                            {item.is_enquiry_only ? "On request" : formatPrice(lineTotal)}
                          </p>
                        </div>

                        {/* Line subtotal — desktop */}
                        <p className="hidden md:block text-right text-sm font-semibold text-[#0A2540]">
                          {item.is_enquiry_only ? "On request" : formatPrice(lineTotal)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Info banners */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
                <Truck className="h-5 w-5 shrink-0 text-[#1C99D6]" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-[#0A2540]">Delivery</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5F6B7A]">
                    Free delivery within Cape Town. Other areas are quoted when we
                    confirm your order.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4">
                <BadgeCheck className="h-5 w-5 shrink-0 text-[#1C99D6]" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-[#0A2540]">Professional Installation</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5F6B7A]">
                    Installation support is available — details are confirmed
                    when we confirm your order.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - stacked summary cards */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Subtotal card */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <h2 className="border-b border-[#E5E7EB] px-5 py-3 font-medium text-[#1C99D6]">
                Subtotal
              </h2>
              <div className="space-y-2 px-5 py-4">
                <div className="flex justify-between text-sm text-[#5F6B7A]">
                  <span>Products</span>
                  <span className="text-[#0A2540]">{formatPrice(breakdown.subtotal)}</span>
                </div>
                {breakdown.installationTotal > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Installation</span>
                    <span className="text-[#0A2540]">{formatPrice(breakdown.installationTotal)}</span>
                  </div>
                )}
                {breakdown.kitTotal > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Installation kit</span>
                    <span className="text-[#0A2540]">{formatPrice(breakdown.kitTotal)}</span>
                  </div>
                )}
                {breakdown.maintenanceTotal > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Maintenance</span>
                    <span className="text-[#0A2540]">{formatPrice(breakdown.maintenanceTotal)}</span>
                  </div>
                )}
                {breakdown.warrantyTotal > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Warranty</span>
                    <span className="text-[#0A2540]">{formatPrice(breakdown.warrantyTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery card */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <h2 className="border-b border-[#E5E7EB] px-5 py-3 font-medium text-[#1C99D6]">
                Delivery
              </h2>
              <div className="px-5 py-4">
                <p className="text-sm text-[#5F6B7A]">
                  Confirmed with your order — free within Cape Town, quoted for
                  other areas.
                </p>
              </div>
            </div>

            {/* Total card */}
            <div className="rounded-lg border border-[#E5E7EB] bg-white">
              <h2 className="border-b border-[#E5E7EB] px-5 py-3 font-medium text-[#1C99D6]">
                Total
              </h2>
              <div className="px-5 py-4 space-y-3">
                <p className="text-xl font-semibold text-[#0A2540]">
                  {breakdown.hasPricedItems ? formatPrice(breakdown.total) : "On request"}
                </p>
                {breakdown.hasEnquiryItems && (
                  <p className="text-xs text-[#5F6B7A]">
                    Excludes items priced on request — we&apos;ll quote these when
                    we confirm your order.
                  </p>
                )}
                {breakdown.hasQuotedExtras && (
                  <p className="text-xs text-[#5F6B7A]">
                    Some selected options are quoted separately and aren&apos;t
                    included in this total.
                  </p>
                )}
                <p className="text-xs text-[#5F6B7A]">
                  Final total is calculated securely from current prices at checkout.
                </p>
                <Button
                  className="h-[48px] w-full bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-lg text-[15px] font-semibold"
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Link
                  href="/products"
                  className="block w-full text-center text-[12px] font-medium text-[#5F6B7A] hover:text-[#0A2540] py-1"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
