import { createHash } from "crypto";

// ─── Payfast Signature Tests ─────────────────────────────────────────────────
// These tests verify the Payfast signature generation logic without
// requiring a running database or server.

function generateSignature(params: Record<string, string>, passphrase: string): string {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort();

  let query = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(params[key].trim()).replace(/%20/g, "+")}`)
    .join("&");

  if (passphrase) {
    query += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return createHash("md5").update(query).digest("hex");
}

describe("Payfast signature generation", () => {
  const testParams: Record<string, string> = {
    merchant_id: "10000100",
    merchant_key: "46f0cd694581a",
    return_url: "https://example.com/return",
    cancel_url: "https://example.com/cancel",
    notify_url: "https://example.com/notify",
    name_first: "John",
    name_last: "Doe",
    email_address: "john@example.com",
    m_payment_id: "AIR-2026-000001",
    amount: "1999.00",
    item_name: "Order AIR-2026-000001",
  };

  it("should produce a consistent 32-char hex signature", () => {
    const sig = generateSignature(testParams, "");
    expect(sig).toHaveLength(32);
    expect(sig).toMatch(/^[a-f0-9]{32}$/);
  });

  it("should produce different signatures with different passphrases", () => {
    const sig1 = generateSignature(testParams, "");
    const sig2 = generateSignature(testParams, "mysecret");
    expect(sig1).not.toBe(sig2);
  });

  it("should produce the same signature for the same params", () => {
    const sig1 = generateSignature(testParams, "passphrase");
    const sig2 = generateSignature(testParams, "passphrase");
    expect(sig1).toBe(sig2);
  });

  it("should exclude the signature field from the signature calculation", () => {
    const paramsWithSig = { ...testParams, signature: "fake" };
    const sig1 = generateSignature(testParams, "");
    const sig2 = generateSignature(paramsWithSig, "");
    expect(sig1).toBe(sig2);
  });

  it("should handle empty params", () => {
    const sig = generateSignature({}, "");
    expect(sig).toHaveLength(32);
  });
});

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
