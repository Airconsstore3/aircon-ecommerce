// ─── Warranty Configuration Types ─────────────────────────────────────────────
// Mirrors the Supabase tables created in 20260822_create_warranty_config.sql

export interface WarrantyOption {
  id: string;
  name: string;
  period_months: number;
  description: string | null;
  short_description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface WarrantyPricingRule {
  id: string;
  option_id: string;
  product_id: string | null;
  btu_min: number | null;
  btu_max: number | null;
  brand: string | null;
  unit_type: string | null;
  category: string | null;
  base_price: number;
  additional_price: number;
  price_on_request: boolean;
  requires_confirmation: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface WarrantyTerms {
  option_id: string;
  terms: string;
}

export interface WarrantyConfig {
  options: WarrantyOption[];
  pricingRules: WarrantyPricingRule[];
  terms: WarrantyTerms[];
}

export const EMPTY_WARRANTY_CONFIG: WarrantyConfig = {
  options: [],
  pricingRules: [],
  terms: [],
};

export interface ResolvedWarrantyPrice {
  optionId: string;
  price: number;
  priceOnRequest: boolean;
  requiresConfirmation: boolean;
  message: string | null;
}

export interface WarrantySelection {
  optionId: string;
  termsAccepted: boolean;
}
