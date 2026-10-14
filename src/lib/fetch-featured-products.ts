import { createClient as createServerClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { filterProducts } from "@/lib/filterProducts";
import type { Product, ProductVariant } from "@/types/product";

export type HeroProductVariant = {
  id: string;
  slug: string;
  btuRange: number | null;
  variantName?: string | null;
  price: number;
  compareAtPrice?: number;
  image?: string;
  stockCount: number;
  isSoldOut: boolean;
};

export type HeroProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image?: string;
  isEnquiryOnly: boolean;
  variants: HeroProductVariant[];
};

type HeroProductRow = Pick<
  SupabaseProduct,
  | "id"
  | "name"
  | "slug"
  | "brand"
  | "btu_range"
  | "images"
  | "price_zar"
  | "sale_price_zar"
  | "is_published"
  | "is_enquiry_only"
  | "is_featured"
  | "is_parent_product"
  | "parent_product_id"
  | "stock_count"
  | "is_sold_out"
  | "sort_order"
>;

export type SupabaseProduct = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category_id: string;
  type: "aircon" | "kit" | "accessory";
  brand?: string;
  btu_range?: number;
  available_btu_sizes?: number[];
  images: string[];
  price_zar: number;
  sale_price_zar?: number;
  is_published: boolean;
  is_enquiry_only: boolean;
  is_featured: boolean;
  is_sale: boolean;
  is_deal: boolean;
  sort_order: number;
  product_series?: string;
  parent_product_id?: string;
  is_base_product?: boolean;
  is_parent_product?: boolean;
  variant_name?: string;
  specs: {
    coverage_area?: string;
    inverter?: boolean;
    energy_rating?: string;
    wifi?: boolean;
    heating_cooling?: boolean;
    voltage?: string;
    refrigerant?: string;
    noise_level?: string;
    warranty?: string;
    installation_included?: boolean;
    free_delivery?: boolean;
    delivery_time?: string;
    [key: string]: unknown;
  };
  documents: unknown[];
  stock_count: number;
  is_sold_out: boolean;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
};

// ─── Adapter: map Supabase product rows to the spec-compliant Product type ───

const ROOM_RANGE_BRACKETS: Array<{ maxBtu: number; min: number; max: number }> = [
  { maxBtu: 9000, min: 15, max: 22 },
  { maxBtu: 12000, min: 23, max: 30 },
  { maxBtu: 18000, min: 31, max: 40 },
  { maxBtu: 24000, min: 41, max: 55 },
  { maxBtu: 30000, min: 56, max: 65 },
  { maxBtu: 36000, min: 66, max: 80 },
  { maxBtu: 48000, min: 81, max: 110 },
  { maxBtu: 60000, min: 111, max: 140 },
];

function estimateRoomRange(btuRange: number | undefined): { min: number; max: number } {
  if (!btuRange) return { min: 0, max: 0 };
  const bracket = ROOM_RANGE_BRACKETS.find((b) => btuRange <= b.maxBtu);
  return bracket ?? { min: 141, max: 200 };
}

function parseRoomRangeFromCoverage(coverageArea: string | undefined): { min: number; max: number } | null {
  if (!coverageArea) return null;
  const matches = coverageArea.match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  if (matches.length === 1) {
    const max = Number(matches[0]);
    return { min: Math.round(max * 0.6), max };
  }
  return { min: Number(matches[0]), max: Number(matches[1]) };
}

function parseNoiseDb(noiseLevel: string | undefined, fallback: number): number {
  if (!noiseLevel) return fallback;
  const match = noiseLevel.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function deriveType(product: SupabaseProduct): Product["type"] {
  const name = product.name.toLowerCase();
  if (name.includes("portable")) return "portable";
  if (name.includes("window")) return "window";
  if (name.includes("cassette")) return "cassette";
  if (name.includes("multi-split") || name.includes("multi split") || name.includes("multi f")) return "multi-split";
  return "split";
}

function mapSupabaseProductToProduct(product: SupabaseProduct): Product {
  const specs = product.specs || {};
  const derivedType = deriveType(product);
  const hasSale = product.sale_price_zar !== undefined && product.sale_price_zar !== null && product.sale_price_zar < product.price_zar;
  const roomRange = parseRoomRangeFromCoverage(specs.coverage_area) ?? estimateRoomRange(product.btu_range);
  const isLowStock = product.stock_count > 0 && product.stock_count <= product.low_stock_threshold;

  const features: Product["features"] = [];
  if (specs.wifi) features.push("wifi");

  let badge: Product["badge"];
  if (hasSale) {
    const percent = Math.round(((product.price_zar - product.sale_price_zar!) / product.price_zar) * 100);
    badge = { label: `Save ${percent}%`, tone: "danger" };
  } else if (isLowStock) {
    badge = { label: `Only ${product.stock_count} left`, tone: "warning" };
  } else if (product.is_featured) {
    badge = { label: "Featured", tone: "success" };
  }

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand || "Aircon",
    type: derivedType,
    title: product.name,
    images: product.images?.length > 0 ? product.images : ["/Hero Images/hero1.1.png"],
    btu: product.btu_range ?? 0,
    kw: product.btu_range ? Math.round((product.btu_range / 3412) * 10) / 10 : 0,
    roomMinSqm: roomRange.min,
    roomMaxSqm: roomRange.max,
    mode: specs.heating_cooling ? "cooling-heating" : "cooling",
    energyRating: specs.energy_rating || "A",
    isInverter: !!specs.inverter,
    noiseDb: parseNoiseDb(specs.noise_level, derivedType === "split" ? 24 : 52),
    features,
    price: hasSale ? product.sale_price_zar! : product.price_zar,
    compareAtPrice: hasSale ? product.price_zar : undefined,
    stockCount: product.stock_count,
    isSoldOut: product.is_sold_out,
    installRequired: derivedType !== "portable" && derivedType !== "window",
    badge,
    isBaseProduct: product.is_base_product,
  };
}

function mapSupabaseProductToVariant(product: SupabaseProduct): ProductVariant {
  const specs = product.specs || {};
  const hasSale = product.sale_price_zar !== undefined && product.sale_price_zar !== null && product.sale_price_zar < product.price_zar;
  const roomRange = parseRoomRangeFromCoverage(specs.coverage_area) ?? estimateRoomRange(product.btu_range);

  const features: Product["features"] = [];
  if (specs.wifi) features.push("wifi");

  return {
    id: product.id,
    slug: product.slug,
    variantName: product.variant_name || `${product.btu_range} BTU`,
    btu: product.btu_range ?? 0,
    kw: product.btu_range ? Math.round((product.btu_range / 3412) * 10) / 10 : 0,
    roomMinSqm: roomRange.min,
    roomMaxSqm: roomRange.max,
    mode: specs.heating_cooling ? "cooling-heating" : "cooling",
    energyRating: specs.energy_rating || "A",
    isInverter: !!specs.inverter,
    noiseDb: parseNoiseDb(specs.noise_level, 24),
    features,
    price: hasSale ? product.sale_price_zar! : product.price_zar,
    compareAtPrice: hasSale ? product.price_zar : undefined,
    stockCount: product.stock_count,
    images: product.images?.length > 0 ? product.images : undefined,
  };
}

function groupProductsByParent(products: SupabaseProduct[]): Product[] {
  // Only return parent products (is_parent_product = true)
  // If a product has no parent_product_id and is_parent_product is true/null, include it
  const result: Product[] = [];
  for (const product of products) {
    if (product.is_parent_product === false) continue; // Skip variants
    result.push(mapSupabaseProductToProduct(product));
  }
  return result;
}

const RESIDENTIAL_BRANDS = ["Samsung", "Daikin", "Alliance", "Jet-Air", "Midea", "Hisense", "LG", "Gree"];

/**
 * Fetches featured products from Supabase on the server side.
 * Returns mapped and grouped Product[] ready for display.
 *
 * Priority:
 * 1. Products explicitly marked is_featured (residential brands, BTU <= 36000)
 * 2. Products on sale
 * 3. Best sellers
 * 4. Latest published products
 */
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

  // Priority 1: Products explicitly marked as featured
  const { data: featured, error: featuredError } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .eq("type", "aircon")
    .in("brand", RESIDENTIAL_BRANDS)
    .lte("btu_range", 36000)
    .order("sort_order", { ascending: true })
    .limit(50);

  if (featuredError) {
    console.error("[fetchFeaturedProducts] featured query error:", featuredError);
  }

  if (featured && featured.length > 0) {
    // If fewer than 5 featured products, supplement with latest-published
    if (featured.length < 5) {
      const { data: latest } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (latest && latest.length > 0) {
        const featuredIds = new Set(featured.map((p) => p.id));
        const additional = latest.filter((p) => !featuredIds.has(p.id));
        const combined = [...featured, ...additional].slice(0, 12);
        return groupProductsByParent(combined as SupabaseProduct[]);
      }
    }
    return groupProductsByParent(featured as SupabaseProduct[]);
  }

  // Priority 2: Products on sale
  const saleProducts = await filterProducts(supabase, "sale");
  if (saleProducts && saleProducts.length > 0) {
    const filteredSale = saleProducts.filter(
      (p: SupabaseProduct) =>
        p.type === "aircon" &&
        RESIDENTIAL_BRANDS.includes(p.brand || "") &&
        (p.btu_range || 0) <= 36000
    );
    if (filteredSale.length > 0) {
      return groupProductsByParent(
        filteredSale
          .sort((a: SupabaseProduct, b: SupabaseProduct) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 12) as SupabaseProduct[]
      );
    }
  }

  // Priority 3: Best sellers
  const { data: bestSellers } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("is_bestseller", true)
    .eq("type", "aircon")
    .in("brand", RESIDENTIAL_BRANDS)
    .lte("btu_range", 36000)
    .order("sort_order", { ascending: true })
    .limit(12);

  if (bestSellers && bestSellers.length > 0) {
    return groupProductsByParent(bestSellers as SupabaseProduct[]);
  }

  // Priority 4: Latest published products
  const allProducts = await filterProducts(supabase, "all-aircon");
  if (allProducts && allProducts.length > 0) {
    const filteredAll = allProducts.filter(
      (p: SupabaseProduct) =>
        p.type === "aircon" &&
        RESIDENTIAL_BRANDS.includes(p.brand || "") &&
        (p.btu_range || 0) <= 36000
    );
    if (filteredAll.length > 0) {
      return groupProductsByParent(
        filteredAll
          .sort((a: SupabaseProduct, b: SupabaseProduct) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 12) as SupabaseProduct[]
      );
    }
  }

  return [];
  } catch (error) {
    console.error("[fetchFeaturedProducts] error:", error);
    return [];
  }
}

const normalizeHeroBrand = (brand: string | null | undefined) =>
  (brand ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Fetches one residential product family per brand for the homepage hero.
 * Parent products define the card; child variants provide the selectable BTU
 * sizes and prices shown in the compact carousel.
 */
export async function fetchResidentialHeroProducts(): Promise<HeroProduct[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { data, error } = await supabase
      .from("products")
      .select("id,name,slug,brand,btu_range,images,price_zar,sale_price_zar,is_published,is_enquiry_only,is_featured,is_parent_product,parent_product_id,stock_count,is_sold_out,sort_order")
      .eq("is_published", true)
      .eq("type", "aircon")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[fetchResidentialHeroProducts] query error:", error);
      return [];
    }

    const parentsByBrand = new Map<string, HeroProductRow>();
    const variantsByParent = new Map<string, HeroProductRow[]>();
    for (const product of (data ?? []) as HeroProductRow[]) {
      const brandKey = normalizeHeroBrand(product.brand);
      if (product.is_parent_product === false || product.parent_product_id) {
        if (product.parent_product_id) {
          const variants = variantsByParent.get(product.parent_product_id) ?? [];
          variants.push(product);
          variantsByParent.set(product.parent_product_id, variants);
        }
        continue;
      }
      if (!brandKey || brandKey === "comfee" || /commercial|portable/i.test(product.name)) continue;
      const hasResidentialBtu = product.btu_range !== undefined && product.btu_range !== null && product.btu_range <= 32000;
      const isHisenseRac = brandKey === "hisense" && /\bRAC\b/i.test(product.name) && !/\bLCAC\b/i.test(product.name);
      if (!hasResidentialBtu && !isHisenseRac) continue;

      const current = parentsByBrand.get(brandKey);
      const productScore = [
        product.is_featured ? 0 : 1,
        product.sale_price_zar && product.sale_price_zar < product.price_zar ? 0 : 1,
        product.sort_order ?? 9999,
        product.price_zar ?? Number.MAX_SAFE_INTEGER,
      ];
      const currentScore = current
        ? [
            current.is_featured ? 0 : 1,
            current.sale_price_zar && current.sale_price_zar < current.price_zar ? 0 : 1,
            current.sort_order ?? 9999,
            current.price_zar ?? Number.MAX_SAFE_INTEGER,
          ]
        : [Infinity, Infinity, Infinity, Infinity];
      const isPreferred = productScore.some((value, index) => value < currentScore[index]) && !productScore.some((value, index) => value > currentScore[index]);
      if (isPreferred) parentsByBrand.set(brandKey, product);
    }

    const ar4500Parent = ((data ?? []) as HeroProductRow[]).find(
      (p) => normalizeHeroBrand(p.brand) === "samsung" && /ar\s?4500/i.test(p.name) && p.is_parent_product !== false && !p.parent_product_id
    );
    if (ar4500Parent) parentsByBrand.set("samsung", ar4500Parent);

    return Array.from(parentsByBrand.values()).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand || "Aircon",
      image: product.images?.[0],
      isEnquiryOnly: product.is_enquiry_only,
      variants: [
        {
          id: product.id,
          slug: product.slug,
          btuRange: product.btu_range ?? null,
          variantName: null,
          price: product.sale_price_zar && product.sale_price_zar < product.price_zar ? product.sale_price_zar : product.price_zar,
          compareAtPrice: product.sale_price_zar && product.sale_price_zar < product.price_zar ? product.price_zar : undefined,
          image: product.images?.[0],
          stockCount: product.stock_count,
          isSoldOut: product.is_sold_out,
        },
        ...(variantsByParent.get(product.id) ?? [])
          .sort((a, b) => (a.btu_range ?? 0) - (b.btu_range ?? 0))
          .map((variant) => ({
            id: variant.id,
            slug: variant.slug,
            btuRange: variant.btu_range ?? null,
            variantName: null,
            price: variant.sale_price_zar && variant.sale_price_zar < variant.price_zar ? variant.sale_price_zar : variant.price_zar,
            compareAtPrice: variant.sale_price_zar && variant.sale_price_zar < variant.price_zar ? variant.price_zar : undefined,
            image: variant.images?.[0] || product.images?.[0],
            stockCount: variant.stock_count,
            isSoldOut: variant.is_sold_out,
          })),
      ],
    }));
  } catch (error) {
    console.error("[fetchResidentialHeroProducts] error:", error);
    return [];
  }
}
