"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";
import { getRecommendations } from "@/app/(shop)/cart/recommendations";
import Link from "next/link";

interface Recommendation {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  is_enquiry_only: boolean;
}

interface CartRecommendationsProps {
  cartItemIds: string[];
}

export function CartRecommendations({ cartItemIds }: CartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (cartItemIds.length === 0) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await getRecommendations(cartItemIds);
        setRecommendations(data);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItemIds]);

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

  const handleAddToCart = (product: Recommendation) => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_zar: product.price_zar,
      sale_price_zar: product.sale_price_zar || undefined,
      images: product.images,
      type: product.type,
      is_enquiry_only: product.is_enquiry_only,
    });
  };

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-[#E1E5EA] px-4 py-3">
      <h3 className="text-[12px] font-semibold text-[#0A2540] mb-3">You May Also Like</h3>
      <div className="grid grid-cols-2 gap-3">
        {recommendations.map((product) => {
          const imageUrl = product.images[0];
          const price = product.sale_price_zar || product.price_zar;
          return (
            <div key={product.id} className="flex flex-col border border-[#F0F0F0] p-2">
              <Link href={`/products/${product.slug}`} className="relative h-20 w-full shrink-0 overflow-hidden bg-[#F5F5F5]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </Link>
              <div className="mt-2 flex flex-col flex-1">
                {product.brand && (
                  <p className="text-[10px] text-[#5F6B7A]">{product.brand}</p>
                )}
                <Link
                  href={`/products/${product.slug}`}
                  className="text-[11px] font-medium text-[#0A2540] line-clamp-2 leading-tight"
                >
                  {product.name}
                </Link>
                <div className="mt-auto pt-2">
                  <p className="text-[12px] font-semibold text-[#0A2540]">
                    {product.is_enquiry_only ? "Price TBC" : formatPrice(price)}
                  </p>
                  {!product.is_enquiry_only && (
                    <Button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="mt-2 h-6 w-full rounded-none bg-[#1C99D6] px-2 text-[11px] font-semibold text-white hover:bg-[#1597c6]"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
