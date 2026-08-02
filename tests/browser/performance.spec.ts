import { expect, test } from "@playwright/test";

type BrowserMetrics = {
  cls: number;
  lcp: number;
  longestTask: number;
};

test("keeps public routes inside launch performance budgets", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Core Web Vitals are gated in the canonical Chromium runtime.");

  await page.addInitScript(() => {
    const metrics: BrowserMetrics = { cls: 0, lcp: 0, longestTask: 0 };
    Object.defineProperty(window, "__orbsonaMetrics", { value: metrics, configurable: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.lcp = Math.max(metrics.lcp, entry.startTime);
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.longestTask = Math.max(metrics.longestTask, entry.duration);
    }).observe({ type: "longtask", buffered: true });
  });

  for (const route of ["/", "/playground", "/install", "/docs"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const metrics = (window as typeof window & { __orbsonaMetrics: BrowserMetrics }).__orbsonaMetrics;
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const initialJavaScriptBytes = performance.getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js"))
        .reduce((total, entry) => total + (entry as PerformanceResourceTiming).encodedBodySize, 0);
      return {
        ...metrics,
        domInteractive: navigation.domInteractive,
        initialJavaScriptBytes,
      };
    });

    expect(result.lcp, `${route} LCP`).toBeLessThan(2_500);
    expect(result.cls, `${route} CLS`).toBeLessThanOrEqual(0.1);
    expect(result.longestTask, `${route} longest task`).toBeLessThan(120);
    expect(result.domInteractive, `${route} DOM interactive`).toBeLessThan(2_500);
    expect(result.initialJavaScriptBytes, `${route} initial JavaScript`).toBeLessThan(700_000);
  }
});
