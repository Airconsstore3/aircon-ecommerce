"use client";

import { Package, Ruler, Wifi, Radio, Cable, ShoppingCart, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/shop/CartProvider";
import { ACCESSORY_KINDS, INSTALLATION_KINDS, getAccessoryPrice, getAccessoryCardImage } from "@/lib/accessories";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getCssImageUrl } from "@/lib/product-images";
import { useState } from "react";

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
  ac_type?: string | null;
  is_inverter?: boolean;
  specs?: Record<string, unknown>;
  sort_order?: number;
  created_at?: string;
  has_variants?: boolean;
  min_variant_price?: number | null;
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
  const coverageBullet = getRoomCoverage(product.btu_range);
  const inverterBullet =
    product.type === "aircon"
      ? product.name.toLowerCase().includes("inverter")
        ? "Inverter"
        : "Non-Inverter"
      : null;
  const brandBullet = product.brand ?? null;

  // Only show the 4 most important specs: BTU, Coverage, Inverter, Brand
  const allBullets = [unitSizeBullet, coverageBullet, inverterBullet, brandBullet].filter(Boolean);
  const uniqueBullets = Array.from(new Set(allBullets));

  return uniqueBullets.slice(0, 4);
}

// ─── Product Card ─────────────────────────────────────────────────────────────

const AirconProductCard = ({ product }: AirconProductCardProps) => {
  const stockStatus = getStockStatus(product);
  const productImages = product.images ?? [];
  const primaryImage = productImages[0];
  const hasSale = product.sale_price_zar !== null && product.sale_price_zar < product.price_zar;
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
          ) : product.has_variants && product.min_variant_price ? (
            <p className="mb-3 text-base font-bold text-[#1C99D6]">
              From {formatZAR(product.min_variant_price)}
            </p>
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
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                Available on request
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

  // Verify no duplicate product IDs
  const ids = products.map(p => p.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error("[AirconProductList] Duplicate product IDs detected:", {
      total: ids.length,
      unique: uniqueIds.size,
      duplicates: ids.filter((id, index) => ids.indexOf(id) !== index)
    });
  }

  return (
    <div className={cn("grid gap-6", gridClasses[columns], className)}>
      {products.map((product) => (
        <AirconProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const AccessoryProductCard = ({ product }: AirconProductCardProps) => {
  const { addItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const kind = [...ACCESSORY_KINDS, ...INSTALLATION_KINDS].find((item) => item.value === product.specs?.accessory_kind);
  const isService = kind?.value === "installation-services";
  const Icon = kind?.value === "brackets" ? Ruler : kind?.value === "wifi-modules" ? Wifi : kind?.value === "remotes" ? Radio : kind?.value === "pipes-trunking" ? Cable : Package;
  const price = getAccessoryPrice(product);
  const hasSale = !product.is_enquiry_only && !product.has_variants && price < product.price_zar;
  const href = `/products/${product.slug}`;
  const image = getAccessoryCardImage(product);
  const hasPhoto = image && !imageFailed;
  const available = !isService && !product.stock.is_sold_out && product.stock.stock_count > 0;
  const needsOptions = product.has_variants || (product.is_enquiry_only && !isService);
  const specs = [product.specs?.size, product.specs?.length, product.specs?.material, isService ? product.specs?.pipe_run : null].filter((value): value is string => typeof value === "string");

  return (
    <article className="accessory-card group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
      <Link href={href} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-600" aria-label={`View ${product.name}`}>
        {hasPhoto ? (
          <>
            <Image src={image.src} alt={image.illustrative ? `${kind?.label || "Accessory"} illustration; actual product may vary` : product.name} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 25vw, 20vw" className={cn("transition-transform", isService ? "object-cover group-hover:scale-105" : image.illustrative && (kind?.value === "brackets" || kind?.value === "installation-kits") ? "object-contain p-4 group-hover:scale-105" : image.illustrative ? "object-cover p-3 group-hover:scale-105" : "object-contain p-5 group-hover:scale-105")} onError={() => setImageFailed(true)} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="flex size-20 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sky-700 shadow-sm"><Icon className="size-10" strokeWidth={1.25} aria-hidden="true" /></div>
            <span className="text-xs">Photo coming soon</span>
          </div>
        )}
        {hasSale && <span className="absolute left-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Save {Math.round((1 - price / product.price_zar) * 100)}%</span>}
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-sky-700">{kind?.label || "Accessory"}</span>
        <h2 className="accessory-title min-h-10 font-semibold text-[#1E3A5F]"><Link href={href} className="line-clamp-2 hover:underline focus-visible:outline-sky-600">{product.name}</Link></h2>
        <div className="my-2 flex min-h-6 flex-wrap gap-1.5">
          {specs.map((spec) => <span key={spec} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{spec}</span>)}
        </div>
        <p className="accessory-description mb-3 line-clamp-2 min-h-9 text-slate-500">{product.description || "Check compatibility with your air conditioner before ordering."}</p>
        <div className="mt-auto">
          <div className="mb-2 flex min-h-7 flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-semibold tracking-tight text-[#1E3A5F]">{product.is_enquiry_only ? "Price on request" : `${product.has_variants ? "From " : ""}${formatZAR(product.min_variant_price ?? price)}`}</span>
            {hasSale && <span className="text-xs text-slate-400 line-through">{formatZAR(product.price_zar)}</span>}
          </div>
          <span className={cn("mb-3 flex items-center gap-1.5 text-[11px]", available ? "text-emerald-700" : "text-slate-500")}>
            <span className={cn("size-1.5 rounded-full", available ? "bg-emerald-500" : "bg-slate-400")} />
            {isService ? "Booking date confirmed on enquiry" : available ? "In stock" : "Availability confirmed on enquiry"}
          </span>
          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <Link href={href} aria-label={`Details for ${product.name}`} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-[#1E3A5F] hover:bg-slate-50 focus-visible:outline-sky-600">Details<ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
            {needsOptions ? (
              <Link href={href} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-[#007FBA] px-2 text-xs font-semibold text-white hover:bg-[#006b9e] focus-visible:outline-sky-600">{product.is_enquiry_only ? "Enquire" : "Choose options"}</Link>
            ) : (
              <button type="button" aria-label={`Add ${product.name} to ${product.is_enquiry_only ? "enquiry" : "cart"}`} onClick={() => addItem({ id: product.id, name: product.name, slug: product.slug, price_zar: product.price_zar, sale_price_zar: hasSale ? price : undefined, images: product.images, type: product.type, is_enquiry_only: product.is_enquiry_only })} className="accessory-add inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#007FBA] px-2 font-semibold text-white hover:bg-[#006b9e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"><ShoppingCart className="size-3.5 shrink-0" aria-hidden="true" />{product.is_enquiry_only ? "Add to enquiry" : "Add to cart"}</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export { AirconProductCard, AirconProductList, AccessoryProductCard };
export type { AirconProduct };
