import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  InstallationKitConfig,
  EMPTY_KIT_CONFIG,
} from "@/types/installation-kit";

/**
 * Fetches the complete installation kit configuration from Supabase.
 *
 * Returns all kits, pipe materials, pipe sizes, pipe lengths, brackets,
 * insulation options, protective cage options, and their compatibility
 * relationships.
 *
 * If the tables don't exist or the query fails, returns EMPTY_KIT_CONFIG
 * so the UI can gracefully fall back to the old hardcoded constants.
 */
export async function fetchInstallationKitConfig(): Promise<InstallationKitConfig> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const [
      kitsRes,
      pipeMaterialsRes,
      pipeSizesRes,
      pipeLengthsRes,
      bracketsRes,
      insulationsRes,
      cagesRes,
      pricingRulesRes,
      materialCompatRes,
      bracketCompatRes,
      insulationCompatRes,
      cageCompatRes,
    ] = await Promise.all([
      supabase.from("installation_kits").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("pipe_materials").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("pipe_sizes").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("pipe_lengths").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("bracket_options").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("insulation_options").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("protective_cage_options").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("installation_pricing_rules").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("installation_kit_material_compat").select("*"),
      supabase.from("installation_kit_bracket_compat").select("*"),
      supabase.from("installation_kit_insulation_compat").select("*"),
      supabase.from("installation_kit_cage_compat").select("*"),
    ]);

    // If the kits table doesn't exist, return empty config
    if (kitsRes.error || !kitsRes.data || kitsRes.data.length === 0) {
      console.warn("[fetchInstallationKitConfig] No kit data found, falling back to empty config");
      return EMPTY_KIT_CONFIG;
    }

    return {
      kits: kitsRes.data as InstallationKitConfig["kits"],
      pipeMaterials: (pipeMaterialsRes.data as InstallationKitConfig["pipeMaterials"]) ?? [],
      pipeSizes: (pipeSizesRes.data as InstallationKitConfig["pipeSizes"]) ?? [],
      pipeLengths: (pipeLengthsRes.data as InstallationKitConfig["pipeLengths"]) ?? [],
      brackets: (bracketsRes.data as InstallationKitConfig["brackets"]) ?? [],
      insulations: (insulationsRes.data as InstallationKitConfig["insulations"]) ?? [],
      cages: (cagesRes.data as InstallationKitConfig["cages"]) ?? [],
      pricingRules: (pricingRulesRes.data as InstallationKitConfig["pricingRules"]) ?? [],
      materialCompat: (materialCompatRes.data as InstallationKitConfig["materialCompat"]) ?? [],
      bracketCompat: (bracketCompatRes.data as InstallationKitConfig["bracketCompat"]) ?? [],
      insulationCompat: (insulationCompatRes.data as InstallationKitConfig["insulationCompat"]) ?? [],
      cageCompat: (cageCompatRes.data as InstallationKitConfig["cageCompat"]) ?? [],
    };
  } catch (error) {
    console.error("[fetchInstallationKitConfig] Error fetching config:", error);
    return EMPTY_KIT_CONFIG;
  }
}
