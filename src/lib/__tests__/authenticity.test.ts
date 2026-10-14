import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// ─── Phase 1 authenticity guards ─────────────────────────────────────────────
// Source-scan checks that dead auth controls, mock account data, fake order
// actions, wrong stock/feature labels and a11y regressions do not return.

const SRC = resolve(__dirname, "../..");

function readSource(relativePath: string): string {
  return readFileSync(join(SRC, relativePath), "utf8");
}

function collectSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectSources(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const DEAD_FILES = [
  "installation-experience-sections",
  "components/shop/Navbar.tsx",
  "components/shop/MobileMenu.tsx",
  "product-categories",
  "ecommerce-navbar",
  "ecommerce-footer",
  "ecommerce-hero",
  "feature-cards",
  "order-history4",
];

const allSources = new Map(
  collectSources(SRC)
    .filter(
      (f) =>
        !f.includes("__tests__") &&
        !DEAD_FILES.some((d) => f.replace(/\\/g, "/").includes(d)),
    )
    .map((f) => [f, readFileSync(f, "utf8")]),
);

describe("authenticity guards", () => {
  it("no Google OAuth control renders without a working handler", () => {
    for (const [file, content] of allSources) {
      expect(content, file).not.toMatch(/Continue with Google|or continue with|signInWithOAuth/i);
    }
  });

  it("email/password auth actions still exist", () => {
    const actions = readSource("app/(auth)/actions.ts");
    expect(actions).toContain("signInWithPassword");
    expect(actions).toContain("signUp");
  });

  it("account pages contain no mock warranty or subscription records", () => {
    const warranties = readSource("app/account/warranties/page.tsx");
    const subscriptions = readSource("app/account/subscriptions/page.tsx");
    for (const [name, src] of [
      ["warranties", warranties],
      ["subscriptions", subscriptions],
    ] as const) {
      expect(src, name).not.toMatch(/MOCK_|mock/i);
      expect(src, name).not.toMatch(/serial|certificate_url|next_billing/i);
      expect(src, name).toContain("getContactChannels");
    }
    expect(warranties).toContain("No registered warranties found");
    expect(subscriptions).toContain("No active subscriptions");
  });

  it("dead warranty/subscription actions are gone", () => {
    expect(readSource("app/account/warranties/page.tsx")).not.toMatch(
      /Download Certificate|Log a Claim/,
    );
    expect(readSource("app/account/subscriptions/page.tsx")).not.toMatch(
      /Cancel Plan/,
    );
  });

  it("order history has no dead actions or links to missing routes", () => {
    const history = readSource("components/account/OrderHistory.tsx");
    expect(history).not.toContain("Track Order");
    expect(history).not.toContain("View Details");
    expect(history).not.toContain("Invoice");
    expect(history).not.toMatch(/account\/orders\/\$\{/);
    // Real status is shown as a badge, not a fake navigation action.
    expect(history).toContain("Order status:");
  });

  it("is_featured produces a Featured badge, never Best seller", () => {
    const mapper = readSource("lib/fetch-featured-products.ts");
    expect(mapper).not.toMatch(/Best [sS]eller['"`]/);
    expect(mapper).toContain('"Featured"');
  });

  it("product cards resolve stock via the shared logic, never defaulting to in-stock", () => {
    const card = readSource("components/ProductCard.tsx");
    expect(card).toContain("resolveStockStatus");
    expect(card).not.toContain('stockCount <= 3 && currentVariant.stockCount > 0');
    const shopCard = readSource("components/shop/ProductCard.tsx");
    expect(shopCard).toContain("resolveStockStatus");
  });

  it("heating claims come from product mode data", () => {
    const card = readSource("components/ProductCard.tsx");
    expect(card).toContain('currentVariant.mode === "cooling-heating"');
  });

  it("installation-gallery copy no longer claims undocumented real jobs", () => {
    const about = readSource("app/(shop)/about/page.tsx");
    expect(about).not.toMatch(/Real installations, real results/);
  });

  it("password toggles have accessible names, pressed state and hidden icons", () => {
    for (const rel of [
      "app/(auth)/login/login-form.tsx",
      "app/(auth)/signup/signup-form.tsx",
    ]) {
      const src = readSource(rel);
      expect(src, rel).toMatch(/aria-label=\{.*Show password.*Hide password|aria-label=\{.*Hide password.*Show password/);
      expect(src, rel).toContain("aria-pressed={showPassword}");
      expect(src, rel).toContain('aria-hidden="true"');
    }
    // Signup confirm-password toggle has its own distinct name.
    const signup = readSource("app/(auth)/signup/signup-form.tsx");
    expect(signup).toContain("Show confirm password");
    expect(signup).toContain("aria-pressed={showConfirmPassword}");
  });

  it("grid toggles have accessible names and pressed state", () => {
    const src = readSource("app/(shop)/categories/[slug]/CategoryClient.tsx");
    expect(src).toContain('aria-label="Show three products per row"');
    expect(src).toContain('aria-label="Show four products per row"');
    expect(src).toContain("aria-pressed={columns === 3}");
    expect(src).toContain("aria-pressed={columns === 4}");
  });

  it("mega-menu triggers expose expanded state and submenu controls", () => {
    const navbar = readSource("components/shadcnblocks/navbar.tsx");
    expect(navbar).toMatch(/aria-expanded=\{hasMenu \? submenuOpen : undefined\}/);
    expect(navbar).toMatch(/aria-controls=\{hasMenu \? submenuId : undefined\}/);
    expect(navbar).toMatch(/event\.key === "Escape"/);
  });

  it("no nested main landmarks in layouts or showcase", () => {
    expect(readSource("app/(shop)/layout.tsx")).not.toContain("<main");
    expect(readSource("components/AirconsShowcase.tsx")).not.toContain("<main");
    // Root layout keeps the single main landmark.
    expect(readSource("app/layout.tsx")).toContain("<main");
  });

  it("undersized cart remove button was enlarged", () => {
    const cart = readSource("app/(shop)/cart/page.tsx");
    expect(cart).not.toMatch(/flex h-5 w-5 shrink-0 items-center justify-center rounded-full border/);
    expect(cart).toContain('aria-label={`Remove ${item.name}`}');
  });
});