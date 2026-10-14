import { describe, expect, it } from "vitest";

import {
  buildTelHref,
  buildWhatsAppHref,
  normalizeWhatsAppDigits,
  primaryContactHref,
} from "@/lib/contact-format";

describe("normalizeWhatsAppDigits", () => {
  it("keeps an already-international number", () => {
    expect(normalizeWhatsAppDigits("+27767100588")).toBe("27767100588");
  });

  it("strips separators, spaces and brackets", () => {
    expect(normalizeWhatsAppDigits("+27 76 710 0588")).toBe("27767100588");
    expect(normalizeWhatsAppDigits("(076) 710-0588")).toBe("27767100588");
  });

  it("converts a South African local number to international format", () => {
    expect(normalizeWhatsAppDigits("0767100588")).toBe("27767100588");
  });

  it("handles a 00 international prefix", () => {
    expect(normalizeWhatsAppDigits("0027767100588")).toBe("27767100588");
  });

  it("returns null for missing or unusable values", () => {
    expect(normalizeWhatsAppDigits(null)).toBeNull();
    expect(normalizeWhatsAppDigits(undefined)).toBeNull();
    expect(normalizeWhatsAppDigits("")).toBeNull();
    expect(normalizeWhatsAppDigits("abc")).toBeNull();
    expect(normalizeWhatsAppDigits("123")).toBeNull();
  });

  it("never produces placeholder-style output", () => {
    expect(normalizeWhatsAppDigits("0000000000")).toBeNull();
  });
});

describe("buildWhatsAppHref", () => {
  it("builds a wa.me link with digits only", () => {
    const href = buildWhatsAppHref("27767100588");
    expect(href).toBe("https://wa.me/27767100588");
    expect(href).not.toContain("+");
  });

  it("URL-encodes a prefilled message", () => {
    const href = buildWhatsAppHref("27767100588", "Hi Aircons Store — I'd like to book a repair.");
    expect(href.startsWith("https://wa.me/27767100588?text=")).toBe(true);
    expect(href).toContain(encodeURIComponent("I'd like to book"));
  });
});

describe("buildTelHref", () => {
  it("keeps the + prefix for international numbers", () => {
    expect(buildTelHref("+27 21 555 1234")).toBe("tel:+27215551234");
  });

  it("strips separators without +", () => {
    expect(buildTelHref("021 555 1234")).toBe("tel:0215551234");
  });

  it("returns null when no phone is configured", () => {
    expect(buildTelHref(null)).toBeNull();
    expect(buildTelHref("")).toBeNull();
  });
});

describe("primaryContactHref", () => {
  it("prefers WhatsApp when configured", () => {
    expect(
      primaryContactHref({ whatsappDigits: "27767100588", phoneTel: "tel:+2721", email: "a@b.c" }),
    ).toBe("https://wa.me/27767100588");
  });

  it("falls back to phone then email, and null when nothing is configured", () => {
    expect(
      primaryContactHref({ whatsappDigits: null, phoneTel: "tel:+2721", email: "a@b.c" }),
    ).toBe("tel:+2721");
    expect(
      primaryContactHref({ whatsappDigits: null, phoneTel: null, email: "a@b.c" }),
    ).toBe("mailto:a@b.c");
    expect(
      primaryContactHref({ whatsappDigits: null, phoneTel: null, email: null }),
    ).toBeNull();
  });
});
