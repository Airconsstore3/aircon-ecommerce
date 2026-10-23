import { describe, expect, it } from "vitest";
import { getCartBreakdown } from "../cart-pricing";

const unit = { price_zar: 12000, quantity: 1, is_enquiry_only: false };

describe("Cart display pricing", () => {
  it("counts configured extras once rather than adding them to an inclusive price again", () => {
    const result = getCartBreakdown([{ ...unit, price_zar: 13950, quantity: 3, installation_price_zar: 1950 }]);
    expect(result.subtotal).toBe(36000);
    expect(result.installationTotal).toBe(5850);
    expect(result.total).toBe(41850);
  });

  it("splits all included extras from the base unit price", () => {
    const result = getCartBreakdown([{ ...unit, price_zar: 17000, quantity: 2, installation_price_zar: 2000, kit_price_zar: 1000, maintenance_price_zar: 1500, warranty_price_zar: 500 }]);
    expect(result).toMatchObject({ subtotal: 24000, installationTotal: 4000, kitTotal: 2000, maintenanceTotal: 3000, warrantyTotal: 1000, total: 34000 });
  });

  it("excludes quote-only placeholders from known totals", () => {
    const result = getCartBreakdown([unit, { ...unit, price_zar: 99999, is_enquiry_only: true }]);
    expect(result.total).toBe(12000);
    expect(result.hasEnquiryItems).toBe(true);
    expect(result.hasPricedItems).toBe(true);
  });

  it("distinguishes an all-quote basket from a free priced basket", () => {
    const result = getCartBreakdown([{ ...unit, is_enquiry_only: true }]);
    expect(result.total).toBe(0);
    expect(result.hasPricedItems).toBe(false);
  });

  it("uses the sale price including a zero price", () => {
    expect(getCartBreakdown([{ ...unit, sale_price_zar: 10000 }]).total).toBe(10000);
    expect(getCartBreakdown([{ ...unit, sale_price_zar: 0 }]).total).toBe(0);
  });

  it("flags extras awaiting a separate quote", () => {
    expect(getCartBreakdown([{ ...unit, has_quoted_extras: true }]).hasQuotedExtras).toBe(true);
  });

  it("handles an empty basket", () => {
    expect(getCartBreakdown([])).toMatchObject({ subtotal: 0, total: 0, hasPricedItems: false, hasEnquiryItems: false, hasQuotedExtras: false });
  });
});
