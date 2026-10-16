import { test, expect } from "@playwright/test";
import { gotoSettled } from "./helpers";

test.describe("authenticity", () => {
  test("login has no dead Google OAuth control or leftover divider", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /google/i })).toHaveCount(0);
    await expect(page.locator("text=/or continue with/i")).toHaveCount(0);
  });

  test("signup has no dead Google OAuth control or leftover divider", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("button", { name: /google/i })).toHaveCount(0);
    await expect(page.locator("text=/or continue with/i")).toHaveCount(0);
  });

  test("homepage shows Featured, never sales claims driven by is_featured", async ({ page }) => {
    await gotoSettled(page, "/");
    const html = await page.content();
    expect(html).not.toMatch(/Best Seller/i);
    expect(html).toMatch(/Featured/i);
  });

  test("catalogue has no Best seller label", async ({ page }) => {
    await gotoSettled(page, "/products");
    expect(await page.content()).not.toMatch(/Best seller/i);
  });

  test("about gallery does not claim undocumented installations", async ({ page }) => {
    await gotoSettled(page, "/about");
    const html = await page.content();
    expect(html).not.toMatch(/Real installations|Real results/i);
  });

  test("signed-out account routes redirect to login", async ({ page }) => {
    for (const route of ["/account/warranties", "/account/subscriptions", "/account/orders"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/login/);
    }
  });
});
