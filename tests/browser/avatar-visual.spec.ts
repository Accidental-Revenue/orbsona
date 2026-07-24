import { expect, test } from "@playwright/test";

for (const size of [32, 64, 256] as const) {
  test(`keeps the ${size} pixel idle identity visually stable`, async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "Golden images use one canonical browser.");
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("radio", { name: `${size} pixel preview` }).click();
    const canvas = page.locator("[data-studio-avatar] canvas");
    await expect(canvas).toHaveAttribute("data-avatar-ready", "true");
    await expect(canvas).toHaveScreenshot(`aster-idle-${size}.png`, {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
      scale: "css",
    });
  });
}
