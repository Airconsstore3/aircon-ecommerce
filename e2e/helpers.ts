import type { Page } from "@playwright/test";

export const ROUTES = [
  "/", "/products", "/categories/residential", "/about", "/cart",
  "/login", "/signup", "/repairs", "/warranty", "/maintenance",
  "/installation", "/account/warranties", "/account/subscriptions",
  "/account/orders", "/return-policy", "/privacy", "/terms",
];

export const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

export const FORBIDDEN_STRINGS = [
  "Continue with Google",
  "MOCK_WARRANTIES",
  "MOCK_SUBSCRIPTIONS",
  "Download Certificate",
  "Log a Claim",
  "Cancel Plan",
  "Track Order",
  "Best seller",
  "Real installations",
  "Real results",
  "or continue with",
];

export interface PageIssues {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
}

/** Attaches collectors for console errors, uncaught errors and failed/4xx+ requests. */
export function collectIssues(page: Page): PageIssues {
  const issues: PageIssues = { consoleErrors: [], pageErrors: [], failedRequests: [] };
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/i.test(m.text())) {
      issues.consoleErrors.push(m.text().slice(0, 300));
    }
  });
  page.on("pageerror", (e) => issues.pageErrors.push(String(e).slice(0, 300)));
  page.on("requestfailed", (r) => {
    // _rsc entries are aborted client-prefetches during teardown — not real failures.
    if (!r.url().includes("_rsc") && !r.url().includes("favicon")) {
      issues.failedRequests.push(`${r.method()} ${r.url()}`);
    }
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("_rsc") && !r.url().includes("favicon")) {
      issues.failedRequests.push(`HTTP ${r.status()} ${r.url()}`);
    }
  });
  return issues;
}

/**
 * Navigates to a route and waits for load + a bounded best-effort network
 * quiescence. Firefox keeps connections alive, so `waitUntil: "networkidle"`
 * on goto never settles there — this is the bounded equivalent.
 */
export async function gotoSettled(page: Page, route: string) {
  const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load", { timeout: 15000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  return resp;
}

export async function expectNoHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  );
}

export async function mainLandmarkCount(page: Page): Promise<number> {
  return page.evaluate(() => document.querySelectorAll("main").length);
}

export function forbiddenHits(html: string): string[] {
  const lower = html.toLowerCase();
  return FORBIDDEN_STRINGS.filter((f) => lower.includes(f.toLowerCase()));
}
