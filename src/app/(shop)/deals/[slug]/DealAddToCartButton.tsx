"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/shop/CartProvider";
import { toast } from "sonner";

interface DealAddToCartButtonProps {
  deal: any;
}

export default function DealAddToCartButton({ deal }: DealAddToCartButtonProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: deal.id,
      name: deal.name,
      slug: deal.slug,
      price_zar: deal.original_price_zar,
      sale_price_zar: deal.sale_price_zar,
      images: deal.images,
      type: deal.deal_type,
      is_enquiry_only: false,
    });
    toast.success(`${deal.name} added to cart`);
  };

  return (
    <Button
      className="w-full bg-[#1C99D6] hover:bg-[#1680b0] text-white"
      onClick={handleAddToCart}
    >
      <ShoppingBag className="w-4 h-4 mr-2" />
      Add to Cart
    </Button>
  );
}
