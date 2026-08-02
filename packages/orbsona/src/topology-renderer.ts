import type { AvatarIdentity } from "./index.js";
import { sampleTopology, topologyResolutionForSize, type TopologyPose } from "./topology.js";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface TopologySurface {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  resolution: number;
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function mixColor(from: Rgb, to: Rgb, amount: number): Rgb {
  const unit = clamp(amount);
  return {
    r: mix(from.r, to.r, unit),
    g: mix(from.g, to.g, unit),
    b: mix(from.b, to.b, unit),
  };
}

function parseHex(value: string): Rgb {
  return {
    r: Number.parseInt(value.slice(1, 3), 16),
    g: Number.parseInt(value.slice(3, 5), 16),
    b: Number.parseInt(value.slice(5, 7), 16),
  };
}

function hashPixel(x: number, y: number, seed: number) {
  let value = Math.imul(x + 17, 0x45d9f3b) ^ Math.imul(y + 29, 0x27d4eb2d) ^ seed;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295;
}

function materialColor(
  identity: AvatarIdentity,
  height: number,
  slopeX: number,
  slopeY: number,
  radius: number,
  x: number,
  y: number,
  pose: TopologyPose,
) {
  const [primary, base, highlight] = identity.palette.colors.map(parseHex) as [Rgb, Rgb, Rgb];
  const normalLength = Math.hypot(slopeX * 3.2, slopeY * 3.2, 1);
  const normalX = -slopeX * 3.2 / normalLength;
  const normalY = -slopeY * 3.2 / normalLength;
  const normalZ = 1 / normalLength;
  const diffuse = clamp(normalX * -0.42 + normalY * -0.56 + normalZ * 0.72);
  const edge = clamp((radius - 0.58) / 0.42);
  const contourUnit = Math.abs((height * 8.5) % 1 - 0.5) * 2;
  const contour = 1 - clamp(contourUnit / 0.16);
  const stateLight = clamp(pose.focus * 0.12 + pose.pressure * 0.14 + pose.alignment * 0.1);
  let color: Rgb;

  if (identity.material === "glass") {
    const depth = clamp(height * 0.68 + diffuse * 0.42);
    color = mixColor(base, primary, depth * 0.72);
    const caustic = clamp((diffuse - 0.63) * 3.5 + contour * 0.26);
    color = mixColor(color, highlight, caustic * (0.54 + stateLight));
    color = mixColor(color, { r: 5, g: 8, b: 15 }, edge * 0.48);
  } else if (identity.material === "ink") {
    const band = Math.floor(clamp(height) * 5) / 4;
    color = mixColor(base, primary, band * 0.78);
    color = mixColor(color, highlight, contour * 0.46 + (diffuse > 0.82 ? 0.12 : 0));
    color = mixColor(color, { r: 7, g: 8, b: 11 }, edge * 0.34);
  } else if (identity.material === "frost") {
    const grain = (hashPixel(x, y, identity.seed) - 0.5) * 0.15;
    const softLight = clamp(height * 0.42 + diffuse * 0.42 + grain + 0.08);
    color = mixColor(base, primary, softLight);
    color = mixColor(color, highlight, clamp(diffuse - 0.62) * 0.28 + contour * 0.08);
    color = mixColor(color, { r: 12, g: 13, b: 17 }, edge * 0.3);
  } else {
    const relief = clamp(height * 0.46 + diffuse * 0.68 - 0.08);
    color = mixColor(base, primary, relief);
    color = mixColor(color, highlight, clamp(diffuse - 0.7) * 0.62 + contour * 0.13 + stateLight);
    color = mixColor(color, { r: 8, g: 9, b: 13 }, edge * 0.42);
  }

  return color;
}

export function createTopologySurface(): TopologySurface {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Orbsona could not create a topology surface.");
  return { canvas, context, resolution: 0 };
}

export function paintTopologySurface(
  surface: TopologySurface,
  identity: AvatarIdentity,
  pose: TopologyPose,
  displaySize: number,
) {
  const resolution = topologyResolutionForSize(displaySize);
  if (surface.resolution !== resolution) {
    surface.canvas.width = resolution;
    surface.canvas.height = resolution;
    surface.resolution = resolution;
  }

  const image = surface.context.createImageData(resolution, resolution);
  const heights = new Float32Array(resolution * resolution);
  const step = 2 / Math.max(1, resolution - 1);
  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const unitX = x * step - 1;
      const unitY = y * step - 1;
      heights[y * resolution + x] = sampleTopology(
        identity.morphology,
        unitX,
        unitY,
        identity.seed,
        pose,
      );
    }
  }

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const offset = y * resolution + x;
      const pixel = offset * 4;
      const unitX = x * step - 1;
      const unitY = y * step - 1;
      const radius = Math.hypot(unitX, unitY);
      if (radius > 1) continue;

      const left = heights[y * resolution + Math.max(0, x - 1)];
      const right = heights[y * resolution + Math.min(resolution - 1, x + 1)];
      const top = heights[Math.max(0, y - 1) * resolution + x];
      const bottom = heights[Math.min(resolution - 1, y + 1) * resolution + x];
      const color = materialColor(
        identity,
        heights[offset],
        right - left,
        bottom - top,
        radius,
        x,
        y,
        pose,
      );
      const rim = clamp((1 - radius) * resolution * 0.68);
      image.data[pixel] = Math.round(color.r);
      image.data[pixel + 1] = Math.round(color.g);
      image.data[pixel + 2] = Math.round(color.b);
      image.data[pixel + 3] = Math.round(255 * rim);
    }
  }

  surface.context.putImageData(image, 0, 0);
  return resolution;
}

export function drawTopologySurface(
  context: CanvasRenderingContext2D,
  surface: TopologySurface,
  size: number,
  pose: TopologyPose,
  palette: AvatarIdentity["palette"],
) {
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const scale = 1 + pose.pressure * 0.025 - pose.focus * 0.012;
  context.translate(size / 2, size / 2);
  context.scale(scale, scale);
  context.translate(-size / 2, -size / 2);
  context.shadowColor = palette.colors[0];
  context.shadowBlur = size * (0.018 + pose.signal * 0.035 + pose.alignment * 0.018);
  context.drawImage(surface.canvas, 0, 0, size, size);
  context.restore();

  context.save();
  const edge = context.createLinearGradient(size * 0.18, size * 0.12, size * 0.84, size * 0.9);
  edge.addColorStop(0, `${palette.colors[2]}55`);
  edge.addColorStop(0.46, `${palette.colors[0]}15`);
  edge.addColorStop(1, "#00000088");
  context.strokeStyle = edge;
  context.lineWidth = Math.max(0.75, size * 0.008);
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.496, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}
