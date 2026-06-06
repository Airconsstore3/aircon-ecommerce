"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AirconProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  btu_size: string | null;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatZAR(amount: number): string {
  return "R " + amount.toLocaleString("en-ZA");
}

function getStockStatus(product: AirconProduct) {
  if (product.stock.is_sold_out) return "sold_out";
  if (product.stock.stock_count <= product.stock.low_stock_threshold) return "low_stock";
  return "in_stock";
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
              className="absolute end-3 top-3 z-30 rounded-full bg-[#D85A30] text-white text-xs font-semibold"
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
              <span className="text-sm font-semibold text-[#D85A30]">
                {formatZAR(product.sale_price_zar!)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatZAR(product.price_zar)}
              </span>
            </div>
          ) : (
            <p className="text-sm font-semibold text-[#D85A30]">
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
              <Button
                asChild
                className="w-full rounded-full bg-[#1E3A5F] hover:bg-[#16304f] text-white text-sm"
              >
                <Link href={`/products/${product.slug}`}>Request Quote</Link>
              </Button>
            ) : stockStatus === "sold_out" ? (
              <Button
                disabled
                className="w-full rounded-full bg-gray-200 text-gray-400 text-sm cursor-not-allowed"
              >
                Sold Out
              </Button>
            ) : (
              <Button
                asChild
                className="w-full rounded-full bg-[#D85A30] hover:bg-[#c44e28] text-white text-sm"
              >
                <Link href={`/products/${product.slug}`}>Get Quote</Link>
              </Button>
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
