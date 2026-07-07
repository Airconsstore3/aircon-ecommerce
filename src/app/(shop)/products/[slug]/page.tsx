import "photoswipe/style.css";
import { createClient } from "@/utils/supabase/server";
import { ProductDetailClient } from "./ProductDetailClient";
import { cookies } from "next/headers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AirconProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  btu_size: string | null;
  btu_range: number | null;
  available_btu_sizes: number[] | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  is_enquiry_only: boolean;
  is_featured: boolean;
  description?: string;
  specs?: Record<string, string>;
  stock: {
    stock_count: number;
    is_sold_out: boolean;
    low_stock_threshold: number;
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createClient(await cookies());
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!product) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Product not found.</p>
          <p className="text-xs text-muted-foreground">Looking for slug: {slug}</p>
        </div>
      </div>
    );
  }

  // Adapt Supabase product to AirconProduct with stock info
  const airconProduct: AirconProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    btu_size: product.btu_range ? `${product.btu_range}BTU` : null,
    btu_range: product.btu_range,
    available_btu_sizes: product.available_btu_sizes,
    type: product.type,
    price_zar: product.price_zar,
    sale_price_zar: product.sale_price_zar || null,
    images: product.images,
    is_enquiry_only: product.is_enquiry_only,
    is_featured: product.is_featured,
    description: product.description,
    specs: product.specs,
    stock: {
      stock_count: product.stock_count,
      is_sold_out: product.is_sold_out,
      low_stock_threshold: product.low_stock_threshold,
    },
  };

  return <ProductDetailClient product={airconProduct} />;
}
