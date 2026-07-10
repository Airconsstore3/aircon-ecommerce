import "photoswipe/style.css";
import { Metadata } from "next";
import { headers } from "next/headers";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getBaseUrl() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host") || "airconsstore.co.za";
  return `${protocol}://${host}`;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = await getBaseUrl();
  const supabase = createClient(await cookies());

  const { data: product } = await supabase
    .from("products")
    .select("name, description, brand, price_zar, sale_price_zar, images, slug, type, btu_range")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!product) {
    return { title: "Product not found | Aircons Store" };
  }

  const title = `${product.name} | Aircons Store`;
  const description =
    product.description?.slice(0, 160) ||
    `Buy ${product.name} at Aircons Store. ${product.btu_range ? product.btu_range.toLocaleString() + " BTU " : ""}${product.type.replace(/_/g, " ")} air conditioner.`;
  const imageUrl = product.images?.[0]
    ? product.images[0].startsWith("http")
      ? product.images[0]
      : `${baseUrl}${product.images[0]}`
    : `${baseUrl}/opengraph-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products/${slug}`,
      siteName: "Aircons Store",
      locale: "en_ZA",
      type: "website",
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const baseUrl = await getBaseUrl();
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: airconProduct.name,
    image: airconProduct.images,
    description: airconProduct.description,
    brand: {
      "@type": "Brand",
      name: airconProduct.brand || "Aircons Store",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${slug}`,
      priceCurrency: "ZAR",
      price: (airconProduct.sale_price_zar ?? airconProduct.price_zar).toString(),
      availability: airconProduct.stock.is_sold_out
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={airconProduct} />
    </>
  );
}
