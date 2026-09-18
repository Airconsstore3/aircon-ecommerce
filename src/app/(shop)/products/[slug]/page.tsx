import "photoswipe/style.css";
import { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { serviceRoleClient } from "@/lib/supabase-service";
import { ProductDetailClient } from "./ProductDetailClient";
import { cookies } from "next/headers";
import { fetchInstallationKitConfig } from "@/lib/installation-kit-config";
import { fetchMaintenancePlanConfig } from "@/lib/maintenance-plan-config";
import { fetchWarrantyConfig } from "@/lib/warranty-config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductFeature {
  name: string;
  icon?: string;
}

interface ProductDocument {
  name: string;
  url: string;
  type?: string;
}

interface AirconProduct {
  id: string;
  name: string;
  display_name?: string | null;
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
  product_features?: ProductFeature[];
  room_coverage?: string | null;
  documents?: ProductDocument[];
  installation_terms?: string | null;
  shipping_info?: string | null;
  returns_info?: string | null;
  rating?: number;
  review_count?: number;
  installation_pricing?: Record<string, number>;
  protection_plan_price?: number;
  care_instructions?: string[] | string | null;
  shipping_summary?: string | null;
  shipping_policy_url?: string | null;
  return_policy_summary?: string | null;
  return_policy_url?: string | null;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  type: string;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  description?: string;
  is_enquiry_only: boolean;
}

interface ProductVariant {
  id: string;
  slug: string;
  btu_range: number | null;
  price_zar: number;
  sale_price_zar: number | null;
  images: string[];
  stock_count: number;
  is_sold_out: boolean;
  low_stock_threshold: number;
  room_coverage?: string | null;
  specs?: Record<string, string>;
  is_enquiry_only: boolean;
  variant_name?: string | null;
  variant_attributes?: Record<string, unknown>;
  display_name?: string | null;
  description?: string | null;
  documents?: ProductDocument[];
}

interface BreadcrumbItem {
  label: string;
  url: string;
}

// Row types for Supabase junction/collection queries
interface ProductCollectionRow {
  collection_id: string;
  sort_order: number;
}

interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Deterministic placeholder ratings — same product always gets same values
// Uses a simple string hash of the product ID as seed
function getPlaceholderRating(productId: string): { rating: number; review_count: number } {
  // Simple deterministic hash from product ID
  let hash = 0;
  const str = productId;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Use absolute value and derive rating + review_count
  const absHash = Math.abs(hash);

  // Rating: 4.6 to 5.0 (one decimal place)
  // Distribution: most products 4.7-4.9, some 4.6, fewer 5.0
  const ratingBucket = absHash % 100;
  let rating: number;
  if (ratingBucket < 15) rating = 5.0;       // 15% get 5.0
  else if (ratingBucket < 35) rating = 4.6;    // 20% get 4.6
  else if (ratingBucket < 55) rating = 4.7;    // 20% get 4.7
  else if (ratingBucket < 80) rating = 4.8;    // 25% get 4.8
  else rating = 4.9;                           // 20% get 4.9

  // Review count: 99 to 780, spread using a different slice of the hash
  const reviewHash = Math.abs((hash >> 8) ^ str.length);
  const review_count = 99 + (reviewHash % 682); // 99 to 780

  return { rating, review_count };
}

async function getBaseUrl() {
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") || "https";
  const host = headersList.get("host") || "airconsstore.co.za";
  return `${protocol}://${host}`;
}

// Fetch the full collection hierarchy (parent chain) for a product via product_collections junction
async function fetchCollectionBreadcrumbs(
  supabase: ReturnType<typeof createClient>,
  productId: string
): Promise<BreadcrumbItem[]> {
  // Get all collections linked to this product, ordered by sort_order
  const { data: productCollections } = await supabase
    .from("product_collections")
    .select("collection_id, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (!productCollections || productCollections.length === 0) return [];

  // Fetch all linked collections
  const collectionIds = productCollections.map((pc: ProductCollectionRow) => pc.collection_id);
  const { data: collectionsData } = await supabase
    .from("collections")
    .select("id, name, slug, parent_id, sort_order")
    .in("id", collectionIds)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (!collectionsData || collectionsData.length === 0) return [];

  // Build a map for quick lookup
  const collectionMap = new Map<string, { id: string; name: string; slug: string; parent_id: string | null }>();
  for (const c of collectionsData as CollectionRow[]) {
    collectionMap.set(c.id, { id: c.id, name: c.name, slug: c.slug, parent_id: c.parent_id });
  }

  // Find the deepest collection (one with no children in the set) to start walking up
  // Strategy: pick the collection that has the most ancestors — that's the most specific one
  let bestCollectionId: string | null = null;
  let maxDepth = -1;

  for (const pc of productCollections) {
    const cid = (pc as ProductCollectionRow).collection_id;
    let depth = 0;
    let currentId: string | null = cid;
    const visited = new Set<string>();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = collectionMap.get(currentId);
      if (!node) break;
      depth++;
      currentId = node.parent_id;
    }
    if (depth > maxDepth) {
      maxDepth = depth;
      bestCollectionId = cid;
    }
  }

  if (!bestCollectionId) return [];

  // Walk up the parent chain from the most specific collection
  const trail: BreadcrumbItem[] = [];
  let currentId: string | null = bestCollectionId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = collectionMap.get(currentId);
    if (!node) break;
    trail.unshift({
      label: node.name,
      url: `/collections/${node.slug}`,
    });
    currentId = node.parent_id;
  }

  // If no parent chain was built (e.g. the collection exists but has no hierarchy),
  // still include the collection itself
  if (trail.length === 0) {
    const node = collectionMap.get(bestCollectionId);
    if (node) {
      trail.push({ label: node.name, url: `/collections/${node.slug}` });
    }
  }

  return trail;
}

// Fetch the full category hierarchy (parent chain) for a product
async function fetchCategoryBreadcrumbs(
  supabase: ReturnType<typeof createClient>,
  categoryId: string | null
): Promise<BreadcrumbItem[]> {
  if (!categoryId) return [];

  const trail: BreadcrumbItem[] = [];
  let currentId: string | null = categoryId;
  const visited = new Set<string>(); // prevent infinite loops

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const result = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("id", currentId)
      .single();
    const category = result.data as { id: string; name: string; slug: string; parent_id: string | null } | null;
    if (result.error || !category) break;

    trail.unshift({
      label: category.name,
      url: `/categories/${category.slug}`,
    });

    currentId = category.parent_id;
  }

  return trail;
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
    display_name: product.display_name,
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
    product_features: product.product_features,
    room_coverage: product.room_coverage,
    documents: product.documents,
    installation_terms: product.installation_terms,
    shipping_info: product.shipping_info,
    returns_info: product.returns_info,
    rating: product.rating ? Number(product.rating) : getPlaceholderRating(product.id).rating,
    review_count: product.review_count ?? getPlaceholderRating(product.id).review_count,
    installation_pricing: product.installation_pricing,
    protection_plan_price: product.protection_plan_price ?? 0,
    care_instructions: product.care_instructions,
  };

  // Fetch global site settings for delivery/return policy tabs
  // Uses service role client because settings table has RLS enabled (no anon SELECT)
  const { data: settings, error: settingsError } = await serviceRoleClient
    .from("settings")
    .select("shipping_summary, shipping_policy_url, return_policy_summary, return_policy_url")
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    console.error("[ProductPage] Error fetching settings:", settingsError.message);
  }

  if (settings) {
    airconProduct.shipping_summary = settings.shipping_summary;
    airconProduct.shipping_policy_url = settings.shipping_policy_url;
    airconProduct.return_policy_summary = settings.return_policy_summary;
    airconProduct.return_policy_url = settings.return_policy_url;
  }

  // Fetch product variants using parent_product_id / is_parent_product system
  let variantQuery = supabase
    .from("products")
    .select("id, slug, btu_range, price_zar, sale_price_zar, images, stock_count, is_sold_out, low_stock_threshold, specs, is_enquiry_only, variant_attributes, display_name, description, documents, variant_order")
    .eq("is_published", true);

  if (product.parent_product_id) {
    // This is a variant — fetch all siblings + the parent product
    variantQuery = variantQuery.or(`parent_product_id.eq.${product.parent_product_id},id.eq.${product.parent_product_id}`);
  } else if (product.is_parent_product) {
    // This is a parent product — fetch itself + all its variants
    variantQuery = variantQuery.or(`id.eq.${product.id},parent_product_id.eq.${product.id}`);
  } else {
    // Standalone product (no variants) — just this product
    variantQuery = variantQuery.eq("id", product.id);
  }

  const { data: variantRaw, error: variantError } = await variantQuery.order("variant_order", { ascending: true, nullsFirst: false });

  if (variantError) {
    console.error('[ProductPage] Variant query error:', variantError.message);
  }

  const variants: ProductVariant[] = (variantRaw || []).map((v) => ({
    id: v.id,
    slug: v.slug,
    btu_range: v.btu_range,
    price_zar: v.price_zar,
    sale_price_zar: v.sale_price_zar || null,
    images: v.images || [],
    stock_count: v.stock_count ?? 0,
    is_sold_out: v.is_sold_out ?? false,
    low_stock_threshold: v.low_stock_threshold ?? 3,
    room_coverage: null,
    specs: v.specs,
    is_enquiry_only: v.is_enquiry_only ?? false,
    variant_name: null,
    variant_attributes: v.variant_attributes,
    display_name: v.display_name,
    description: v.description,
    documents: v.documents,
  }));

  // Build dynamic breadcrumbs: try collections first, fall back to categories
  const collectionBreadcrumbs = await fetchCollectionBreadcrumbs(supabase, product.id);
  const categoryBreadcrumbs = collectionBreadcrumbs.length > 0
    ? []
    : await fetchCategoryBreadcrumbs(supabase, product.category_id ?? null);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", url: "/" },
    ...collectionBreadcrumbs,
    ...categoryBreadcrumbs,
    { label: product.display_name || product.name, url: "" }, // last item: no link
  ];
  // Fetch related products: match BTU, prefer different brands, exclude same parent group
  // Only show parent products (not variants) in related products
  const currentParentId = product.parent_product_id || product.id;
  const { data: relatedRaw } = await supabase
    .from("products")
    .select("id, name, slug, brand, type, price_zar, sale_price_zar, images, description, is_enquiry_only, display_name")
    .eq("is_published", true)
    .eq("is_parent_product", true)
    .eq("btu_range", product.btu_range)
    .neq("id", currentParentId)
    .order("is_featured", { ascending: false })
    .limit(20);

  // Prefer different brands — sort to put different brands first
  const relatedSorted = (relatedRaw || []).sort((a, b) => {
    const aSameBrand = a.brand === product.brand ? 1 : 0;
    const bSameBrand = b.brand === product.brand ? 1 : 0;
    return aSameBrand - bSameBrand;
  });

  const relatedProducts: RelatedProduct[] = relatedSorted.slice(0, 4).map((item) => {
    const placeholder = getPlaceholderRating(item.id);
    return {
      id: item.id,
      name: item.display_name || item.name,
      slug: item.slug,
      brand: item.brand,
      type: item.type,
      price_zar: item.price_zar,
      sale_price_zar: item.sale_price_zar || null,
      images: item.images,
      description: item.description,
      is_enquiry_only: item.is_enquiry_only,
      rating: placeholder.rating,
      review_count: placeholder.review_count,
    };
  });

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

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.url ? { item: `${baseUrl}${item.url}` } : {}),
    })),
  };

  // Fetch installation kit configuration from Supabase
  const kitConfig = await fetchInstallationKitConfig();

  // Fetch maintenance plan configuration from Supabase
  const maintenanceConfig = await fetchMaintenancePlanConfig();

  // Fetch warranty configuration from Supabase
  const warrantyConfig = await fetchWarrantyConfig();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient product={airconProduct} relatedProducts={relatedProducts} variants={variants} breadcrumbs={breadcrumbs} kitConfig={kitConfig} maintenanceConfig={maintenanceConfig} warrantyConfig={warrantyConfig} />
    </>
  );
}
