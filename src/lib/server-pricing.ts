import { serviceRoleClient } from "@/lib/supabase-service";
import { resolveInstallationPrice } from "@/lib/installation-kit-price";
import { resolveWarrantyPrice } from "@/lib/warranty-price";
import {
  InstallationKitConfig,
  KitConfiguration,
  EMPTY_KIT_CONFIG,
} from "@/types/installation-kit";
import {
  WarrantyConfig,
  EMPTY_WARRANTY_CONFIG,
} from "@/types/warranty";
import {
  MaintenancePlanConfig,
  EMPTY_MAINTENANCE_CONFIG,
} from "@/types/maintenance-plan";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItemConfig {
  id: string;
  quantity: number;
  // Configuration sent from client — NOT trusted for pricing
  has_installation?: boolean;
  installation_tier_id?: string;
  kit_configuration?: KitConfiguration | null;
  maintenance_plan_id?: string;
  warranty_option_id?: string;
}

export interface ResolvedLineItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  variant_id: string | null;
  quantity: number;
  base_unit_price_zar: number;
  has_installation: boolean;
  installation_tier_id: string | null;
  installation_price_zar: number;
  kit_configuration: Record<string, unknown> | null;
  kit_price_zar: number;
  maintenance_plan_id: string | null;
  maintenance_price_zar: number;
  warranty_option_id: string | null;
  warranty_price_zar: number;
  line_total_zar: number;
  is_enquiry_only: boolean;
}

export interface ResolvedOrderPricing {
  items: ResolvedLineItem[];
  subtotal_zar: number;
  installation_total_zar: number;
  kit_total_zar: number;
  maintenance_total_zar: number;
  warranty_total_zar: number;
  total_zar: number;
}

// ─── Server-side config fetchers ─────────────────────────────────────────────

async function fetchInstallationTiers(): Promise<
  Array<{ id: string; label: string; min_btu: number; max_btu: number; price_zar: number; is_enquiry: boolean }>
> {
  const { data, error } = await serviceRoleClient
    .from("installation_tiers")
    .select("id, label, min_btu, max_btu, price_zar, is_enquiry")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data || data.length === 0) {
    console.warn("[server-pricing] No installation tiers found, using fallback");
    return [
      { id: "9-12k", label: "9 000–12 000 BTU", min_btu: 0, max_btu: 12000, price_zar: 1950, is_enquiry: false },
      { id: "18k", label: "18 000 BTU", min_btu: 12001, max_btu: 18000, price_zar: 2350, is_enquiry: false },
      { id: "24k", label: "24 000 BTU", min_btu: 18001, max_btu: 24000, price_zar: 2750, is_enquiry: false },
      { id: "32k+", label: "32 000+ BTU", min_btu: 24001, max_btu: 999999, price_zar: 0, is_enquiry: true },
    ];
  }

  return data;
}

async function fetchServerKitConfig(): Promise<InstallationKitConfig> {
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
      serviceRoleClient.from("installation_kits").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("pipe_materials").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("pipe_sizes").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("pipe_lengths").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("bracket_options").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("insulation_options").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("protective_cage_options").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("installation_pricing_rules").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("installation_kit_material_compat").select("*"),
      serviceRoleClient.from("installation_kit_bracket_compat").select("*"),
      serviceRoleClient.from("installation_kit_insulation_compat").select("*"),
      serviceRoleClient.from("installation_kit_cage_compat").select("*"),
    ]);

    if (kitsRes.error || !kitsRes.data || kitsRes.data.length === 0) {
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
    console.error("[server-pricing] Error fetching kit config:", error);
    return EMPTY_KIT_CONFIG;
  }
}

async function fetchServerWarrantyConfig(): Promise<WarrantyConfig> {
  try {
    const [optionsRes, pricingRes, termsRes] = await Promise.all([
      serviceRoleClient.from("warranty_options").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("warranty_pricing_rules").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("warranty_terms").select("*"),
    ]);

    if (optionsRes.error || !optionsRes.data || optionsRes.data.length === 0) {
      return EMPTY_WARRANTY_CONFIG;
    }

    return {
      options: optionsRes.data as WarrantyConfig["options"],
      pricingRules: (pricingRes.data as WarrantyConfig["pricingRules"]) ?? [],
      terms: (termsRes.data as WarrantyConfig["terms"]) ?? [],
    };
  } catch (error) {
    console.error("[server-pricing] Error fetching warranty config:", error);
    return EMPTY_WARRANTY_CONFIG;
  }
}

async function fetchServerMaintenanceConfig(): Promise<MaintenancePlanConfig> {
  try {
    const [plansRes, servicesRes, pricingRes, eligibilityRes] = await Promise.all([
      serviceRoleClient.from("maintenance_plans").select("*").eq("is_active", true).order("sort_order"),
      serviceRoleClient.from("maintenance_plan_services").select("*").order("sort_order"),
      serviceRoleClient.from("maintenance_pricing_rules").select("*").eq("is_active", true),
      serviceRoleClient.from("maintenance_eligibility_rules").select("*").eq("is_active", true),
    ]);

    if (plansRes.error || !plansRes.data || plansRes.data.length === 0) {
      return EMPTY_MAINTENANCE_CONFIG;
    }

    return {
      plans: plansRes.data as MaintenancePlanConfig["plans"],
      services: (servicesRes.data as MaintenancePlanConfig["services"]) ?? [],
      pricingRules: (pricingRes.data as MaintenancePlanConfig["pricingRules"]) ?? [],
      eligibilityRules: (eligibilityRes.data as MaintenancePlanConfig["eligibilityRules"]) ?? [],
    };
  } catch (error) {
    console.error("[server-pricing] Error fetching maintenance config:", error);
    return EMPTY_MAINTENANCE_CONFIG;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveInstallationTierPrice(
  tiers: Array<{ id: string; min_btu: number; max_btu: number; price_zar: number; is_enquiry: boolean }>,
  tierId: string | undefined,
  productBtuRange: number | null,
  productInstallationPricing: Record<string, number> | null
): { price: number; isEnquiry: boolean } {
  // 1. Check product-specific pricing from Supabase first
  if (productInstallationPricing && productBtuRange) {
    const btuKey = String(productBtuRange);
    if (productInstallationPricing[btuKey] !== undefined) {
      return { price: productInstallationPricing[btuKey], isEnquiry: false };
    }
    for (const [key, price] of Object.entries(productInstallationPricing)) {
      const range = key.split("-").map(Number);
      if (range.length === 2 && productBtuRange >= range[0] && productBtuRange <= range[1]) {
        return { price, isEnquiry: false };
      }
    }
  }

  // 2. Fall back to tier from DB
  const tier = tiers.find((t) => t.id === tierId);
  if (tier) {
    return { price: tier.is_enquiry ? 0 : tier.price_zar, isEnquiry: tier.is_enquiry };
  }

  // 3. Fall back to BTU range match
  if (productBtuRange) {
    const matched = tiers.find((t) => productBtuRange >= t.min_btu && productBtuRange <= t.max_btu);
    if (matched) {
      return { price: matched.is_enquiry ? 0 : matched.price_zar, isEnquiry: matched.is_enquiry };
    }
  }

  return { price: 0, isEnquiry: true };
}

function resolveMaintenancePriceServer(
  config: MaintenancePlanConfig,
  planId: string | undefined,
  product: { id: string; name: string; brand: string | null; btu_range: number | null; type: string },
  quantity: number
): { price: number; priceOnRequest: boolean } {
  if (!planId) return { price: 0, priceOnRequest: false };

  const plan = config.plans.find((p) => p.id === planId);
  if (!plan) return { price: 0, priceOnRequest: false };

  const rules = config.pricingRules
    .filter((r) => r.plan_id === plan.id && r.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const rule of rules) {
    if (rule.min_btu && rule.min_btu > 0 && product.btu_range && product.btu_range < rule.min_btu) continue;
    if (rule.max_btu && rule.max_btu > 0 && product.btu_range && product.btu_range > rule.max_btu) continue;
    if (rule.unit_type && rule.unit_type.trim() && product.type.toLowerCase() !== rule.unit_type.toLowerCase()) continue;
    if (rule.brand && rule.brand.trim() && product.brand?.toLowerCase() !== rule.brand.toLowerCase()) continue;
    if (quantity < (rule.quantity_min ?? 1) || quantity > (rule.quantity_max ?? 999)) continue;

    return {
      price: rule.price_on_request ? 0 : (rule.price ?? 0),
      priceOnRequest: rule.price_on_request ?? false,
    };
  }

  return { price: 0, priceOnRequest: true };
}

// ─── Main resolver ───────────────────────────────────────────────────────────

const UUID_RE = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

export async function resolveOrderPricing(
  items: CartItemConfig[]
): Promise<ResolvedOrderPricing> {
  if (items.length === 0) {
    return {
      items: [],
      subtotal_zar: 0,
      installation_total_zar: 0,
      kit_total_zar: 0,
      maintenance_total_zar: 0,
      warranty_total_zar: 0,
      total_zar: 0,
    };
  }

  // Extract base UUIDs from composite cart IDs
  const productIds = items.map((item) => {
    const match = item.id.match(UUID_RE);
    return match ? match[1] : item.id;
  });

  // Fetch all products in one query
  const { data: products, error: productsError } = await serviceRoleClient
    .from("products")
    .select("id, name, slug, price_zar, sale_price_zar, images, is_published, is_enquiry_only, btu_range, brand, type, installation_pricing")
    .in("id", productIds)
    .eq("is_published", true);

  if (productsError) {
    throw new Error("Failed to fetch product data.");
  }

  if (!products || products.length !== new Set(productIds).size) {
    throw new Error("One or more cart items are no longer available.");
  }

  // Fetch all config in parallel
  const [tiers, kitConfig, warrantyConfig, maintenanceConfig] = await Promise.all([
    fetchInstallationTiers(),
    fetchServerKitConfig(),
    fetchServerWarrantyConfig(),
    fetchServerMaintenanceConfig(),
  ]);

  const resolvedItems: ResolvedLineItem[] = items.map((item) => {
    const match = item.id.match(UUID_RE);
    const baseId = match ? match[1] : item.id;
    const product = products.find((p) => p.id === baseId);

    if (!product) {
      throw new Error("One or more cart items are no longer available.");
    }

    const baseUnitPrice = product.sale_price_zar || product.price_zar;
    const isEnquiryOnly = product.is_enquiry_only ?? false;

    // ─── Installation price ──────────────────────────────────────────────────
    let installationPrice = 0;
    let installationTierId: string | null = null;

    if (item.has_installation && !isEnquiryOnly) {
      const resolved = resolveInstallationTierPrice(
        tiers,
        item.installation_tier_id,
        product.btu_range,
        product.installation_pricing as Record<string, number> | null
      );
      if (!resolved.isEnquiry) {
        installationPrice = resolved.price;
        installationTierId = item.installation_tier_id ?? tiers.find((t) =>
          product.btu_range && product.btu_range >= t.min_btu && product.btu_range <= t.max_btu
        )?.id ?? null;
      }
    }

    // ─── Kit price ───────────────────────────────────────────────────────────
    let kitPrice = 0;
    let kitConfigData: Record<string, unknown> | null = null;

    if (item.kit_configuration && kitConfig.kits.length > 0) {
      const resolved = resolveInstallationPrice(kitConfig, item.kit_configuration, {
        id: product.id,
        name: product.name,
        display_name: null,
        brand: product.brand,
        btu_range: product.btu_range ?? null,
        type: product.type,
      });
      if (!resolved.priceOnRequest) {
        kitPrice = resolved.price;
      }
      kitConfigData = item.kit_configuration as unknown as Record<string, unknown>;
    }

    // ─── Maintenance price ───────────────────────────────────────────────────
    let maintenancePrice = 0;
    if (item.maintenance_plan_id && maintenanceConfig.plans.length > 0) {
      const resolved = resolveMaintenancePriceServer(
        maintenanceConfig,
        item.maintenance_plan_id,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          btu_range: product.btu_range,
          type: product.type,
        },
        item.quantity
      );
      if (!resolved.priceOnRequest) {
        maintenancePrice = resolved.price;
      }
    }

    // ─── Warranty price ──────────────────────────────────────────────────────
    let warrantyPrice = 0;
    if (item.warranty_option_id && warrantyConfig.options.length > 0) {
      const resolved = resolveWarrantyPrice(warrantyConfig, item.warranty_option_id, {
        id: product.id,
        brand: product.brand,
        btu_range: product.btu_range ?? null,
        type: product.type,
        category: null,
      });
      if (!resolved.priceOnRequest && !resolved.requiresConfirmation) {
        warrantyPrice = resolved.price;
      }
    }

    const lineTotal = isEnquiryOnly
      ? 0
      : (baseUnitPrice + installationPrice + kitPrice + maintenancePrice + warrantyPrice) * item.quantity;

    return {
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      variant_id: null,
      quantity: item.quantity,
      base_unit_price_zar: baseUnitPrice,
      has_installation: item.has_installation ?? false,
      installation_tier_id: installationTierId,
      installation_price_zar: installationPrice,
      kit_configuration: kitConfigData,
      kit_price_zar: kitPrice,
      maintenance_plan_id: item.maintenance_plan_id ?? null,
      maintenance_price_zar: maintenancePrice,
      warranty_option_id: item.warranty_option_id ?? null,
      warranty_price_zar: warrantyPrice,
      line_total_zar: lineTotal,
      is_enquiry_only: isEnquiryOnly,
    };
  });

  const subtotal = resolvedItems.reduce((s, i) => s + i.base_unit_price_zar * i.quantity, 0);
  const installationTotal = resolvedItems.reduce((s, i) => s + i.installation_price_zar * i.quantity, 0);
  const kitTotal = resolvedItems.reduce((s, i) => s + i.kit_price_zar * i.quantity, 0);
  const maintenanceTotal = resolvedItems.reduce((s, i) => s + i.maintenance_price_zar * i.quantity, 0);
  const warrantyTotal = resolvedItems.reduce((s, i) => s + i.warranty_price_zar * i.quantity, 0);
  const total = resolvedItems.reduce((s, i) => s + i.line_total_zar, 0);

  return {
    items: resolvedItems,
    subtotal_zar: subtotal,
    installation_total_zar: installationTotal,
    kit_total_zar: kitTotal,
    maintenance_total_zar: maintenanceTotal,
    warranty_total_zar: warrantyTotal,
    total_zar: total,
  };
}
