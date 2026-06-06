"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { useCart } from "./CartProvider";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function CartDrawer() {
  const { items, removeItem, updateQty, itemCount, total } = useCart();
  const [open, setOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="size-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#D85A30]">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-400 flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Your Cart</SheetTitle>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="text-sm text-[#D85A30] hover:underline"
            >
              View Cart
            </Link>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="size-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {item.images[0] && (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-normal text-[#1E3A5F] text-sm truncate">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors ml-1"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.is_enquiry_only ? "Price TBC" : formatPrice(item.sale_price_zar || item.price_zar)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 rounded"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 rounded"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold text-[#1E3A5F]">{formatPrice(total)}</span>
            </div>
            <Button
              className="w-full bg-[#D85A30] hover:bg-[#c44e28] text-white rounded-lg"
              asChild
            >
              <Link href="/enquire" onClick={() => setOpen(false)}>
                Request Quote
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
