import { test, expect } from "@playwright/test";
import { gotoSettled } from "./helpers";

const RENAMED = [
  "/Hero%20Images/Product%20category%20pictures/jasa-window-wall-fixed-speed-cooling-only.webp",
  "/Hero%20Images/Product%20category%20pictures/jasa-window-wall-fixed-speed-heat-pump.webp",
  "/Hero%20Images/Featured%20In%20section/Promo%20sales%20aircons/samsung-dvm-s2.png",
];

test.describe("images", () => {
  for (const route of ["/", "/products", "/categories/residential", "/categories/commercial", "/about", "/categories/accessories", "/installation"]) {
    test(`${route}: no image 4xx and all visible images have dimensions`, async ({ page }) => {
      const imageFailures: string[] = [];
      page.on("response", (r) => {
        const u = r.url();
        if (r.status() >= 400 && (r.request().resourceType() === "image" || u.includes("_next/image") || /\.(webp|png|jpe?g|avif)/i.test(u))) {
          imageFailures.push(`HTTP ${r.status()} ${u.slice(0, 160)}`);
        }
      });
      await gotoSettled(page, route);
      expect(imageFailures, "image request failures").toEqual([]);
      const broken = await page.evaluate(() =>
        [...document.querySelectorAll("img")]
          .filter((i) => i.offsetParent !== null && i.complete && i.naturalWidth === 0)
          .map((i) => i.currentSrc.slice(0, 140)),
      );
      expect(broken, "images with zero natural size").toEqual([]);
      const html = await page.content();
      // URL-unsafe filenames would appear as a paren inside a path segment.
      // Escaped RSC payloads like (\"...png\" are excluded via the quote rule.
      const unsafe = /[/\w][^"'\\\s()]*\([^"'\\()]*\)[^"'\\\s()]*\.(webp|png|jpe?g)/i.test(html);
      expect(unsafe, "paren filenames still referenced").toBe(false);
    });
  }

  for (const p of RENAMED) {
    test(`renamed asset serves directly: ${p.split("/").pop()}`, async ({ request }) => {
      const direct = await request.get(p);
      expect(direct.status()).toBe(200);
      const optimized = await request.get(`/_next/image?url=${encodeURIComponent(p)}&w=384&q=75`);
      expect(optimized.status()).toBe(200);
    });
  }
});
