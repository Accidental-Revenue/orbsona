import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

function pngDimensions(buffer: Buffer) {
  expect(buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("exposes a reproducible identity seed", async ({ page }) => {
  const seed = page.getByRole("spinbutton", { name: "Identity seed" });
  await expect(seed).toHaveValue("2718");
  await seed.fill("424242");
  await expect(seed).toHaveValue("424242");
  await expect(page.getByText("Saved in this browser").first()).toBeVisible();

  await expect(page.locator("[data-studio-avatar] canvas"))
    .toHaveAttribute("data-avatar-ready", "true");

  await page.reload();
  await expect(page.getByRole("spinbutton", { name: "Identity seed" }))
    .toHaveValue("424242");
});

test("exports a non-blank fixed 512 pixel PNG", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG image" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);

  expect(pngDimensions(bytes)).toEqual({ width: 512, height: 512 });
  expect(bytes.byteLength).toBeGreaterThan(5_000);
  expect(download.suggestedFilename()).toBe("aster.png");
});

test("round-trips the portable identity document", async ({ page }) => {
  await page.getByRole("button", { name: "Add to your app" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .orbsona.json" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const payload = JSON.parse(await readFile(path!, "utf8"));

  expect(payload).toMatchObject({
    format: "orbsona.identity",
    version: 1,
    identity: {
      name: "Aster",
      seed: 2718,
    },
  });
});

test("records WebM or explains browser support", async ({ page }) => {
  const canRecord = await page.evaluate(() => (
    typeof HTMLCanvasElement.prototype.captureStream === "function"
    && typeof MediaRecorder !== "undefined"
    && [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].some((type) => MediaRecorder.isTypeSupported(type))
  ));

  if (!canRecord) {
    await page.getByRole("button", { name: "WebM clip" }).click();
    await expect(page.getByRole("alert")).toContainText(
      /Animated export is not supported|cannot encode a WebM file/,
    );
    return;
  }

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "WebM clip" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  expect((await readFile(path!)).byteLength).toBeGreaterThan(1_000);
  expect(download.suggestedFilename()).toBe("aster.webm");
});
