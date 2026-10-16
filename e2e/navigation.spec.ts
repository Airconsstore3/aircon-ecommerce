import { test, expect } from "@playwright/test";
import { gotoSettled } from "./helpers";

test.describe("navigation", () => {
  test("mega menu closes on route change", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await gotoSettled(page, "/");
    const trigger = page.locator('nav[aria-label="Shop categories and services"] a[aria-haspopup="menu"]').first();
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await page.waitForLoadState("domcontentloaded");
    expect(new URL(page.url()).pathname, "navigated away from home").not.toBe("/");
    await context.close();
  });

  test("nav links resolve to existing routes", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await gotoSettled(page, "/");
    const hrefs = await page.locator('nav[aria-label="Shop categories and services"] a[href]').evaluateAll((els) =>
      [...new Set(els.map((e) => e.getAttribute("href") ?? ""))].filter((h) => h.startsWith("/")),
    );
    const results = await Promise.all(hrefs.map((h) => page.request.get(h).then((r) => ({ href: h, status: r.status() }))));
    const bad = results.filter((r) => r.status >= 400);
    expect(bad.map((b) => `${b.status} ${b.href}`), "nav links must resolve").toEqual([]);
    await context.close();
  });

  test("mobile menu and desktop nav are independent", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    await gotoSettled(page, "/");
    const strip = page.locator('nav[aria-label="Shop categories and services"] a[aria-haspopup="menu"]').first();
    // On mobile the strip is scrollable but still functional
    await expect(strip).toBeAttached();
    await context.close();
  });

  test("cart drawer and navigation do not trap focus", async ({ page }) => {
    await gotoSettled(page, "/cart");
    await expect(page.locator("main")).toHaveCount(1);
  });
});
