import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { WarrantyConfig, EMPTY_WARRANTY_CONFIG } from "@/types/warranty";

export async function fetchWarrantyConfig(): Promise<WarrantyConfig> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const [optionsRes, pricingRes, termsRes] = await Promise.all([
      supabase.from("warranty_options").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("warranty_pricing_rules").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("warranty_terms").select("*"),
    ]);

    if (optionsRes.error || !optionsRes.data || optionsRes.data.length === 0) {
      console.warn("[fetchWarrantyConfig] No warranty data found, returning empty config");
      return EMPTY_WARRANTY_CONFIG;
    }

    return {
      options: optionsRes.data as WarrantyConfig["options"],
      pricingRules: (pricingRes.data as WarrantyConfig["pricingRules"]) ?? [],
      terms: (termsRes.data as WarrantyConfig["terms"]) ?? [],
    };
  } catch (error) {
    console.error("[fetchWarrantyConfig] Error fetching config:", error);
    return EMPTY_WARRANTY_CONFIG;
  }
}
