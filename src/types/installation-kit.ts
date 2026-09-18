// ─── Installation Kit Configuration Types ────────────────────────────────────
// These types mirror the Supabase tables created in migration
// 20260820_create_installation_kit_config.sql

export interface InstallationKitOption {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  is_active: boolean;
  sort_order: number;
}

export interface PipeMaterialOption {
  id: string;
  name: string;
  price_offset: number;
  is_active: boolean;
  sort_order: number;
}

export interface PipeSizeOption {
  id: string;
  material_id: string;
  label: string;
  price_offset: number;
  is_active: boolean;
  sort_order: number;
}

export interface PipeLengthOption {
  id: string;
  kit_id: string;
  length_m: number;
  price_offset: number;
  is_active: boolean;
  sort_order: number;
}

export interface BracketOption {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
}

export interface InsulationOption {
  id: string;
  name: string;
  price_offset: number;
  is_active: boolean;
  sort_order: number;
}

export interface ProtectiveCageOption {
  id: string;
  name: string;
  price: number;
  is_custom: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface KitMaterialCompat {
  kit_id: string;
  material_id: string;
}

export interface KitBracketCompat {
  kit_id: string;
  bracket_id: string;
}

export interface KitInsulationCompat {
  kit_id: string;
  insulation_id: string;
}

export interface KitCageCompat {
  kit_id: string;
  cage_id: string;
}

export interface InstallationPricingRule {
  id: string;
  kit_id: string | null;
  material_id: string | null;
  pipe_size_id: string | null;
  pipe_length_id: string | null;
  bracket_id: string | null;
  insulation_id: string | null;
  cage_id: string | null;
  product_id: string | null;
  btu_min: number | null;
  btu_max: number | null;
  unit_type: string | null;
  brand: string | null;
  additional_price: number;
  price_on_request: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface ResolvedInstallationPrice {
  price: number;
  priceOnRequest: boolean;
  breakdown: { label: string; price: number }[];
  additionalOptionsTotal: number;
  message: string | null;
}

export interface ProductInstallationContext {
  id: string;
  name: string;
  display_name: string | null;
  brand: string | null;
  btu_range: number | null;
  type: string | null;
}

// ─── Aggregate config returned by fetchInstallationKitConfig ──────────────────

export interface InstallationKitConfig {
  kits: InstallationKitOption[];
  pipeMaterials: PipeMaterialOption[];
  pipeSizes: PipeSizeOption[];
  pipeLengths: PipeLengthOption[];
  brackets: BracketOption[];
  insulations: InsulationOption[];
  cages: ProtectiveCageOption[];
  pricingRules: InstallationPricingRule[];
  materialCompat: KitMaterialCompat[];
  bracketCompat: KitBracketCompat[];
  insulationCompat: KitInsulationCompat[];
  cageCompat: KitCageCompat[];
}

// ─── User's selected configuration ───────────────────────────────────────────

export interface KitConfiguration {
  kitId: string;
  materialId: string;
  pipeSizeId: string;
  pipeLengthId: string;
  bracketId: string;
  insulationId: string;
  hasCage: boolean;
  cageId: string | null;
  customCageDimensions?: {
    width: string;
    height: string;
    depth: string;
  };
}

// ─── Empty config (used as fallback) ─────────────────────────────────────────

export const EMPTY_KIT_CONFIG: InstallationKitConfig = {
  kits: [],
  pipeMaterials: [],
  pipeSizes: [],
  pipeLengths: [],
  brackets: [],
  insulations: [],
  cages: [],
  pricingRules: [],
  materialCompat: [],
  bracketCompat: [],
  insulationCompat: [],
  cageCompat: [],
};
