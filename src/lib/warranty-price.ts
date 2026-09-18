import { WarrantyConfig, ResolvedWarrantyPrice } from "@/types/warranty";

export interface WarrantyProductContext {
  id: string;
  brand: string | null;
  btu_range: number | null;
  type: string | null;
  category: string | null;
}

export function resolveWarrantyPrice(
  config: WarrantyConfig,
  optionId: string,
  product: WarrantyProductContext
): ResolvedWarrantyPrice {
  const option = (config.options ?? []).find((o) => o.id === optionId && o.is_active);
  if (!option) {
    return { optionId, price: 0, priceOnRequest: false, requiresConfirmation: false, message: null };
  }

  const rules = (config.pricingRules ?? []).filter(
    (rule) =>
      rule.option_id === optionId &&
      rule.is_active &&
      (!rule.product_id || rule.product_id === product.id) &&
      (!rule.brand || rule.brand === product.brand) &&
      (!rule.unit_type || rule.unit_type === product.type) &&
      (!rule.category || rule.category === product.category) &&
      (rule.btu_min === null || rule.btu_max === null || (product.btu_range !== null && product.btu_range >= rule.btu_min && product.btu_range <= rule.btu_max))
  );

  if (rules.length === 0) {
    return { optionId, price: 0, priceOnRequest: false, requiresConfirmation: false, message: null };
  }

  const best = rules[0];

  if (best.price_on_request) {
    return {
      optionId,
      price: 0,
      priceOnRequest: true,
      requiresConfirmation: best.requires_confirmation,
      message: "Pricing will be confirmed before your warranty is added.",
    };
  }

  if (best.requires_confirmation) {
    return {
      optionId,
      price: 0,
      priceOnRequest: false,
      requiresConfirmation: true,
      message: "Eligibility to be confirmed",
    };
  }

  const price = Number(best.base_price) + Number(best.additional_price);

  return {
    optionId,
    price,
    priceOnRequest: false,
    requiresConfirmation: false,
    message: null,
  };
}
