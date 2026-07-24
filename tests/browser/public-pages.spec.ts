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
  await expect(page.getByText("v0.1.1 · public on npm")).toBeVisible();

  await page.goto("/docs");
  await expect(page.getByText("Public npm package · v0.1.1")).toBeVisible();
});

test("the legacy package route resolves to install", async ({ page }) => {
  await page.goto("/package");
  await expect(page).toHaveURL(/\/install$/);
  await expect(page.getByRole("heading", { level: 1, name: "Install Orbsona" })).toBeVisible();
});
