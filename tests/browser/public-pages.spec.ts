import { expect, test } from "@playwright/test";

const pages = [
  { path: "/playground", heading: "Playground" },
  { path: "/install", heading: "Install Orbsona" },
  { path: "/docs", heading: "Documentation" },
] as const;

for (const { path, heading } of pages) {
  test(`${path} presents its production content`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orbsona home" }).first()).toHaveAttribute(
      "href",
      "/",
    );
  });
}

test("install and documentation link to the public package without claiming an unpublished version", async ({ page }) => {
  await page.goto("/install");
  await expect(page.getByRole("link", { name: "View on npm" })).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/@accidental-revenue/orbsona",
  );

  await page.goto("/docs");
  await expect(page.getByText("Public npm package", { exact: true })).toBeVisible();
});

test("documentation offers a package-manager picker with quick copy", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Clipboard permissions are verified in Chromium.");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs");

  const managerButton = page.getByRole("button", { name: "Package manager: npm" });
  await managerButton.click();
  await page.getByRole("option", { name: "pnpm", exact: true }).click();

  const command = "pnpm add @accidental-revenue/orbsona";
  await expect(page.getByText(command, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Copy install command" }).click();
  await expect(page.getByRole("button", { name: "Install command copied" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(command);
});

test("the legacy package route resolves to install", async ({ page }) => {
  await page.goto("/package");
  await expect(page).toHaveURL(/\/install$/);
  await expect(page.getByRole("heading", { level: 1, name: "Install Orbsona" })).toBeVisible();
});

test("renders unknown routes inside one application landmark", async ({ page }) => {
  const response = await page.goto("/missing-identity");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "This identity does not exist." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open studio" })).toHaveAttribute("href", "/#studio-workspace");
});

test("serves production security headers and discovery metadata", async ({ page, request }) => {
  const response = await page.goto("/");
  const headers = response?.headers() ?? {};
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["strict-transport-security"]).toContain("max-age=31536000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  await expect.poll(() => robots.text()).toContain("https://orbsona.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  await expect.poll(() => sitemap.text()).toContain("https://orbsona.com/docs");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({ name: "Orbsona", display: "standalone" });

  for (const imagePath of ["/icon", "/opengraph-image"]) {
    const image = await request.get(imagePath);
    expect(image.ok(), `${imagePath} should render`).toBe(true);
    expect(image.headers()["content-type"]).toContain("image/png");
    expect((await image.body()).byteLength, `${imagePath} should not be empty`).toBeGreaterThan(1_000);
  }
});

test("keeps every public route inside a compact viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/playground", "/install", "/docs"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    const offenders = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.width === 0 || bounds.height === 0 || (bounds.left >= -1 && bounds.right <= window.innerWidth + 1)) {
          return false;
        }
        let ancestor = element.parentElement;
        while (ancestor) {
          const overflowX = getComputedStyle(ancestor).overflowX;
          if (ancestor.tagName === "PRE" && (overflowX === "auto" || overflowX === "scroll") && ancestor.scrollWidth > ancestor.clientWidth) {
            return false;
          }
          ancestor = ancestor.parentElement;
        }
        return true;
      })
      .slice(0, 5)
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent?.trim().slice(0, 60),
      })));
    expect(offenders, `${route} horizontal overflow`).toEqual([]);

    if (route === "/") {
      const avatar = await page.locator("[data-studio-avatar]").boundingBox();
      const stateSwitcher = await page.locator(".state-switcher").boundingBox();
      expect(avatar, "Studio avatar should be visible").not.toBeNull();
      expect(stateSwitcher, "Studio state switcher should be visible").not.toBeNull();
      expect(
        avatar!.y + avatar!.height,
        "Studio avatar should not be covered by the state switcher",
      ).toBeLessThanOrEqual(stateSwitcher!.y - 4);
    }

    if (route === "/playground") {
      const preview = await page.locator(".preview-stage").boundingBox();
      const runtimeAvatar = await page.getByRole("img", { name: /Aster avatar/ }).boundingBox();
      expect(preview, "Playground preview should be visible").not.toBeNull();
      expect(runtimeAvatar, "Playground avatar should be visible").not.toBeNull();
      expect(preview!.height, "Playground preview should not collapse").toBeGreaterThanOrEqual(240);
      expect(runtimeAvatar!.y).toBeGreaterThanOrEqual(preview!.y);
      expect(runtimeAvatar!.y + runtimeAvatar!.height).toBeLessThanOrEqual(preview!.y + preview!.height);
    }
  }

  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/", { waitUntil: "networkidle" });
  const shortAvatar = await page.locator("[data-studio-avatar]").boundingBox();
  const shortStateSwitcher = await page.locator(".state-switcher").boundingBox();
  expect(shortAvatar, "Studio avatar should remain visible on short screens").not.toBeNull();
  expect(shortStateSwitcher, "Studio state switcher should remain visible on short screens").not.toBeNull();
  expect(
    shortAvatar!.y + shortAvatar!.height,
    "Studio avatar should not be covered on a short screen",
  ).toBeLessThanOrEqual(shortStateSwitcher!.y - 4);
});

test("the Playground drives all runtime states and signal energy", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "Error", exact: true }).click();
  const runtimeAvatar = page.getByRole("img", { name: "Aster avatar, error state" });
  await expect(runtimeAvatar).toBeVisible();
  await page.getByRole("slider").fill("1");
  await expect(page.getByText("1.00", { exact: true })).toBeVisible();
  const canvas = runtimeAvatar.locator("canvas");
  await expect(canvas).toHaveAttribute("data-avatar-ready", "true", { timeout: 10_000 });
  await expect(canvas).toHaveAttribute("data-avatar-preset-size", "64");
  await expect(canvas).toHaveAttribute("data-avatar-animation", "field");
});
