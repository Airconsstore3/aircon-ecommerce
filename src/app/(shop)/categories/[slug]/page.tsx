import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, LayoutGrid, Grid3x3, Grid2x2, ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { AirconProductList, AirconProduct } from "@/components/shop/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { createClient } from "@/utils/supabase/server";
import { filterProducts } from "@/lib/filterProducts";
import { cookies } from "next/headers";
import CategoryClient from "./CategoryClient";

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
function convertToAirconProduct(product: any): AirconProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    btu_size: product.btu_range ? `${product.btu_range}BTU` : null,
    btu_range: product.btu_range,
    type: product.type,
    price_zar: product.price_zar,
    sale_price_zar: product.sale_price_zar || null,
    images: product.images,
    is_enquiry_only: product.is_enquiry_only,
    is_featured: product.is_featured,
    description: product.description,
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

function buildCategoryFilters(products: any[]) {
  const counts = new Map<string, number>();
  products.forEach((p) => {
    counts.set(p.type, (counts.get(p.type) || 0) + 1);
    if (p.type === "aircon" && p.btu_range !== null) {
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

function buildBtuFilters(products: any[]) {
  const counts = new Map<number, number>();
  products.forEach((p) => {
    if (p.btu_range !== null) {
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

function buildBrandFilters(products: any[]) {
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
    (promo: any) =>
      (!promo.starts_at || new Date(promo.starts_at) <= now) &&
      (!promo.expires_at || new Date(promo.expires_at) >= now)
  );
}

async function getProductsByCategory(categorySlug: string) {
  const supabase = createClient(await cookies());
  
  // Filter by category slug using Supabase query
  const filtered = await filterProducts(supabase, 'category', categorySlug);
  return filtered;
}

async function getAllProducts() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true);
  
  return data || [];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: categorySlug } = await params;
  
  const [products, allProducts, activePromotion] = await Promise.all([
    getProductsByCategory(categorySlug),
    getAllProducts(),
    getActivePromotion(),
  ]);

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
