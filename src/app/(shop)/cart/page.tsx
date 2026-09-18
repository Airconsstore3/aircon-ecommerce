"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/components/shop/CartProvider";
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

  // Compute the full breakdown from cart items so the cart page matches
  // the checkout summary. The server re-resolves pricing at checkout time,
  // so these client-side values are display-only.
  const breakdown = items.reduce(
    (acc, item) => {
      const base = (item.sale_price_zar ?? item.price_zar) * item.quantity;
      const install = (item.installation_price_zar ?? 0) * item.quantity;
      const kit = (item.kit_price_zar ?? 0) * item.quantity;
      const maint = (item.maintenance_price_zar ?? 0) * item.quantity;
      const warranty = (item.warranty_price_zar ?? 0) * item.quantity;
      acc.subtotal += base;
      acc.installation += install;
      acc.kit += kit;
      acc.maintenance += maint;
      acc.warranty += warranty;
      acc.total += base + install + kit + maint + warranty;
      return acc;
    },
    { subtotal: 0, installation: 0, kit: 0, maintenance: 0, warranty: 0, total: 0 },
  );

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-medium text-[#0A2540] mb-2">
              Your cart is empty
            </h1>
            <p className="text-[#5F6B7A] mb-8">
              Start adding products to request a quote
            </p>
            <Button
              className="bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-none"
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
    <section className="min-h-screen bg-white pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-6xl mx-auto">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-[#0A2540] mb-2">
            Shopping Cart
          </h1>
          <p className="text-[#5F6B7A] text-sm">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          {/* Left column - Cart items */}
          <div className="space-y-4">
            {items.map((item) => {
              const unitPrice = item.sale_price_zar || item.price_zar;
              const lineTotal = unitPrice * item.quantity;
              return (
                <div key={item.id} className="flex gap-4 border-b border-[#F0F0F0] pb-4 last:border-0">
                  {/* Product Image */}
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-[#F5F5F5]">
                    {item.images[0] && (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-[#0A2540] line-clamp-2">
                          {item.name}
                        </h3>
                        {item.variant && (
                          <p className="text-xs text-[#5F6B7A] mt-0.5">{item.variant}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 text-[#9CA3AF] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity Control */}
                      <div className="flex items-center border border-[#E5E5E5]">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center text-[#0A2540] hover:bg-[#F5F5F5] transition-colors text-sm"
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
                          className="flex h-8 w-8 items-center justify-center text-[#0A2540] hover:bg-[#F5F5F5] transition-colors text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-sm font-medium text-[#0A2540]">
                        {item.is_enquiry_only ? "Price TBC" : formatPrice(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right column - Order summary (sticky on desktop) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] px-5 py-4">
                <h2 className="text-lg font-medium text-[#0A2540]">Order summary</h2>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="flex justify-between text-sm text-[#5F6B7A]">
                  <span>Subtotal</span>
                  <span>{formatPrice(breakdown.subtotal)}</span>
                </div>
                {breakdown.installation > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Installation</span>
                    <span>{formatPrice(breakdown.installation)}</span>
                  </div>
                )}
                {breakdown.kit > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Installation kit</span>
                    <span>{formatPrice(breakdown.kit)}</span>
                  </div>
                )}
                {breakdown.maintenance > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Maintenance</span>
                    <span>{formatPrice(breakdown.maintenance)}</span>
                  </div>
                )}
                {breakdown.warranty > 0 && (
                  <div className="flex justify-between text-sm text-[#5F6B7A]">
                    <span>Warranty</span>
                    <span>{formatPrice(breakdown.warranty)}</span>
                  </div>
                )}
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-lg font-semibold text-[#0A2540] pt-2 border-t border-[#E5E7EB]">
                    <span>Total</span>
                    <span>{formatPrice(breakdown.total)}</span>
                  </div>
                  <p className="text-xs text-[#5F6B7A] pt-1">
                    Final total is calculated securely from current prices when you checkout.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="pt-4 space-y-2">
                  <Button
                    className="h-[48px] w-full bg-[#1C99D6] hover:bg-[#1597c6] text-white rounded-none text-[15px] font-semibold"
                    asChild
                  >
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                  <Link
                    href="/products"
                    className="block w-full text-center text-[12px] font-medium text-[#5F6B7A] hover:text-[#0A2540] py-2"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
