export type Product = {
  id: string;
  slug: string;
  brand: string; // "LG"
  type: "split" | "window" | "portable" | "cassette" | "multi-split";
  title: string; // "DualCool 9,000 BTU wall split"
  images: string[]; // min 3; [0] is the default, [1] and [2] are hover thumbs
  btu: number; // 9000
  kw: number; // 2.6
  roomMinSqm: number; // 15
  roomMaxSqm: number; // 22
  mode: "cooling" | "cooling-heating";
  energyRating: string; // "A++"
  isInverter: boolean;
  noiseDb: number; // 19
  features: Array<"wifi" | "self-clean" | "dehumidify">; // max 3, fixed order
  price: number; // 8999
  compareAtPrice?: number; // 15299 — renders struck through when present
  rating: number; // 4.8
  reviewCount: number; // 541
  stockCount: number;
  installRequired: boolean; // drives the primary CTA
  badge?: { label: string; tone: "success" | "danger" | "warning" };
  // Variant support
  isBaseProduct?: boolean; // true if this is a product family with variants
  variants?: ProductVariant[]; // available BTU size variants
  selectedVariant?: ProductVariant; // currently selected variant
};

export type ProductVariant = {
  id: string;
  slug: string;
  variantName: string; // "9000 BTU", "12000 BTU"
  btu: number; // 9000
  kw: number; // 2.6
  roomMinSqm: number; // 15
  roomMaxSqm: number; // 22
  mode: "cooling" | "cooling-heating";
  energyRating: string; // "A++"
  isInverter: boolean;
  noiseDb: number; // 19
  features: Array<"wifi" | "self-clean" | "dehumidify">;
  price: number; // 8999
  compareAtPrice?: number;
  stockCount: number;
  images?: string[]; // variant-specific images if different from base
  sku?: string;
};
