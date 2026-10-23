"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { getCartBreakdown } from "@/lib/cart-pricing";
import { CartRecommendations } from "./CartRecommendations";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, itemCount, total, isOpen, setIsOpen } = useCart();
  const breakdown = getCartBreakdown(items);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("ZAR", "R");
  };

  // Prevent page scroll when drawer is open (the page scrolls inside #scroll-root)
  useEffect(() => {
    const root = document.getElementById('scroll-root');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (root) root.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      if (root) root.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop - z-60 to be above navbar (z-50) */}
      <div
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={() => setIsOpen(false)}
      />
      {/* Drawer - z-[70] to be above backdrop */}
      <div className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[400px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E1E5EA] px-5 py-4 shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-[#0A2540]">
              Shopping Cart
            </h2>
            <p className="text-[12px] text-[#5F6B7A] mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-medium text-[#5F6B7A] hover:text-red-500 transition-colors"
              >
                Empty cart
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#6B7280] hover:text-[#0A2540] transition-colors"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Items - scrollable area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-[#6B7280] mb-2" />
              <p className="text-[13px] text-[#5F6B7A]">Your cart is empty</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-3 text-[12px] font-medium text-[#1C99D6] hover:text-[#0A2540]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const unitPrice = item.sale_price_zar || item.price_zar;
                const lineTotal = unitPrice * item.quantity;
                const imageUrl = item.images[0];
                return (
                  <li key={item.id} className="flex gap-3 border-b border-[#F0F0F0] pb-4 last:border-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[#F5F5F5]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[13px] font-medium leading-snug text-[#0A2540] line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 text-[#6B7280] hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {item.variant && (
                        <p className="mt-0.5 text-[11px] text-[#5F6B7A]">
                          {item.variant}
                        </p>
                      )}
                      {item.has_quoted_extras && (
                        <p className="mt-0.5 text-[11px] text-[#B45309]">
                          Options quoted separately
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-stretch border border-[#E5E5E5]">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-[#0A2540] hover:bg-[#F5F5F5] transition-colors text-sm"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="flex h-7 w-8 items-center justify-center text-[13px] font-medium text-[#0A2540]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-[#0A2540] hover:bg-[#F5F5F5] transition-colors text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[13px] font-semibold text-[#0A2540]">
                          {item.is_enquiry_only ? "Price TBC" : formatPrice(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* You May Also Like - only show when cart has items */}
        {items.length > 0 && (
          <CartRecommendations cartItemIds={items.map(item => item.id)} />
        )}

        {/* Footer - fixed at bottom */}
        {items.length > 0 && (
          <div className="border-t border-[#E1E5EA] px-4 py-4 shrink-0 bg-white">
            <div className="mb-3 flex items-center justify-between text-[13px] text-[#5F6B7A]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#0A2540]">
                {breakdown.hasPricedItems ? formatPrice(total) : "On request"}
              </span>
            </div>
            {breakdown.hasEnquiryItems && (
              <p className="mb-3 text-[11px] text-[#5F6B7A]">
                Excludes items priced on request.
              </p>
            )}
            <Button
              className="h-[44px] w-full rounded-none bg-[#1C99D6] text-[14px] font-semibold text-white hover:bg-[#1597c6]"
              asChild
            >
              <Link href="/checkout" onClick={() => setIsOpen(false)}>
                {breakdown.hasPricedItems ? `Checkout — ${formatPrice(total)}` : "Checkout"}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="mt-2 h-[40px] w-full rounded-none border-[#0A2540] text-[13px] font-semibold text-[#0A2540] hover:bg-[#F0F9FF]"
              asChild
            >
              <Link href="/cart" onClick={() => setIsOpen(false)}>
                View cart
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full text-center text-[12px] font-medium text-[#5F6B7A] hover:text-[#0A2540]"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
