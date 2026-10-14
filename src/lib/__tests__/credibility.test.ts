import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// ─── Source-scan guards: fabricated content must never come back ─────────────
// These tests read the shipped source files and assert that placeholder
// contact details, fabricated reviews, fake form-success states and dead
// links do not exist in rendered code.

const SRC = resolve(__dirname, "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(SRC, relativePath), "utf8");
}

/** Recursively collect .ts/.tsx source files under a directory. */
function collectSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectSources(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const PLACEHOLDER_PATTERNS: Array<[RegExp, string]> = [
  [/wa\.me\/\d*0{5,}/, "placeholder wa.me number"],
  [/tel:\+?27\d*0{6,}/, "placeholder tel number"],
  [/27210000000|27000000000/, "placeholder phone digits"],
  [/hello@aircons-store\.co\.za|support@aircons-store\.co\.za/, "placeholder email"],
  [/Sarah M\.|Jason P\.|Nomsa K\./, "fabricated review names"],
  [/4\.9\/5|verified customers|Verified repair/i, "fabricated rating/verification"],
  [/PayJustNow|Mobicred/, "unavailable financing methods"],
  [/aggregateRating/, "aggregate rating structured data"],
];

// Dead template components confirmed unused — never rendered. They are
// scheduled for deletion in Phase 2 and are excluded from render checks.
const DEAD_FILES = [
  "installation-experience-sections",
  "components/shop/Navbar.tsx",
  "components/shop/MobileMenu.tsx",
  "product-categories",
  "ecommerce-navbar",
  "ecommerce-footer",
  "ecommerce-hero",
  "feature-cards",
];

const sourceFiles = collectSources(SRC).filter(
  (f) =>
    !f.includes("__tests__") &&
    !DEAD_FILES.some((d) => f.replace(/\\/g, "/").includes(d)),
);
const allSources = new Map(sourceFiles.map((f) => [f, readFileSync(f, "utf8")]));

describe("credibility guards", () => {
  it.each(PLACEHOLDER_PATTERNS)("%s does not appear in rendered source", (pattern) => {
    const offenders: string[] = [];
    for (const [file, content] of allSources) {
      if (pattern.test(content)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("repairs page has no fabricated reviews, ratings or fake form", () => {
    const repairs = readSource("app/(shop)/repairs/page.tsx");
    expect(repairs).not.toMatch(/const reviews|Customer Reviews|testimonial/i);
    expect(repairs).not.toMatch(/setSubmitted|useState/);
    expect(repairs).not.toMatch(/Recent Repairs|Real work, real homes/);
    expect(repairs).toContain("getContactChannels");
  });

  it("warranty page has no fake multi-step form or success state", () => {
    const warranty = readSource("app/(shop)/warranty/page.tsx");
    expect(warranty).not.toMatch(/setSubmitted|useState|formStep/);
    expect(warranty).not.toMatch(/Request received|request received/);
    expect(warranty).toContain("getContactChannels");
  });

  it("footer uses verified settings and has no fake newsletter", () => {
    const footer = readSource("components/premium-footer.tsx");
    expect(footer).not.toMatch(/subscribed|setSubscribed|newsletter|Subscribe/i);
    expect(footer).toContain("getContactChannels");
  });

  it("footer links all resolve to real routes or verified contact channels", () => {
    const footer = readSource("components/premium-footer.tsx");
    const hrefs = [...footer.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
    const allowed = [
      "/categories/residential",
      "/categories/commercial",
      "/products?type=portable",
      "/products",
      "/products?sale=true",
      "/installation",
      "/#faqs",
      "/return-policy",
      "/warranty",
      "/repairs",
      "/maintenance",
      "/about",
      "/privacy",
      "/terms",
    ];
    for (const href of hrefs) {
      expect(allowed, `unexpected footer link: ${href}`).toContain(href);
    }
    expect(footer).not.toMatch(/"\/(contact|faq|shipping|returns|book-installation|brands|blog|cookies|help[^"]*)"/);
  });

  it("no visible dead links remain in rendered components", () => {
    // Only dead template files are excluded — they are never rendered.
    const deadLinks = /href="\/(contact|faq|shipping|returns|book-installation|brands|blog|cookies|help[^"]*)"/;
    const offenders: string[] = [];
    for (const [file, content] of allSources) {
      if (deadLinks.test(content)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it("wishlist control was removed from the catalogue product card", () => {
    const card = readSource("components/shop/ProductCard.tsx");
    expect(card).not.toMatch(/wishlist|Wishlist|<Heart/);
  });

  it("no client-side fake success state pattern remains on service pages", () => {
    for (const rel of [
      "app/(shop)/repairs/page.tsx",
      "app/(shop)/warranty/page.tsx",
      "app/(shop)/return-policy/page.tsx",
      "components/premium-footer.tsx",
    ]) {
      expect(readSource(rel), rel).not.toMatch(/setSubmitted/);
    }
  });

  it("delivery claims use confirmed-with-order language", () => {
    for (const [file, content] of allSources) {
      expect(content, file).not.toMatch(/same-day delivery|next-day delivery|Same-Day Diagnostics/i);
      expect(content, file).not.toMatch(/24–48 (hours|hrs)/i);
    }
  });
});
