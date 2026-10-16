import { test, expect } from "@playwright/test";
import { ROUTES, VIEWPORTS, collectIssues, expectNoHorizontalOverflow, mainLandmarkCount, forbiddenHits, gotoSettled } from "./helpers";

// Viewports are set via browser.newContext — page.setViewportSize is unreliable
// in Playwright Firefox (the window-resize emulation call can hang).
test.describe("route × viewport smoke", () => {
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      test(`${route} @${vp.width}x${vp.height}`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: vp });
        const page = await context.newPage();
        const issues = collectIssues(page);
        const resp = await gotoSettled(page, route);
        expect(resp?.status(), `HTTP status for ${route}`).toBe(200);
        expect(await expectNoHorizontalOverflow(page), "horizontal overflow").toBe(true);
        expect(await mainLandmarkCount(page), "main landmark count").toBe(1);
        expect(forbiddenHits(await page.content()), "forbidden strings").toEqual([]);
        expect(issues.pageErrors, "uncaught page errors").toEqual([]);
        expect(
          issues.consoleErrors.filter((e) => !/favicon/i.test(e)),
          "console errors",
        ).toEqual([]);
        expect(issues.failedRequests, "failed requests").toEqual([]);
        await context.close();
      });
    }
  }
});
