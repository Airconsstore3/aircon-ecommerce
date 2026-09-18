import { createClient } from "@/utils/supabase/server";
import {
  MaintenancePlanConfig,
  EMPTY_MAINTENANCE_CONFIG,
} from "@/types/maintenance-plan";

/**
 * Fetches the complete maintenance plan configuration from Supabase.
 *
 * Returns active plans, their included services, pricing rules and
 * eligibility rules. If the tables don't exist or the query fails,
 * returns EMPTY_MAINTENANCE_CONFIG so the UI can fall back gracefully.
 */
export async function fetchMaintenancePlanConfig(): Promise<MaintenancePlanConfig> {
  const cookieStore = await import("next/headers").then((mod) => mod.cookies());
  const supabase = createClient(await cookieStore);

  try {
    const [plansRes, servicesRes, pricingRes, eligibilityRes] = await Promise.all([
      supabase.from("maintenance_plans").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("maintenance_plan_services").select("*").order("sort_order"),
      supabase.from("maintenance_pricing_rules").select("*").eq("is_active", true),
      supabase.from("maintenance_eligibility_rules").select("*").eq("is_active", true),
    ]);

    if (plansRes.error || !plansRes.data || plansRes.data.length === 0) {
      console.warn("[fetchMaintenancePlanConfig] No maintenance plan data found, falling back to empty config");
      return EMPTY_MAINTENANCE_CONFIG;
    }

    return {
      plans: plansRes.data as MaintenancePlanConfig["plans"],
      services: (servicesRes.data ?? []) as MaintenancePlanConfig["services"],
      pricingRules: (pricingRes.data ?? []) as MaintenancePlanConfig["pricingRules"],
      eligibilityRules: (eligibilityRes.data ?? []) as MaintenancePlanConfig["eligibilityRules"],
    };
  } catch (error) {
    console.error("[fetchMaintenancePlanConfig] Error fetching config:", error);
    return EMPTY_MAINTENANCE_CONFIG;
  }
}
