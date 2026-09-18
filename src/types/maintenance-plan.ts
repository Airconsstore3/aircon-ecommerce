// ─── Maintenance Plan Configuration Types ────────────────────────────────────
// These types mirror the Supabase tables created in migration
// 20260811_create_maintenance_plan_config.sql

export interface MaintenancePlan {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  frequency_months: number;
  terms: string | null;
  requires_terms_acceptance: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface MaintenancePlanService {
  id: string;
  plan_id: string;
  service: string;
  sort_order: number;
}

export interface MaintenancePricingRule {
  id: string;
  plan_id: string;
  min_btu: number | null;
  max_btu: number | null;
  unit_type: string | null;
  brand: string | null;
  model: string | null;
  purchase_source: string | null;
  quantity_min: number;
  quantity_max: number;
  price: number | null;
  display_prefix: string | null;
  price_on_request: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface MaintenanceEligibilityRule {
  id: string;
  plan_id: string;
  min_btu: number | null;
  max_btu: number | null;
  unit_type: string | null;
  brand: string | null;
  model: string | null;
  requires_purchase_from_aircons_store: boolean;
  requires_serviceable_condition: string | null;
  eligible: boolean;
  message: string | null;
  is_active: boolean;
}

export interface MaintenancePlanConfig {
  plans: MaintenancePlan[];
  services: MaintenancePlanService[];
  pricingRules: MaintenancePricingRule[];
  eligibilityRules: MaintenanceEligibilityRule[];
}

export const EMPTY_MAINTENANCE_CONFIG: MaintenancePlanConfig = {
  plans: [],
  services: [],
  pricingRules: [],
  eligibilityRules: [],
};

export interface ResolvedMaintenancePrice {
  plan: MaintenancePlan;
  /** exact price in ZAR cents as a number, or null when the price is on request */
  price: number | null;
  /** how to display the price prefix: "R", "From R" etc. */
  displayPrefix: string;
  priceOnRequest: boolean;
}

export interface MaintenancePlanSelection {
  planId: string;
  purchasedFromAirconsStore: boolean | null;
  quantity: number;
  termsAccepted: boolean;
}
