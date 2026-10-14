import { describe, expect, it } from "vitest";
import { resolveStockStatus, stockStatusLabel } from "@/lib/stock-status";

describe("resolveStockStatus", () => {
  it("sold-out flag takes precedence over positive stock", () => {
    expect(resolveStockStatus({ isSoldOut: true, stockCount: 12 })).toBe("sold_out");
    expect(resolveStockStatus({ isSoldOut: true, stockCount: 0 })).toBe("sold_out");
    expect(resolveStockStatus({ isSoldOut: true, stockCount: null })).toBe("sold_out");
  });

  it("zero or negative stock never shows in stock", () => {
    expect(resolveStockStatus({ stockCount: 0 })).toBe("on_request");
    expect(resolveStockStatus({ stockCount: -4 })).toBe("on_request");
  });

  it("null/undefined stock never shows in stock", () => {
    expect(resolveStockStatus({ stockCount: null })).toBe("on_request");
    expect(resolveStockStatus({ stockCount: undefined })).toBe("on_request");
    expect(resolveStockStatus({})).toBe("on_request");
  });

  it("stock at or below the threshold is low stock", () => {
    expect(resolveStockStatus({ stockCount: 1 })).toBe("low_stock");
    expect(resolveStockStatus({ stockCount: 3 })).toBe("low_stock");
    expect(resolveStockStatus({ stockCount: 2, lowStockThreshold: 5 })).toBe("low_stock");
  });

  it("stock above the threshold is in stock", () => {
    expect(resolveStockStatus({ stockCount: 4 })).toBe("in_stock");
    expect(resolveStockStatus({ stockCount: 10, lowStockThreshold: 5 })).toBe("in_stock");
  });

  it("sold-out beats low stock; on-request beats threshold checks", () => {
    expect(resolveStockStatus({ isSoldOut: true, stockCount: 1 })).toBe("sold_out");
    expect(resolveStockStatus({ stockCount: 0, lowStockThreshold: 5 })).toBe("on_request");
  });
});

describe("stockStatusLabel", () => {
  it("produces truthful labels", () => {
    expect(stockStatusLabel("sold_out")).toBe("Sold out");
    expect(stockStatusLabel("on_request")).toBe("Availability on request");
    expect(stockStatusLabel("low_stock", 2)).toBe("Only 2 left");
    expect(stockStatusLabel("in_stock")).toBe("In stock");
  });
});
