"use client";

import { ShoppingBag, Clock, AlertCircle, Heart } from "lucide-react";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCssImageUrl, getProductImages } from "@/lib/product-images";
import { useState, useEffect } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AirconProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  btu_size: string | null;
  btu_range: number | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  is_enquiry_only: boolean;
  is_featured: boolean;
  description?: string | null;
  stock: {
    stock_count: number;
    is_sold_out: boolean;
    low_stock_threshold: number;
  };
}

interface AirconProductCardProps {
  product: AirconProduct;
}

// Deal-specific types
interface DealCardProps {
  deal: {
    id: string;
    name: string;
    slug: string;
    description: string;
    original_price_zar: number;
    sale_price_zar: number;
    ends_at: string;
    deal_type: 'residential' | 'commercial' | 'bundle' | 'clearance';
    stock_remaining: number;
    is_hero: boolean;
    product_id?: string;
    images: string[];
    includes?: string[];
  };
  productSlug?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatZAR(amount: number): string {
  return "R " + amount.toLocaleString("en-ZA");
}

function getStockStatus(product: AirconProduct) {
  if (product.stock.is_sold_out) return "sold_out";
  if (product.stock.stock_count <= product.stock.low_stock_threshold) return "low_stock";
  return "in_stock";
}

function getRoomCoverage(btuRange: number | null): string | null {
  if (!btuRange) return null;

  if (btuRange <= 9000) return "Covers rooms up to 20 m²";
  if (btuRange <= 12000) return "Covers rooms up to 30 m²";
  if (btuRange <= 18000) return "Covers rooms up to 40 m²";
  if (btuRange <= 24000) return "Covers rooms up to 55 m²";
  if (btuRange <= 30000) return "Covers rooms up to 65 m²";
  if (btuRange <= 36000) return "Covers rooms up to 80 m²";
  if (btuRange <= 48000) return "Covers spaces up to 110 m²";
  if (btuRange <= 60000) return "Covers spaces up to 140 m²";
  return "Covers large commercial spaces";
}

function formatBtu(btuRange: number | null): string | null {
  if (!btuRange) return null;
  return `${btuRange.toLocaleString()} BTU`;
}

function isGenericFamilyDescription(bullet: string): boolean {
  const lower = bullet.toLowerCase();
  return /\bsky air\b/.test(lower) && /\b(inverter|cassette|mounted|suspended|concealed|ducted|wall|ceiling|mini)\b/.test(lower);
}

function getProductDescriptionBullets(product: AirconProduct, stockStatus: ReturnType<typeof getStockStatus>) {
  const unitSizeBullet = formatBtu(product.btu_range);

  const descriptionBullets = product.description
    ?.split(/(?:\r?\n|\.\s+)/)
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .filter((item) => !isGenericFamilyDescription(item))
    .slice(0, 4) ?? [];

  const fallbackBullets = [
    unitSizeBullet ?? (product.brand ? `${product.brand} air conditioning system` : "Reliable air conditioning system"),
    getRoomCoverage(product.btu_range) ?? "Designed for efficient cooling comfort",
    product.is_enquiry_only ? "Quote-based pricing for tailored installation" : "Available for ordering and installation",
    stockStatus === "low_stock" ? `Low stock — ${product.stock.stock_count} left` : stockStatus === "sold_out" ? "Currently sold out" : "Installation support available",
  ];

  return [unitSizeBullet, ...descriptionBullets, ...fallbackBullets].filter(Boolean).slice(0, 4);
}

// Countdown timer helper
function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return timeLeft;
}

// Calculate percentage saved
function calculatePercentSaved(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const AirconProductCard = ({ product }: AirconProductCardProps) => {
  const stockStatus = getStockStatus(product);
  const productImages = getProductImages(product);
  const primaryImage = productImages[0];
  const hasSale = product.sale_price_zar !== null && product.sale_price_zar < product.price_zar;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const usps = getProductDescriptionBullets(product, stockStatus);
  const inverterLabel =
    product.type === "aircon"
      ? product.name.toLowerCase().includes("inverter")
        ? "Inverter"
        : "Non-inverter"
      : null;
  const isEnquiryOnly =
    product.is_enquiry_only ||
    (product.type === "aircon" &&
      product.btu_range !== null &&
      product.btu_range > 62000);

  return (
    <Card className="group relative flex h-full min-h-[560px] w-full flex-col overflow-hidden rounded-[15px] border-0 bg-white py-0 shadow-sm transition-shadow duration-300 hover:shadow-md">

      {/* Entire card is clickable — goes to product detail page */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10 size-full"
        aria-label={`View ${product.name}`}
      />

      <CardContent className="relative z-20 flex h-full flex-col p-0 pointer-events-none">

        {/* ── Image area ── */}
        <div className="relative w-full px-6 pt-10 pb-4">
          <button
            type="button"
            onClick={() => setIsWishlisted((current) => !current)}
            className="pointer-events-auto absolute right-4 top-4 z-40 p-1 text-black/70 transition-colors hover:text-red-500"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-6 w-6 transition-all", isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-[1.5px]")} />
          </button>
          {primaryImage ? (
            <Link
              href={`/products/${product.slug}`}
              className="pointer-events-auto block h-[230px] w-full bg-contain bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.03]"
              style={{ backgroundImage: getCssImageUrl(primaryImage) }}
              aria-label={`View ${product.name}`}
            />
          ) : (
            <div className="h-[230px] w-full" />
          )}

          {/* Sold out overlay */}
          {stockStatus === "sold_out" && (
            <div className="absolute inset-x-6 bottom-4 top-10 z-30 rounded-[15px] bg-white/60" />
          )}

          {/* Brand badge — top left */}
          {product.brand && (
            <Badge
              className="absolute start-4 top-4 z-30 rounded-md border-none bg-[#E8F4FC] px-4 py-1 text-xs font-bold text-[#1E3A5F] hover:bg-[#E8F4FC]"
            >
              {product.brand}
            </Badge>
          )}

          {/* SALE badge — top right */}
          {hasSale && (
            <Badge
              className="absolute left-4 top-16 z-30 rounded-md bg-[#1C99D6] px-4 py-1 text-xs font-bold text-white"
            >
              SALE
            </Badge>
          )}

        </div>

        {/* ── Card info ── */}
        <div className="flex w-full flex-1 flex-col items-center px-6 text-center">

          {/* Product name */}
          <CardTitle className="mb-3 min-h-[40px] text-[14px] sm:text-[15px] font-medium leading-tight text-black line-clamp-2 group-hover:underline">
            {product.name}
          </CardTitle>

          {/* Brand + Inverter */}
          {(product.brand || inverterLabel) && (
            <p className="mb-3 text-xs text-muted-foreground">
              {product.brand && <span>{product.brand}</span>}
              {inverterLabel && (
                <>
                  {product.brand && <span className="mx-1">·</span>}
                  <span className="font-bold text-[#1E3A5F]">{inverterLabel}</span>
                </>
              )}
            </p>
          )}

          {/* Price block */}
          {isEnquiryOnly ? (
            <p className="mb-3 text-base font-bold text-[#1C99D6]">Commercial</p>
          ) : hasSale ? (
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="text-base font-bold text-[#1C99D6]">
                {formatZAR(product.sale_price_zar!)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatZAR(product.price_zar)}
              </span>
            </div>
          ) : (
            <p className="mb-3 text-base font-bold text-[#1C99D6]">
              {formatZAR(product.price_zar)}
            </p>
          )}

          {/* Stock badge */}
          <div className="mb-3 min-h-5">
            {stockStatus === "in_stock" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                In Stock
              </span>
            )}
            {stockStatus === "low_stock" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                Low Stock — {product.stock.stock_count} left
              </span>
            )}
            {stockStatus === "sold_out" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                Sold Out
              </span>
            )}
          </div>

          <div className="w-full border-y border-gray-200 py-4">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {usps.map((usp) => (
                <li key={usp} className="relative pl-4 text-left font-[var(--font-google-sans-flex)] text-[12px] font-normal leading-tight text-black">
                  <span className="absolute left-0 top-[6px] h-[3px] w-[3px] rounded-full bg-[#1C99D6]" />
                  <span className="line-clamp-2">{usp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA button */}
          <div className="pointer-events-auto mt-auto w-full p-6 px-0">
            {isEnquiryOnly ? (
              <div className="aircon-angled-button-wrap w-full">
                <Button
                  asChild
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none hover:bg-transparent"
                >
                  <Link href={`/products/${product.slug}`}>Price on Request</Link>
                </Button>
              </div>
            ) : stockStatus === "sold_out" ? (
              <div className="aircon-angled-button-wrap w-full">
                <Button
                  disabled
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none opacity-50 cursor-not-allowed"
                >
                  Sold Out
                </Button>
              </div>
            ) : (
              <div className="aircon-angled-button-wrap w-full">
                <Button
                  asChild
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none hover:bg-transparent"
                >
                  <Link href={`/products/${product.slug}`}>View Product</Link>
                </Button>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

// ─── Product List ─────────────────────────────────────────────────────────────

interface AirconProductListProps {
  products: AirconProduct[];
  columns?: 3 | 4;
  className?: string;
}

const AirconProductList = ({ 
  products, 
  columns = 3, 
  className 
}: AirconProductListProps) => {
  const gridClasses = {
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridClasses[columns], className)}>
      {products.map((product) => (
        <AirconProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export { AirconProductCard, AirconProductList };
export type { AirconProduct };

// ─── Deal Card Component ───────────────────────────────────────────────────────

const DealCard = ({ deal, productSlug }: DealCardProps) => {
  const timeLeft = useCountdown(deal.ends_at);
  const percentSaved = calculatePercentSaved(deal.original_price_zar, deal.sale_price_zar);
  const hasImages = deal.images.length > 0;
  const primaryImage = hasImages ? deal.images[0] : "/placeholder.jpg";
  const { addItem } = useCart();

  const productHref = productSlug ? `/products/${productSlug}` : `/deals/${deal.slug}`;

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

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
    <Card className="group relative block rounded-none border border-solid border-[#0A2540]/30 bg-transparent py-5 shadow-none ring ring-border">
      
      {/* Entire card is clickable */}
      <Link
        href={`/deals/${deal.slug}`}
        className="absolute inset-0 z-50 size-full"
        aria-label={`View ${deal.name}`}
      />

      <CardContent>

        {/* ── Image area ── */}
        <div className="relative overflow-hidden">
          <AspectRatio
            ratio={0.833}
            className="overflow-hidden rounded-[1.25rem]"
          >
            <img
              src={primaryImage}
              alt={deal.name}
              className="block size-full object-cover object-center scale-110 transition-transform duration-350 group-hover:scale-100"
            />
          </AspectRatio>

          {/* % Saved badge - brand blue #1C99D6 */}
          <Badge
            className="absolute start-3 top-3 z-30 rounded-full bg-[#1C99D6] text-white text-xs font-semibold"
          >
            Save {percentSaved}%
          </Badge>

          {/* Deal type badge */}
          <Badge
            variant="outline"
            className="absolute end-3 top-3 z-30 rounded-full bg-white text-xs font-semibold text-[#1E3A5F]"
          >
            {deal.deal_type}
          </Badge>
        </div>

        {/* ── Card info ── */}
        <div className="space-y-2 pt-3.5">

          {/* Product name */}
          <CardTitle className="leading-snug text-base text-[#1E3A5F] line-clamp-2">
            {deal.name}
          </CardTitle>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {deal.description}
          </p>

          {/* Countdown timer */}
          {!isExpired && (
            <div className="flex items-center gap-2 text-xs text-[#1C99D6] font-medium">
              <Clock className="w-3 h-3" />
              <span>
                {timeLeft.days > 0 && `${timeLeft.days}d `}
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          )}

          {isExpired && (
            <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>Deal expired</span>
            </div>
          )}

          {/* Price block */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#1C99D6]">
              {formatZAR(deal.sale_price_zar)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatZAR(deal.original_price_zar)}
            </span>
          </div>

          {/* Stock urgency */}
          {deal.stock_remaining <= 5 && deal.stock_remaining > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3 h-3" />
              Only {deal.stock_remaining} left
            </span>
          )}

          {deal.stock_remaining === 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
              <AlertCircle className="w-3 h-3" />
              Sold Out
            </span>
          )}

          {/* CTA buttons */}
          <div className="relative z-[60] flex flex-col gap-2 pt-2">
            <div>
              <Button
                variant="outline"
                className="w-full rounded-none border border-dashed border-[#0A2540] bg-transparent text-[#0A2540] hover:bg-[#1C99D6]/10 font-[var(--font-google-sans-flex)]"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 size-4" />
                Add to cart
              </Button>
            </div>
            <div>
              <Button
                asChild
                variant="ghost"
                className="w-full rounded-none border border-dashed border-[#0A2540] bg-transparent text-[#0A2540] hover:bg-[#1C99D6]/10 font-[var(--font-google-sans-flex)]"
              >
                <Link href={productHref}>View product</Link>
              </Button>
            </div>
          </div>

          {/* Deal ends date */}
          <p className="text-[10px] text-muted-foreground text-center">
            Deal ends: {new Date(deal.ends_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>

        </div>
      </CardContent>
    </Card>
  );
};

export { DealCard };
