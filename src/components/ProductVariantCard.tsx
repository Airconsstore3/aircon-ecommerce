"use client";

import {
  Droplets,
  Ruler,
  Snowflake,
  Sparkles,
  Thermometer,
  Truck,
  Wifi,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/CartProvider";
import type { Product, ProductVariant } from "@/types/product";

interface ProductVariantCardProps {
  product: Product;
  priority?: boolean;
}

const BADGE_TONE_CLASSES: Record<
  NonNullable<Product["badge"]>["tone"],
  string
> = {
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-amber-100 text-amber-800",
};

const FEATURE_META: Record<
  Product["features"][number],
  { icon: typeof Wifi; label: string }
> = {
  wifi: { icon: Wifi, label: "Wi-Fi control" },
  "self-clean": { icon: Sparkles, label: "Self-clean" },
  dehumidify: { icon: Droplets, label: "Dehumidify" },
};

const FEATURE_ORDER: Array<Product["features"][number]> = [
  "wifi",
  "self-clean",
  "dehumidify",
];

function formatPrice(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA")}`;
}

function cleanProductName(name: string): string {
  // Remove manufacturer codes like FTXM50A RXM50A
  return name
    .replace(/\s+[A-Z]{2,}\d+[A-Z]*/g, "")
    .replace(/\s+[A-Z]{2,}\d+/g, "")
    .trim();
}

function formatBTU(btu: number): string {
  if (btu >= 1000) {
    return `${(btu / 1000).toFixed(0)}k`;
  }
  return btu.toString();
}

export function ProductVariantCard({ product, priority = false }: ProductVariantCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedBtu, setSelectedBtu] = useState<number>(product.btu);

  // Get current variant data based on selected BTU
  const currentVariant = product.variants?.find(v => v.btu === selectedBtu) || {
    btu: product.btu,
    kw: product.kw,
    roomMinSqm: product.roomMinSqm,
    roomMaxSqm: product.roomMaxSqm,
    mode: product.mode,
    energyRating: product.energyRating,
    isInverter: product.isInverter,
    noiseDb: product.noiseDb,
    features: product.features,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stockCount: product.stockCount,
    images: product.images,
  };

  const {
    slug,
    brand,
    type,
    title,
    images,
    rating,
    reviewCount,
    installRequired,
    badge,
  } = product;

  const orderedFeatures = FEATURE_ORDER.filter((f) => currentVariant.features?.includes(f)).slice(0, 3);
  const hasHoverImage = images.length > 1;
  const productHref = `/products/${slug}`;
  const currentImages = currentVariant.images || images;

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: title,
      slug,
      price_zar: currentVariant.compareAtPrice ?? currentVariant.price,
      sale_price_zar: currentVariant.compareAtPrice ? currentVariant.price : undefined,
      images: currentImages,
      type,
      is_enquiry_only: false,
    });
  };

  const handleSizeSelect = (btu: number) => {
    setSelectedBtu(btu);
  };

  return (
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border-[0.5px] border-border bg-card text-card-foreground transition-colors hover:border-foreground/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={productHref}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={title}
      />

      {/* Image with reserved badge space */}
      <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-neutral-50 rounded-t-xl">
        {/* Reserved badge space (24px) for consistent alignment */}
        <div className="absolute left-2 top-2 z-20 h-6 w-full">
          {badge && (
            <span
              className={cn(
                "inline-block rounded-md px-2 py-1 text-[11px] font-medium",
                BADGE_TONE_CLASSES[badge.tone]
              )}
            >
              {badge.label}
            </span>
          )}
        </div>
        {currentImages[0] && (
          <Image
            src={currentImages[0]}
            alt={title}
            fill
            className={cn(
              "object-contain p-4 transition-opacity duration-300",
              hasHoverImage && isHovered ? "opacity-0" : "opacity-100"
            )}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
            priority={priority}
          />
        )}
        {hasHoverImage && (
          <Image
            src={currentImages[1]}
            alt=""
            aria-hidden="true"
            fill
            className={cn(
              "object-contain p-4 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}
      </div>

      {/* Body */}
      <div className="relative z-20 flex flex-1 flex-col p-4 pointer-events-none">
        {/* Brand */}
        <p className="text-[11px] text-muted-foreground mb-2">
          {brand}
        </p>

        {/* Title - cleaned name */}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-foreground [line-height:1.35] md:text-base mb-4">
          {cleanProductName(title)}
        </h3>

        {/* Size Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Available Sizes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((variant) => (
                <button
                  key={variant.btu}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSizeSelect(variant.btu);
                  }}
                  className={cn(
                    "pointer-events-auto px-2.5 py-1 text-[11px] font-medium rounded-md transition-all",
                    selectedBtu === variant.btu
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {formatBTU(variant.btu)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spec block — four fixed rows */}
        <ul className="flex flex-col gap-[3px] mb-5">
          <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Snowflake className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {currentVariant.btu.toLocaleString()} BTU / {currentVariant.kw} kW
            </span>
          </li>
          <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Ruler className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Rooms {currentVariant.roomMinSqm}–{currentVariant.roomMaxSqm} m²
            </span>
          </li>
          <li className="flex items-center gap-1.5 text-xs text-foreground">
            <Thermometer className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {currentVariant.mode === "cooling-heating" ? "Cooling + heating" : "Cooling only"}
            </span>
          </li>
          <li className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {currentVariant.energyRating}
              {currentVariant.isInverter ? " inverter" : ""} · {currentVariant.noiseDb} dB
            </span>
          </li>
        </ul>

        {/* Feature icons — fixed order, max 3 */}
        {orderedFeatures.length > 0 && (
          <div className="flex items-center gap-2 mb-5">
            {orderedFeatures.map((feature) => {
              const { icon: Icon, label } = FEATURE_META[feature];
              return (
                <span key={feature} title={label} aria-label={label}>
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                </span>
              );
            })}
          </div>
        )}

        {/* Rating line */}
        <p className="text-[11px] text-muted-foreground mb-5">
          {reviewCount > 0 ? (
            <>
              ★ {rating.toFixed(1)} ({reviewCount})
            </>
          ) : (
            "New"
          )}{" "}
          · {currentVariant.stockCount <= 3 && currentVariant.stockCount > 0 ? `Only ${currentVariant.stockCount} left` : "In stock"}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-lg font-medium text-foreground md:text-xl">
            {formatPrice(currentVariant.price)}
          </span>
          {currentVariant.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(currentVariant.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Hairline divider */}
        <div className="h-[0.5px] w-full bg-border mb-4" />

        {/* Delivery block */}
        <div className="flex flex-col gap-[3px] text-xs mb-6">
          <div className="flex items-center gap-1.5 text-green-600">
            <Truck className="size-3.5 shrink-0" aria-hidden="true" />
            <span>Cape Town 24–48 hrs</span>
          </div>
          <div className="pl-5 text-muted-foreground">Nationwide 3–5 days</div>
        </div>

        {/* Primary CTA + Secondary link */}
        <div className="pointer-events-auto mt-auto flex flex-col">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full flex-col items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span>Add to Cart</span>
            {installRequired && (
              <span className="text-[11px] font-normal opacity-90">
                Installation Available
              </span>
            )}
          </button>

          <Link
            href={productHref}
            className="mt-2 w-full rounded-md bg-transparent py-1.5 text-center text-[13px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View Product →
          </Link>
        </div>
      </div>
    </div>
  );
}
