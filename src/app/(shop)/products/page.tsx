import { Suspense } from "react";
import { AirconProduct } from "@/components/shop/ProductCard";
import { createClient } from "@/utils/supabase/server";
import { filterProducts } from "@/lib/filterProducts";
import ResidentialCategoryClient from "../categories/[slug]/ResidentialCategoryClient";
import type { SupabaseProduct } from "@/lib/fetch-featured-products";
import { cookies } from "next/headers";
import { deriveAcType, deriveIsInverter } from "@/lib/product-classification";

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
    ac_type: product.type === "aircon" ? deriveAcType(product.display_name || product.name) : null,
    is_inverter: product.type === "aircon" ? deriveIsInverter(product.display_name || product.name, product.specs) : undefined,
    specs: product.specs,
    sort_order: product.sort_order,
    has_variants: product.has_variants ?? false,
    min_variant_price: product.min_variant_price ?? null,
    stock: {
      stock_count: product.stock_count,
      is_sold_out: product.is_sold_out,
      low_stock_threshold: product.low_stock_threshold,
    },
  };
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

function buildTypeFilters(products: SupabaseProduct[]): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  products.forEach((p) => {
    const acType = deriveAcType(p.name);
    if (acType) {
      const key = acType.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });
  const typeOrder = ["split system", "cassette", "ceiling concealed", "floor standing", "ducted", "vrf", "package unit"];
  return Array.from(counts.entries())
    .sort((a, b) => {
      const ia = typeOrder.indexOf(a[0]);
      const ib = typeOrder.indexOf(b[0]);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return b[1] - a[1];
    })
    .map(([type, count]) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));
}

function buildPriceBounds(products: SupabaseProduct[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 100000 };
  const prices = products.map((p) => p.price_zar).filter((p) => p > 0);
  if (prices.length === 0) return { min: 0, max: 100000 };
  const min = Math.floor(Math.min(...prices) / 1000) * 1000;
  const max = Math.ceil(Math.max(...prices) / 1000) * 1000;
  return { min, max };
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sale?: string }>;
}) {
  const supabase = createClient(await cookies());
  const [activePromotion, params] = await Promise.all([
    getActivePromotion(),
    searchParams,
  ]);

  const isSale = params.sale === 'true';
  const filtered = await filterProducts(supabase, isSale ? 'sale' : 'all-aircon');

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

  // Build filter options from the products actually on this listing
  const btuOptions = buildBtuFilters(filtered);
  const brandOptions = buildBrandFilters(filtered);
  const typeOptions = buildTypeFilters(filtered);
  const priceBounds = buildPriceBounds(filtered);

  return (
    <>
      {activePromotion && (
        <div className="bg-[#1C99D6] text-white py-3 px-4 text-center">
          <p className="text-sm font-medium">
            {activePromotion.name}
            {activePromotion.code && (
              <span className="ml-2 font-bold">Code: {activePromotion.code}</span>
            )}
          </p>
        </div>
      )}
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <ResidentialCategoryClient
          products={airconProducts}
          btuOptions={btuOptions}
          brandOptions={brandOptions}
          typeOptions={typeOptions}
          priceBounds={priceBounds}
          categoryTitle={isSale ? "Latest Deals" : "All Aircons"}
          categoryDescription={isSale
            ? "Air conditioners currently on promotion. Shop deals by brand, capacity and system type."
            : "The full range — home and business air conditioners. Shop by brand, cooling capacity and system type."}
          productCountLabel={isSale ? "Products on promotion" : "All products"}
          categoryKind="all"
        />
      </Suspense>
    </>
  );
}
