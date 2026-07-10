"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, X, Plus, Minus, CreditCard } from "lucide-react";
import { useCart } from "@/components/shop/CartProvider";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQty, itemCount, total } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.toUpperCase() === "SUMMER15") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setPromoApplied(false);
    }
  };

  const discount = promoApplied ? total * 0.15 : 0;
  const finalTotal = total - discount;

  if (items.length === 0) {
    return (
      <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center py-16">
            <ShoppingBag className="size-24 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-normal text-[#1E3A5F] mb-2">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Start adding products to request a quote
            </p>
            <Button
              className="bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
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
    <section className="min-h-screen bg-[#FAFAF9] pt-[220px] pb-12 px-4 md:pt-[180px]">
      <div className="container max-w-2xl mx-auto">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-[#1E3A5F] mb-2">
            Your Quote Cart
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Review your items before requesting a quote
            </p>
            <Badge variant="secondary">{itemCount} items</Badge>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <Card key={item.id} className="rounded-xl shadow-sm border-0 p-4">
              <CardContent className="p-0">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#1E3A5F] truncate">
                          {item.name}
                        </h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.type}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors ml-2"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {item.is_enquiry_only ? (
                          <p className="font-semibold text-[#1E3A5F]">Price TBC</p>
                        ) : (
                          <p className="font-semibold text-[#1E3A5F]">
                            {formatPrice(item.sale_price_zar || item.price_zar)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Promo Code */}
        <form onSubmit={handleApplyPromo} className="mb-8">
          <div className="flex gap-2">
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError(false);
              }}
              className="rounded-lg"
            />
            <Button
              type="submit"
              variant="outline"
              className="rounded-lg whitespace-nowrap"
            >
              Apply
            </Button>
          </div>
          {promoApplied && (
            <p className="text-sm text-emerald-600 mt-2">
              SUMMER15 applied — 15% off
            </p>
          )}
          {promoError && (
            <p className="text-sm text-red-500 mt-2">
              Invalid promo code
            </p>
          )}
        </form>

        {/* Order Summary */}
        <Card className="rounded-xl shadow-sm border-0 p-6 mb-8">
          <CardContent className="p-0 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-[#1C99D6]">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Install estimate</span>
              <span className="font-medium">TBC</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-[#1E3A5F] text-lg">Total</span>
                <span className="font-bold text-[#1E3A5F] text-lg">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white rounded-lg"
            asChild
          >
            <Link href="/checkout">Request Quote</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-lg"
            asChild
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
