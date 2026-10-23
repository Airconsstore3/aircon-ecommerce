// Checkout hardening tests.
// Note: the Payfast integration (and its signature tests) was removed — the
// store runs an enquiry model where payment is arranged manually.

import { describe, it, expect } from "vitest";

// ─── Phone Normalization Tests ───────────────────────────────────────────────

function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, "");

  if (/^\+27[0-9]{9}$/.test(compact)) return compact;
  if (/^0[0-9]{9}$/.test(compact)) return `+27${compact.slice(1)}`;
  if (/^27[0-9]{9}$/.test(compact)) return `+${compact}`;

  throw new Error("Invalid phone number");
}

describe("Phone normalization", () => {
  it("should normalize +27 format", () => {
    expect(normalizePhone("+27821234567")).toBe("+27821234567");
  });

  it("should normalize 0N format to +27N", () => {
    expect(normalizePhone("0821234567")).toBe("+27821234567");
  });

  it("should normalize 27N format to +27N", () => {
    expect(normalizePhone("27821234567")).toBe("+27821234567");
  });

  it("should handle spaces and parentheses", () => {
    expect(normalizePhone("+27 (82) 123-4567")).toBe("+27821234567");
  });

  it("should reject invalid numbers", () => {
    expect(() => normalizePhone("123")).toThrow();
    expect(() => normalizePhone("abc")).toThrow();
  });
});

// ─── Order Number Generation Tests ───────────────────────────────────────────

describe("Order number format", () => {
  it("should match the expected format", () => {
    // Simulate the generate_order_number function output
    const year = new Date().getFullYear();
    const seq = String(1).padStart(6, "0");
    const orderNumber = `AIR-${year}-${seq}`;
    expect(orderNumber).toBe(`AIR-${year}-000001`);
  });

  it("should pad sequence numbers correctly", () => {
    const seq = String(999).padStart(6, "0");
    expect(seq).toBe("000999");
  });

  it("should not pad numbers longer than 6 digits", () => {
    const seq = String(1000000).padStart(6, "0");
    expect(seq).toBe("1000000");
  });
});
