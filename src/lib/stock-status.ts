// Pure stock-status logic shared by all product cards so the same data
// produces the same label everywhere (catalogue, PDP, homepage cards).

export type StockStatus = "sold_out" | "on_request" | "low_stock" | "in_stock";

export interface StockInput {
  isSoldOut?: boolean | null;
  /** null/undefined means stock is not tracked or unknown — never treat as in stock. */
  stockCount?: number | null;
  /** Units at or below this threshold (but above zero) are "low stock". Default 3. */
  lowStockThreshold?: number;
}

/**
 * Decision order — sold-out flag wins, then unknown/zero stock means
 * "availability on request" (never "In stock"), then the real low-stock
 * threshold, then positive stock.
 */
export function resolveStockStatus({
  isSoldOut,
  stockCount,
  lowStockThreshold = 3,
}: StockInput): StockStatus {
  if (isSoldOut) return "sold_out";
  if (stockCount == null || Number.isNaN(stockCount) || stockCount <= 0) {
    return "on_request";
  }
  if (stockCount <= lowStockThreshold) return "low_stock";
  return "in_stock";
}

/** Display copy for a resolved status. `count` is only used for low_stock. */
export function stockStatusLabel(status: StockStatus, count?: number | null): string {
  switch (status) {
    case "sold_out":
      return "Sold out";
    case "on_request":
      return "Availability on request";
    case "low_stock":
      return `Only ${count} left`;
    case "in_stock":
      return "In stock";
  }
}
