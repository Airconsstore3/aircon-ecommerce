"use client";

import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface SupabaseProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id: string;
  type: "aircon" | "kit" | "accessory";
  brand?: string;
  btu_range?: number;
  available_btu_sizes?: number[];
  images: string[];
  price_zar: number;
  sale_price_zar?: number;
  is_published: boolean;
  is_enquiry_only: boolean;
  is_featured: boolean;
  is_sale: boolean;
  is_deal: boolean;
  sort_order: number;
  specs: {
    coverage_area?: string;
    coverage_m2?: string;
    inverter?: boolean | string;
    energy_rating?: string;
    wifi?: boolean | string;
    wifi_enabled?: string;
    heating_cooling?: boolean | string;
    heat_pump?: string;
    voltage?: string;
    refrigerant?: string;
    r32_refrigerant?: string;
    noise_level?: string;
    noise_db_indoor?: string;
    warranty?: string;
    installation_included?: boolean;
    free_delivery?: boolean;
    delivery_time?: string;
    [key: string]: unknown;
  };
  documents: unknown[];
  stock_count: number;
  is_sold_out: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

interface PremiumProductCardProps {
  product: SupabaseProduct;
}

function formatPrice(price: number): string {
  return `R ${price.toLocaleString("en-ZA")}`;
}

function calculateDiscountPercentage(regular: number, sale: number): number {
  return Math.round(((regular - sale) / regular) * 100);
}

function getStockStatus(product: SupabaseProduct): { label: string; color: string } {
  if (product.is_sold_out) {
    return { label: "Out of Stock", color: "text-red-600" };
  }
  if (product.stock_count === 0) {
    return { label: "Out of Stock", color: "text-red-600" };
  }
  if (product.stock_count <= product.low_stock_threshold) {
    return { label: "Low Stock", color: "text-orange-600" };
  }
  return { label: "In Stock", color: "text-green-600" };
}

function generateSpecChips(product: SupabaseProduct): string[] {
  const chips: string[] = [];
  const specs = product.specs || {};

  // Handle database spec format (strings like "Yes"/"No" instead of booleans)
  const inverter = specs.inverter === true || specs.inverter === "Yes";
  const wifi = specs.wifi === true || specs.wifi_enabled === "Yes";
  const heatingCooling = specs.heating_cooling === true || specs.heat_pump === "Yes";
  const coverageArea = specs.coverage_area || specs.coverage_m2;
  const energyRating = specs.energy_rating;
  const voltage = specs.voltage;
  const refrigerant = specs.refrigerant || specs.r32_refrigerant === "Yes" ? "R32" : null;
  const noiseLevel = specs.noise_level || specs.noise_db_indoor;

  // BTU range
  if (product.btu_range) {
    chips.push(`${product.btu_range.toLocaleString()} BTU`);
  }

  // Coverage area
  if (coverageArea) {
    chips.push(coverageArea);
  }

  // Inverter
  if (inverter) {
    chips.push("Inverter");
  }

  // Energy rating
  if (energyRating) {
    chips.push(energyRating);
  }

  // Wi-Fi
  if (wifi) {
    chips.push("Wi-Fi");
  }

  // Heating & Cooling
  if (heatingCooling) {
    chips.push("Heating & Cooling");
  }

  // Voltage
  if (voltage) {
    chips.push(voltage);
  }

  // Refrigerant
  if (refrigerant) {
    chips.push(refrigerant);
  }

  // Noise level
  if (noiseLevel) {
    chips.push(noiseLevel);
  }

  // Available sizes (if multiple BTU sizes available)
  if (product.available_btu_sizes && product.available_btu_sizes.length > 1) {
    const sizeLabels = product.available_btu_sizes.map(btus => {
      if (btus >= 1000) {
        return `${(btus / 1000).toFixed(0)}k`;
      }
      return btus.toString();
    });
    chips.push(`Sizes: ${sizeLabels.join(" • ")}`);
  }

  return chips;
}

function generateBadges(product: SupabaseProduct): Array<{ text: string; color: string }> {
  const badges: Array<{ text: string; color: string }> = [];

  if (product.is_sale) {
    badges.push({ text: "SALE", color: "bg-red-500" });
  }
  if (product.is_featured) {
    badges.push({ text: "BEST SELLER", color: "bg-blue-900" });
  }
  if (product.is_deal) {
    badges.push({ text: "DEAL", color: "bg-orange-500" });
  }
  if (product.type === "kit") {
    badges.push({ text: "BUNDLE", color: "bg-blue-500" });
  }
  if (product.type === "aircon" && product.btu_range && product.btu_range >= 24000) {
    badges.push({ text: "COMMERCIAL", color: "bg-gray-800" });
  }

  return badges;
}

export function PremiumProductCard({ product }: PremiumProductCardProps) {
  const { addItem } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.images?.[0] || "/placeholder.png";
  const badges = generateBadges(product);
  const specChips = generateSpecChips(product);
  const stockStatus = getStockStatus(product);
  const hasSale = product.sale_price_zar && product.sale_price_zar < product.price_zar;
  const discountPercent = hasSale
    ? calculateDiscountPercentage(product.price_zar, product.sale_price_zar!)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price_zar: product.price_zar,
      sale_price_zar: product.sale_price_zar,
      images: product.images,
      type: product.type,
      is_enquiry_only: product.is_enquiry_only,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Card className="group relative flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-0">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="absolute left-4 top-4 z-20 flex flex-col gap-1">
            {badges.map((badge, index) => (
              <span
                key={index}
                className={`${badge.color} px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 transition-all duration-300 hover:bg-blue-500 hover:text-white border border-gray-200"
          aria-label="Add to wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Product Image */}
        <div className="relative mb-4 flex aspect-square w-full items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          <Link href={`/products/${product.slug}`} className="relative h-full w-full">
            {imageError ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 p-4 text-center">
                <div className="text-4xl mb-2">❄️</div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {product.brand || "Aircon"}
                </p>
              </div>
            ) : (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                onError={() => setImageError(true)}
              />
            )}
          </Link>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col space-y-2">
          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
              {product.brand}
            </p>
          )}

          {/* Product Name */}
          <div className="min-h-[2.5rem]">
            <h3 className="text-base font-medium leading-tight text-gray-900 line-clamp-2">
              <Link
                href={`/products/${product.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {product.name}
              </Link>
            </h3>
          </div>

          {/* Specification Chips */}
          {specChips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {specChips.slice(0, 4).map((chip, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          {/* Stock Status */}
          <p className={`text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.label}
          </p>
        </div>

        {/* Price Section */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {hasSale ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.sale_price_zar!)}
              </span>
              <span className="text-sm font-normal text-gray-400 line-through">
                {formatPrice(product.price_zar)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs font-semibold text-red-600">
                  -{discountPercent}%
                </span>
              )}
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price_zar)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.is_sold_out || product.stock_count === 0 || product.is_enquiry_only}
            className="w-full rounded-md bg-gray-900 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {product.is_enquiry_only ? "Enquire Now" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
