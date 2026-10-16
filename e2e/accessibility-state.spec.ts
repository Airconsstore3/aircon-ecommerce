import { test, expect } from "@playwright/test";
import { gotoSettled } from "./helpers";

test.describe("accessibility state", () => {
  test("login password toggle: name, state flip, value persists, keyboard", async ({ page }) => {
    await page.goto("/login");
    const toggle = page.getByRole("button", { name: /(show|hide) password/i });
    await expect(toggle).toHaveCount(1);
    await expect(toggle).toHaveAttribute("aria-label", /show password/i);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(toggle).toHaveAttribute("aria-label", /hide/i);
    await expect(page.locator("#password")).toHaveAttribute("type", "text");

    await page.locator("#password").fill("Test123!");
    await toggle.focus();
    await page.keyboard.press(" ");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#password")).toHaveAttribute("type", "password");
    await expect(page.locator("#password")).toHaveValue("Test123!");

    await expect(toggle.locator("svg")).toHaveAttribute("aria-hidden", "true");
    const box = await toggle.boundingBox();
    expect(box && box.width >= 24 && box.height >= 24, "toggle target >= 24px").toBeTruthy();
  });

  test("signup password and confirm toggles work independently", async ({ page }) => {
    await page.goto("/signup");
    const pw = page.getByRole("button", { name: /(show|hide) password/i });
    const cpw = page.getByRole("button", { name: /(show|hide) confirm password/i });
    await expect(pw).toHaveCount(1);
    await expect(cpw).toHaveCount(1);
    await cpw.focus();
    await page.keyboard.press("Enter");
    await expect(cpw).toHaveAttribute("aria-pressed", "true");
    await expect(pw).toHaveAttribute("aria-pressed", "false");
  });

  test("grid toggles expose names and pressed state", async ({ browser }) => {
    // Grid toggles are intentionally hidden below the md breakpoint.
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await gotoSettled(page, "/categories/portable");
    const t3 = page.getByRole("button", { name: /three products per row/i });
    const t4 = page.getByRole("button", { name: /four products per row/i });
    await expect(t3).toHaveCount(1);
    await expect(t4).toHaveCount(1);
    await expect(t3).toHaveAttribute("aria-pressed", "true");
    await expect(t4).toHaveAttribute("aria-pressed", "false");
    await t4.focus();
    await page.keyboard.press("Enter");
    await expect(t4).toHaveAttribute("aria-pressed", "true");
    await expect(t3).toHaveAttribute("aria-pressed", "false");
    await context.close();
  });

  test("mega menu reports expanded state, Escape closes, focus returns", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await gotoSettled(page, "/");
    const trigger = page.locator('nav[aria-label="Shop categories and services"] a[aria-haspopup="menu"]').first();
    await expect(trigger).toHaveCount(1);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const controls = await trigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveCount(1);

    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.focus();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await context.close();
  });

  test("every page has exactly one main landmark", async ({ page }) => {
    for (const route of ["/", "/products", "/about", "/login", "/cart"]) {
      await gotoSettled(page, route);
      expect(await page.locator("main").count(), route).toBe(1);
    }
  });

  test("cart remove control has adequate target and works by keyboard", async ({ page }) => {
    await gotoSettled(page, "/");
    await page.evaluate(() => {
      localStorage.setItem(
        "cart",
        JSON.stringify([
          { id: "e2e-1", name: "Test AC", slug: "test-ac", price_zar: 9999, images: [], quantity: 1, type: "aircon", is_enquiry_only: false },
        ]),
      );
    });
    await gotoSettled(page, "/cart");
    const rm = page.getByRole("button", { name: /remove/i }).first();
    await expect(rm).toHaveCount(1);
    const box = await rm.boundingBox();
    // Firefox reports subpixel-rect values like 35.9999 for a 36px box.
    expect(box && Math.ceil(box.width) >= 36 && Math.ceil(box.height) >= 36, "remove target >= 36px").toBeTruthy();
    await rm.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /remove/i })).toHaveCount(0);
  });
});
