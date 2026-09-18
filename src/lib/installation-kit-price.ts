import {
  InstallationKitConfig,
  KitConfiguration,
  ProductInstallationContext,
  ResolvedInstallationPrice,
} from "@/types/installation-kit";

export function resolveInstallationPrice(
  config: InstallationKitConfig,
  kitConfig: KitConfiguration,
  product: ProductInstallationContext | undefined
): ResolvedInstallationPrice {
  if (!product) {
    return { price: 0, priceOnRequest: false, breakdown: [], additionalOptionsTotal: 0, message: null };
  }

  const kit = config.kits.find((k) => k.id === kitConfig.kitId);
  if (!kit) {
    return { price: 0, priceOnRequest: false, breakdown: [], additionalOptionsTotal: 0, message: null };
  }

  const material = config.pipeMaterials.find((m) => m.id === kitConfig.materialId);
  const size = config.pipeSizes.find((s) => s.id === kitConfig.pipeSizeId);
  const length = config.pipeLengths.find((l) => l.id === kitConfig.pipeLengthId);
  const bracket = config.brackets.find((b) => b.id === kitConfig.bracketId);
  const insulation = config.insulations.find((i) => i.id === kitConfig.insulationId);
  const cage = kitConfig.hasCage && kitConfig.cageId ? config.cages.find((c) => c.id === kitConfig.cageId) : null;

  if (cage?.is_custom) {
    return {
      price: 0,
      priceOnRequest: true,
      breakdown: [],
      additionalOptionsTotal: 0,
      message: "Pricing depends on the selected installation requirements. We'll confirm the final price before proceeding.",
    };
  }

  const btu = product.btu_range ?? 0;

  const scoreRule = (rule: (typeof config.pricingRules)[number]) => {
    let score = 0;
    if (rule.kit_id && rule.kit_id === kit.id) score += 1;
    if (rule.material_id && rule.material_id === material?.id) score += 1;
    if (rule.pipe_size_id && rule.pipe_size_id === size?.id) score += 1;
    if (rule.pipe_length_id && rule.pipe_length_id === length?.id) score += 1;
    if (rule.bracket_id && rule.bracket_id === bracket?.id) score += 1;
    if (rule.insulation_id && rule.insulation_id === insulation?.id) score += 1;
    if (rule.cage_id && rule.cage_id === cage?.id) score += 1;
    if (rule.product_id && rule.product_id === product.id) score += 1;
    if (rule.btu_min !== null && rule.btu_max !== null && btu >= rule.btu_min && btu <= rule.btu_max) score += 1;
    if (rule.unit_type && rule.unit_type === product.type) score += 1;
    if (rule.brand && rule.brand === product.brand) score += 1;
    return score;
  };

  const activeRules = (config.pricingRules ?? []).filter(
    (rule) =>
      rule.is_active &&
      (!rule.kit_id || rule.kit_id === kit.id) &&
      (!rule.material_id || rule.material_id === material?.id) &&
      (!rule.pipe_size_id || rule.pipe_size_id === size?.id) &&
      (!rule.pipe_length_id || rule.pipe_length_id === length?.id) &&
      (!rule.bracket_id || rule.bracket_id === bracket?.id) &&
      (!rule.insulation_id || rule.insulation_id === insulation?.id) &&
      (!rule.cage_id || rule.cage_id === cage?.id) &&
      (!rule.product_id || rule.product_id === product.id) &&
      (rule.btu_min === null || rule.btu_max === null || (btu >= rule.btu_min && btu <= rule.btu_max)) &&
      (!rule.unit_type || rule.unit_type === product.type) &&
      (!rule.brand || rule.brand === product.brand)
  );

  const bestRule = activeRules.sort((a, b) => scoreRule(b) - scoreRule(a))[0];

  if (bestRule?.price_on_request) {
    return {
      price: 0,
      priceOnRequest: true,
      breakdown: [],
      additionalOptionsTotal: 0,
      message: "Pricing depends on the selected installation requirements. We'll confirm the final price before proceeding.",
    };
  }

  const optionPrices: { label: string; price: number }[] = [];
  if (material && material.price_offset > 0) optionPrices.push({ label: "Pipe material", price: material.price_offset });
  if (size && size.price_offset > 0) optionPrices.push({ label: "Pipe size", price: size.price_offset });
  if (length && length.price_offset > 0) optionPrices.push({ label: "Pipe length", price: length.price_offset });
  if (bracket && bracket.price > 0) optionPrices.push({ label: "Brackets", price: bracket.price });
  if (insulation && insulation.price_offset > 0) optionPrices.push({ label: "Insulation", price: insulation.price_offset });
  if (cage && !cage.is_custom && cage.price > 0) optionPrices.push({ label: "Protective cage", price: cage.price });

  const ruleAdjustment = bestRule ? Number(bestRule.additional_price) : 0;
  const additionalOptionsTotal = optionPrices.reduce((sum, item) => sum + item.price, 0) + ruleAdjustment;
  const total = kit.base_price + additionalOptionsTotal;

  const breakdown: { label: string; price: number }[] = [];
  breakdown.push({ label: "Installation kit", price: kit.base_price });
  if (additionalOptionsTotal > 0) {
    breakdown.push({ label: "Additional options", price: additionalOptionsTotal });
  }

  return {
    price: total,
    priceOnRequest: false,
    breakdown,
    additionalOptionsTotal,
    message: null,
  };
}
