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

test("install and documentation advertise the published patch", async ({ page }) => {
  await page.goto("/install");
  await expect(page.getByText("v0.2.0 · public on npm")).toBeVisible();

  await page.goto("/docs");
  await expect(page.getByText("Public npm package · v0.2.0")).toBeVisible();
});

test("the legacy package route resolves to install", async ({ page }) => {
  await page.goto("/package");
  await expect(page).toHaveURL(/\/install$/);
  await expect(page.getByRole("heading", { level: 1, name: "Install Orbsona" })).toBeVisible();
});

test("the Playground drives all runtime states and signal energy", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "Error", exact: true }).click();
  await expect(page.getByRole("img", { name: "Aster avatar, error state" }).first()).toBeVisible();
  await page.getByRole("slider").fill("1");
  await expect(page.getByText("1.00", { exact: true })).toBeVisible();
  const canvas = page.locator("[data-avatar-canvas] canvas").first();
  await expect(canvas).toHaveAttribute("data-avatar-ready", "true", { timeout: 10_000 });
  await expect(canvas).toHaveAttribute("data-avatar-topology-resolution", "144");
});
