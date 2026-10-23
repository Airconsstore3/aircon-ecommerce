import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AirconProduct } from "@/components/shop/ProductCard";
import { createClient } from "@/utils/supabase/server";
import { filterProducts } from "@/lib/filterProducts";
import { cookies } from "next/headers";
import type { SupabaseProduct } from "@/lib/fetch-featured-products";
import CategoryClient from "./CategoryClient";
import ResidentialCategoryClient from "./ResidentialCategoryClient";
import AccessoriesCategoryClient from "./AccessoriesCategoryClient";
import { deriveAcType, deriveIsInverter } from "@/lib/product-classification";

// Extended Supabase product with optional catalog display fields
type CatalogProduct = SupabaseProduct & {
  display_name?: string | null;
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

// Category metadata
const categoryInfo: Record<string, { name: string; description: string }> = {
  residential: {
    name: "Residential Aircon",
    description: "Split units, cassette systems, and floor-standing air conditioners for homes",
  },
  commercial: {
    name: "Commercial Aircon",
    description: "High-capacity systems for offices, retail spaces, and commercial buildings",
  },
  maintenance: {
    name: "Maintenance & Service",
    description: "Annual maintenance plans, repairs, and service packages",
  },
  kits: {
    name: "Installation Kits",
    description: "Complete installation kits with piping, brackets, and accessories",
  },
};

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
    specs: product.specs,
    sort_order: product.sort_order,
    created_at: product.created_at,
    stock: {
      stock_count: product.stock_count,
      is_sold_out: product.is_sold_out,
      low_stock_threshold: product.low_stock_threshold,
    },
  };
}

// Adapt Supabase product to AirconProduct with commercial-specific fields
function convertToCommercialAirconProduct(product: CatalogProduct): AirconProduct {
  return {
    ...convertToAirconProduct(product),
    ac_type: deriveAcType(product.name),
    is_inverter: deriveIsInverter(product.name, product.specs),
    specs: product.specs,
    sort_order: product.sort_order,
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
    counts.set(p.type, (counts.get(p.type) || 0) + 1);
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

// Server component to fetch data
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

async function getProductsByCategory(categorySlug: string) {
  const supabase = createClient(await cookies());
  
  // For commercial category, use commercial filter to ensure only commercial aircons (BTU >= 40000)
  if (categorySlug === 'commercial') {
    const filtered = await filterProducts(supabase, 'commercial');
    return filtered;
  }
  
  // For residential category, use residential filter to ensure only residential aircons (BTU <= 32000)
  if (categorySlug === 'residential') {
    const filtered = await filterProducts(supabase, 'residential');
    return filtered;
  }

  // For accessories category, use accessories filter to ensure only accessories (type = 'accessory')
  if (categorySlug === 'accessories') {
    const filtered = await filterProducts(supabase, 'accessories');
    return filtered;
  }
  
  // Filter by category slug using Supabase query
  const filtered = await filterProducts(supabase, 'category', categorySlug);
  return filtered;
}

async function getAllProducts() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .eq('is_parent_product', true);
  
  return data || [];
}

// Build AC type filter options from commercial products
function buildTypeFilters(products: SupabaseProduct[]): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  products.forEach((p) => {
    const acType = deriveAcType(p.name);
    if (acType) {
      const key = acType.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });
  const typeOrder = ["cassette", "ceiling concealed", "floor standing", "ducted", "vrf", "split system", "package unit"];
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

// Build price bounds from products
function buildPriceBounds(products: SupabaseProduct[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 100000 };
  const prices = products.map((p) => p.price_zar).filter((p) => p > 0);
  if (prices.length === 0) return { min: 0, max: 100000 };
  const min = Math.floor(Math.min(...prices) / 1000) * 1000;
  const max = Math.ceil(Math.max(...prices) / 1000) * 1000;
  return { min, max };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: categorySlug } = await params;
  if (categorySlug === 'kits') redirect('/installation?kind=installation-kits');
  // Maintenance has its own catalogue page; the category join doesn't filter
  // correctly for it (non-inner join returns all products).
  if (categorySlug === 'maintenance') redirect('/maintenance');
  
  const [products, allProducts, activePromotion] = await Promise.all([
    getProductsByCategory(categorySlug),
    getAllProducts(),
    getActivePromotion(),
  ]);

  // Residential and Commercial categories: use the Relume-style filter bar layout
  if (categorySlug === 'residential' || categorySlug === 'commercial') {
    const enrichedProducts = products.map(convertToCommercialAirconProduct);

    const categoryBtuOptions = buildBtuFilters(products);
    const categoryBrandOptions = buildBrandFilters(products);
    const categoryTypeOptions = buildTypeFilters(products);
    const categoryPriceBounds = buildPriceBounds(products);

    const isResidential = categorySlug === 'residential';
    const categoryTitle = isResidential
      ? "Residential Air Conditioning"
      : "Commercial Air Conditioning";
    const categoryDescription = isResidential
      ? "Find your everyday comfort. Shop air conditioners by brand, cooling capacity and system type."
      : "Find the right cooling for your business. Shop commercial systems by brand, capacity and system type.";
    const productCountLabel = isResidential
      ? "Residential Air Conditioners"
      : "Commercial Air Conditioners";

    return (
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <ResidentialCategoryClient
          products={enrichedProducts}
          btuOptions={categoryBtuOptions}
          brandOptions={categoryBrandOptions}
          typeOptions={categoryTypeOptions}
          priceBounds={categoryPriceBounds}
          categoryTitle={categoryTitle}
          categoryDescription={categoryDescription}
          productCountLabel={productCountLabel}
          categoryKind={isResidential ? "residential" : "commercial"}
        />
      </Suspense>
    );
  }

  // Accessories category: use the same premium layout but with accessory-appropriate filters
  if (categorySlug === 'accessories') {
    const accessoryProducts = products.map(convertToAirconProduct);
    const categoryBrandOptions = buildBrandFilters(products);

    return (
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <AccessoriesCategoryClient
          products={accessoryProducts}
          brandOptions={categoryBrandOptions}
          categoryTitle="Aircon Accessories"
          categoryDescription="Brackets, installation kits and smart controls. The finishing touches for your aircon setup."
          productCountLabel="Accessories"
        />
      </Suspense>
    );
  }

  const airconProducts = products.map(convertToAirconProduct);

  // Build filter options from Supabase data
  const categoryOptions = buildCategoryFilters(allProducts);
  const btuOptions = buildBtuFilters(allProducts);
  const brandOptions = buildBrandFilters(allProducts);

  const category = categoryInfo[categorySlug] || {
    name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
    description: "Browse our selection",
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CategoryClient 
        categorySlug={categorySlug}
        category={category}
        products={airconProducts}
        activePromotion={activePromotion}
        categoryOptions={categoryOptions}
        btuOptions={btuOptions}
        brandOptions={brandOptions}
      />
    </Suspense>
  );
}
