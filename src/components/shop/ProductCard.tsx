"use client";

import { ShoppingBag, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  const hasImages = product.images.length > 0;
  const primaryImage = hasImages ? product.images[0] : "/placeholder.jpg";
  const secondaryImage = product.images.length > 1 ? product.images[1] : primaryImage;
  const hasSale = product.sale_price_zar !== null && product.sale_price_zar < product.price_zar;

  return (
    <Card className="group relative block rounded-none border border-solid border-[#0A2540]/30 bg-transparent py-5 shadow-none ring ring-border">

      {/* Entire card is clickable — goes to product detail page */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-50 size-full"
        aria-label={`View ${product.name}`}
      />

      <CardContent>

        {/* ── Image area ── */}
        <div className="relative overflow-hidden">
          <AspectRatio
            ratio={0.833}
            className="overflow-hidden rounded-[1.25rem]"
          >
            {/* Primary image — shown by default, fades out on hover */}
            <div className="absolute inset-0 size-full transition-opacity duration-350 first:z-20 group-hover:first:opacity-0">
              <img
                src={primaryImage}
                alt={product.name}
                className="block size-full object-cover object-center scale-110 transition-transform duration-350 group-hover:scale-100"
              />
            </div>

            {/* Secondary image — appears on hover */}
            <div className="absolute inset-0 size-full z-10">
              <img
                src={secondaryImage}
                alt={product.name}
                className="block size-full object-cover object-center scale-110 transition-transform duration-350 group-hover:scale-100"
              />
            </div>

            {/* Sold out overlay */}
            {stockStatus === "sold_out" && (
              <div className="absolute inset-0 z-20 bg-white/60 rounded-[1.25rem]" />
            )}
          </AspectRatio>

          {/* Brand badge — top left */}
          {product.brand && (
            <Badge
              variant="outline"
              className="absolute start-3 top-3 z-30 rounded-full bg-white text-xs font-semibold text-[#1E3A5F]"
            >
              {product.brand}
            </Badge>
          )}

          {/* SALE badge — top right */}
          {hasSale && (
            <Badge
              className="absolute end-3 top-3 z-30 rounded-full bg-[#1C99D6] text-white text-xs font-semibold"
            >
              SALE
            </Badge>
          )}

          {/* Enquiry only badge — top right (replaces SALE) */}
          {product.is_enquiry_only && !hasSale && (
            <Badge
              className="absolute end-3 top-3 z-30 rounded-full bg-[#1E3A5F] text-white text-xs font-semibold"
            >
              Quote Only
            </Badge>
          )}
        </div>

        {/* ── Card info ── */}
        <div className="space-y-1.5 pt-3.5">

          {/* Product name */}
          <CardTitle className="leading-snug text-base text-[#1E3A5F] line-clamp-1">
            {product.name}
          </CardTitle>

          {/* Brand + BTU */}
          {(product.brand || product.btu_size) && (
            <p className="text-xs text-muted-foreground">
              {[product.brand, product.btu_size].filter(Boolean).join(" · ")}
            </p>
          )}

          {/* Price block */}
          {product.is_enquiry_only ? (
            <p className="text-sm font-medium text-[#1E3A5F]">Price on request</p>
          ) : hasSale ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1C99D6]">
                {formatZAR(product.sale_price_zar!)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatZAR(product.price_zar)}
              </span>
            </div>
          ) : (
            <p className="text-sm font-semibold text-[#1C99D6]">
              {formatZAR(product.price_zar)}
            </p>
          )}

          {/* Stock badge */}
          {stockStatus === "in_stock" && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              In Stock
            </span>
          )}
          {stockStatus === "low_stock" && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
              Low Stock — {product.stock.stock_count} left
            </span>
          )}
          {stockStatus === "sold_out" && (
            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
              Sold Out
            </span>
          )}

          {/* CTA button */}
          <div className="pt-1">
            {product.is_enquiry_only ? (
              <div className="aircon-angled-button-wrap w-full">
                <Button
                  asChild
                  variant="ghost"
                  className="aircon-angled-button h-auto w-full rounded-none hover:bg-transparent"
                >
                  <Link href={`/products/${product.slug}`}>Request Quote</Link>
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
                  <Link href={`/products/${product.slug}`}>Get Quote</Link>
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
  columns?: 2 | 3 | 4;
  className?: string;
}

const AirconProductList = ({ 
  products, 
  columns = 4, 
  className 
}: AirconProductListProps) => {
  const gridClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
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
