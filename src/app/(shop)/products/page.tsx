import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, LayoutGrid, Grid3x3, Grid2x2, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { AirconProductList, AirconProduct } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { createClient } from "@/utils/supabase/server";
import { filterProducts } from "@/lib/filterProducts";
import ProductsClient from "./ProductsClient";
import type { SupabaseProduct } from "@/lib/fetch-featured-products";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

// ─── Types ───────────────────────────────────────────────────────────────────

// Extended Supabase product with optional catalog display fields
type CatalogProduct = SupabaseProduct & {
  display_name?: string | null;
  has_variants?: boolean;
  min_variant_price?: number | null;
};

// Active promotion row from the promotions table
interface Promotion {
  id?: string;
  name?: string;
  code?: string | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
}

// Adapt Supabase product to AirconProduct with stock info
function convertToAirconProduct(product: CatalogProduct): AirconProduct {
  return {
    id: product.id,
    name: product.display_name || product.name,
    slug: product.slug,
    brand: product.brand ?? null,
    btu_size: product.btu_range ? `${product.btu_range}BTU` : null,
    btu_range: product.btu_range ?? null,
    type: product.type,
    price_zar: product.price_zar,
    sale_price_zar: product.sale_price_zar || null,
    images: product.images,
    is_enquiry_only: product.is_enquiry_only,
    is_featured: product.is_featured,
    description: product.description,
    has_variants: product.has_variants ?? false,
    min_variant_price: product.min_variant_price ?? null,
    stock: {
      stock_count: product.stock_count,
      is_sold_out: product.is_sold_out,
      low_stock_threshold: product.low_stock_threshold,
    },
  };
}

// Build filter options from Supabase data
const CATEGORY_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  aircon: "Air Conditioners",
  kit: "Kits & Bundles",
  accessory: "Accessories & Services",
};

function buildCategoryFilters(products: SupabaseProduct[]) {
  const counts = new Map<string, number>();
  products.forEach((p) => {
    // Base type count
    counts.set(p.type, (counts.get(p.type) || 0) + 1);

    // Derived residential/commercial counts
    if (p.type === "aircon" && p.btu_range != null) {
      if (p.btu_range <= 32000) {
        counts.set("residential", (counts.get("residential") || 0) + 1);
      }
      if (p.btu_range >= 32000) {
        counts.set("commercial", (counts.get("commercial") || 0) + 1);
      }
    }
  });

  const entries = Array.from(counts.entries());

  return entries
    .map(([type, count]) => ({
      value: type,
      label: CATEGORY_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }))
    .sort((a, b) => {
      const priority: Record<string, number> = { residential: 0, commercial: 1 };
      const pa = priority[a.value] ?? 2;
      const pb = priority[b.value] ?? 2;
      if (pa !== pb) return pa - pb;
      return b.count - a.count;
    });
}

function buildBtuFilters(products: SupabaseProduct[]) {
  const counts = new Map<number, number>();
  products.forEach((p) => {
    if (p.btu_range != null) {
      counts.set(p.btu_range, (counts.get(p.btu_range) || 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([btu, count]) => ({
      value: String(btu),
      label: `${btu.toLocaleString()} BTU`,
      count,
    }));
}

function buildBrandFilters(products: SupabaseProduct[]) {
  const counts = new Map<string, number>();
  products.forEach((p) => {
    if (p.brand) {
      const key = p.brand.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([brand, count]) => ({
      value: brand,
      label: brand.charAt(0).toUpperCase() + brand.slice(1),
      count,
    }));
}

// ─── Server Component ───────────────────────────────────────────────────────────

async function getActivePromotion() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true);
  
  const now = new Date();
  return data?.find(
    (promo: Promotion) =>
      (!promo.starts_at || new Date(promo.starts_at) <= now) &&
      (!promo.expires_at || new Date(promo.expires_at) >= now)
  );
}

async function getProducts() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_parent_product', true);
  
  return data || [];
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sale?: string }>;
}) {
  const supabase = createClient(await cookies());
  const [products, activePromotion, params] = await Promise.all([
    getProducts(),
    getActivePromotion(),
    searchParams,
  ]);

  const saleParam = params.sale === 'true' ? 'sale' : 'all-aircon';
  const filtered = await filterProducts(supabase, saleParam);

  // Fetch variant data for all parent products to compute "From R..." pricing
  const parentIds = filtered.map((p: SupabaseProduct) => p.id);
  const variantPriceMap: Record<string, { minPrice: number; hasVariants: boolean }> = {};

  if (parentIds.length > 0) {
    const { data: variants } = await supabase
      .from('products')
      .select('parent_product_id, price_zar, sale_price_zar')
      .in('parent_product_id', parentIds)
      .eq('is_published', true);

    if (variants && variants.length > 0) {
      const priceMap: Record<string, number[]> = {};
      for (const v of variants) {
        const pid = v.parent_product_id;
        if (!pid) continue;
        if (!priceMap[pid]) priceMap[pid] = [];
        const effectivePrice = v.sale_price_zar ?? v.price_zar;
        priceMap[pid].push(effectivePrice);
      }
      for (const [pid, prices] of Object.entries(priceMap)) {
        variantPriceMap[pid] = {
          minPrice: Math.min(...prices),
          hasVariants: true,
        };
      }
    }
  }

  const airconProducts = filtered.map((p: CatalogProduct) => {
    const converted = convertToAirconProduct(p);
    const variantInfo = variantPriceMap[p.id];
    if (variantInfo) {
      converted.has_variants = true;
      converted.min_variant_price = variantInfo.minPrice;
    }
    return converted;
  });

  // Build filter options from Supabase data
  const categoryOptions = buildCategoryFilters(products);
  const btuOptions = buildBtuFilters(products);
  const brandOptions = buildBrandFilters(products);

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsClient 
        products={airconProducts}
        activePromotion={activePromotion}
        initialSaleParam={saleParam}
        categoryOptions={categoryOptions}
        btuOptions={btuOptions}
        brandOptions={brandOptions}
      />
    </Suspense>
  );
}
