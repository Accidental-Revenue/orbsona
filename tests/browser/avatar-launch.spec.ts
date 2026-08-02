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
    version: 2,
    identity: {
      name: "Aster",
      morphology: "basin",
      material: "mineral",
      seed: 2718,
    },
  });
  expect(payload.identity).not.toHaveProperty("background");
  expect(payload.identity).not.toHaveProperty("animation");
});

test("migrates a version 1 identity file into the v2 editor", async ({ page }) => {
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import" }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "legacy.orbsona.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      format: "orbsona.identity",
      version: 1,
      identity: {
        name: "Legacy",
        background: "currents",
        animation: "wave",
        palette: { id: "moss", name: "Moss", colors: ["#92d6b0", "#235848", "#e5fff0"] },
        seed: 91,
      },
    })),
  });

  await expect(page.getByRole("textbox", { name: "Agent name" })).toHaveValue("Legacy");
  await expect(page.getByRole("button", { name: "Current" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Glass" })).toHaveAttribute("aria-pressed", "true");
});

test("every morphology and material produces a distinct rendered identity", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const canvas = page.locator("[data-studio-avatar] canvas");
  const signature = () => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const morphologySignatures = new Set<string>();
  for (const name of ["Basin", "Ridge", "Archipelago", "Fault", "Cellular", "Pleat", "Current", "Chorus"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(80);
    await expect(canvas).toHaveAttribute("data-avatar-ready", "true");
    morphologySignatures.add(await signature());
  }
  expect(morphologySignatures.size).toBe(8);

  const materialSignatures = new Set<string>();
  for (const name of ["Mineral", "Glass", "Ink", "Frost"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(80);
    await expect(canvas).toHaveAttribute("data-avatar-ready", "true");
    materialSignatures.add(await signature());
  }
  expect(materialSignatures.size).toBe(4);
});

test("keeps the default live topology inside its frame budget", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Long-task timing is standardized in Chromium for this gate.");
  const canvas = page.locator("[data-studio-avatar] canvas");
  await expect(canvas).toHaveAttribute("data-avatar-topology-resolution", "112");
  const result = await page.evaluate(async () => {
    const durations: number[] = [];
    const observer = "PerformanceObserver" in window
      ? new PerformanceObserver((list) => {
          durations.push(...list.getEntries().map((entry) => entry.duration));
        })
      : null;
    observer?.observe({ type: "longtask", buffered: false });
    const intervals: number[] = [];
    await new Promise<void>((resolve) => {
      let previous = performance.now();
      const sample = (now: number) => {
        intervals.push(now - previous);
        previous = now;
        if (intervals.length < 90) requestAnimationFrame(sample);
        else resolve();
      };
      requestAnimationFrame(sample);
    });
    observer?.disconnect();
    const stable = intervals.slice(10);
    return {
      averageFrame: stable.reduce((total, value) => total + value, 0) / stable.length,
      longestTask: Math.max(0, ...durations),
    };
  });

  // The renderer intentionally targets 24 fps at idle and 30 fps in active
  // states. Shared CI runners can schedule rAF at that same cadence.
  expect(result.averageFrame).toBeLessThan(42);
  expect(result.longestTask).toBeLessThan(120);
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
