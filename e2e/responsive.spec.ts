import { test, expect } from "@playwright/test";
import { expectNoHorizontalOverflow, gotoSettled } from "./helpers";

const WIDTHS = [320, 360, 375, 390, 412, 640, 768, 820, 1024, 1280, 1366, 1440, 1920];
const SMOKE_WIDTHS = [320, 375, 768, 1024, 1440];
const SMOKE_ROUTES = ["/", "/products", "/cart", "/login"];

test.describe("responsive widths", () => {
  for (const w of WIDTHS) {
    test(`/about no horizontal overflow at ${w}px`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: w, height: Math.round(w * 0.7) } });
      const page = await context.newPage();
      await gotoSettled(page, "/about");
      expect(await expectNoHorizontalOverflow(page)).toBe(true);
      await context.close();
    });
  }

  test("/about decorative arrow remains rendered on desktop", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await gotoSettled(page, "/about");
    const arrows = page.locator("svg.lucide-arrow-down");
    const count = await arrows.count();
    expect(count, "step-flow arrows rendered at desktop").toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const box = await arrows.nth(i).boundingBox();
      expect(box && box.x + box.width <= 1441, "arrow stays inside viewport").toBeTruthy();
    }
    await context.close();
  });

  for (const route of SMOKE_ROUTES) {
    for (const w of SMOKE_WIDTHS) {
      test(`${route} no overflow at ${w}px`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width: w, height: 800 } });
        const page = await context.newPage();
        await gotoSettled(page, route);
        expect(await expectNoHorizontalOverflow(page), `${route} @${w}`).toBe(true);
        await context.close();
      });
    }
  }

  test("usable at 200% zoom", async ({ page }) => {
    await gotoSettled(page, "/about");
    await page.evaluate(() => { (document.body.style as CSSStyleDeclaration).zoom = "2"; });
    const hasScrollbar = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasScrollbar).toBe(false);
  });
});
