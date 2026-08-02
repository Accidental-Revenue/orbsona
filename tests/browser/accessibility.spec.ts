import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("exposes the avatar and Studio controls with semantic names", async ({ page }) => {
  await expect(page.getByRole("img", { name: "Aster avatar, idle state" }).first()).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Agent name" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Morphology" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Palette" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Material" })).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "Agent state" })).toBeVisible();
});

test("holds a deterministic state pose when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("radio", { name: "Thinking" }).click();
  const canvas = page.locator("[data-studio-avatar] canvas");
  await expect(canvas).toHaveAttribute("data-avatar-ready", "true");
  const first = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(300);
  const second = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  expect(second).toBe(first);
});

test("keeps all public routes free of browser errors and warnings", async ({ page }) => {
  const messages: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      messages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));

  for (const route of ["/", "/playground", "/install", "/docs"]) {
    await page.goto(route);
    await page.locator("main").waitFor({ state: "visible" });
  }
  expect(messages).toEqual([]);
});
