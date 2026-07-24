import type { AvatarBackground, AvatarIdentity } from "./index.js";

type RGB = [number, number, number];

export const ORB_RADIUS_RATIO = 0.47;

function hexToRgb(hex: string): RGB {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixRgb(from: RGB, to: RGB, amount: number): RGB {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function organicReliefHeight(x: number, y: number, seed: number) {
  const seedPhase = seed * 0.00037;
  const warpedX = x + Math.sin(y * 2.7 + seedPhase) * 0.22;
  const warpedY = y + Math.cos(x * 2.15 - seedPhase * 0.7) * 0.19;
  let height = 0;
  let amplitude = 0.56;
  let frequency = 1.96;

  for (let octave = 0; octave < 5; octave += 1) {
    const angle = seedPhase * (octave + 1) + octave * 1.17;
    const axisA = warpedX * Math.cos(angle) + warpedY * Math.sin(angle);
    const axisB = -warpedX * Math.sin(angle) + warpedY * Math.cos(angle);
    height += Math.sin(axisA * frequency + angle) * Math.cos(axisB * frequency * 0.83 - angle) * amplitude;
    frequency *= 1.92;
    amplitude *= 0.51;
  }

  return 0.5 + Math.tanh(height * 1.15) * 0.5;
}

function dunesReliefHeight(x: number, y: number, seed: number) {
  const phase = seed * 0.00053;
  const direction = y * 0.88 - x * 0.28;
  const warp = Math.sin(x * 2.05 + phase) * 0.24
    + Math.sin(x * 4.8 - y * 0.7 - phase * 0.6) * 0.075;
  const primary = Math.sin((direction + warp) * 6.4 + phase);
  const secondary = Math.sin((direction * 1.72 - x * 0.2) * 6.4 - phase) * 0.22;
  const ridge = Math.sign(primary) * Math.pow(Math.abs(primary), 0.72);
  return clamp(0.52 + ridge * 0.35 + secondary);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const normalized = clamp((value - edge0) / (edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
}

function strataReliefHeight(x: number, y: number, seed: number) {
  const phase = seed * 0.00031;
  const centeredX = x + 0.17 + Math.sin(y * 1.45 + phase) * 0.14;
  const centeredY = y - 0.11 + Math.cos(x * 1.25 - phase) * 0.11;
  const radius = Math.hypot(centeredX * 0.88, centeredY);
  const angle = Math.atan2(centeredY, centeredX);
  const organic = organicReliefHeight(x * 0.36, y * 0.36, seed + 83) - 0.5;
  const source = clamp(0.87 - radius * 0.4 + organic * 0.2 + Math.sin(angle * 2.4 + phase) * 0.035);
  const levels = 7;
  const scaled = source * levels;
  const terrace = Math.floor(scaled);
  const edge = smoothstep(0.34, 0.66, scaled - terrace);
  return clamp((terrace + edge) / levels);
}

function currentsReliefHeight(x: number, y: number, seed: number) {
  const phase = seed * 0.00043;
  const direction = x * 0.68 + y * 0.62;
  const warp = Math.sin(y * 1.9 + phase) * 0.27
    + Math.sin((x + y) * 3.4 - phase * 0.5) * 0.085;
  const primary = Math.sin((direction + warp) * 6.05 + phase);
  const secondary = Math.sin((direction * 1.43 + y * 0.18) * 5.2 - phase) * 0.19;
  const crest = Math.sign(primary) * Math.pow(Math.abs(primary), 0.78);
  return clamp(0.51 + crest * 0.34 + secondary);
}

function reliefHeight(x: number, y: number, seed: number, background: AvatarBackground) {
  if (background === "dunes") return dunesReliefHeight(x, y, seed);
  if (background === "strata") return strataReliefHeight(x, y, seed);
  if (background === "currents") return currentsReliefHeight(x, y, seed);
  return organicReliefHeight(x, y, seed);
}

function createReliefTexture(identity: AvatarIdentity, size: number) {
  const resolution = Math.max(96, Math.min(240, Math.round(size * 0.48)));
  const texture = document.createElement("canvas");
  texture.width = resolution;
  texture.height = resolution;
  const context = texture.getContext("2d");
  if (!context) return texture;

  const heights = new Float32Array(resolution * resolution);
  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const nx = (x / (resolution - 1) - 0.5) * 2.3;
      const ny = (y / (resolution - 1) - 0.5) * 2.3;
      heights[y * resolution + x] = reliefHeight(nx, ny, identity.seed, identity.background);
    }
  }

  const image = context.createImageData(resolution, resolution);
  const highlight = hexToRgb(identity.palette.colors[0]);
  const base = mixRgb(hexToRgb(identity.palette.colors[1]), [5, 5, 6], 0.68);
  const depth = 0.62;
  const slopeX = identity.background === "currents" ? 4.2 : identity.background === "strata" ? 4 : 3.15;
  const slopeY = identity.background === "currents" ? 3.3 : identity.background === "strata" ? 3.1 : 2.45;

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const index = y * resolution + x;
      const left = heights[y * resolution + Math.max(0, x - 1)];
      const right = heights[y * resolution + Math.min(resolution - 1, x + 1)];
      const top = heights[Math.max(0, y - 1) * resolution + x];
      const bottom = heights[Math.min(resolution - 1, y + 1) * resolution + x];
      const light = clamp(0.54 + (left - right) * slopeX + (top - bottom) * slopeY, 0.14, 1);
      const elevation = heights[index];
      const tone = Math.max(0, Math.min(1, elevation * (0.46 + depth * 0.38) + light * 0.32));
      const color = mixRgb(base, highlight, tone * 0.72);
      const offset = index * 4;
      image.data[offset] = Math.round(color[0] * (0.58 + light * 0.42));
      image.data[offset + 1] = Math.round(color[1] * (0.58 + light * 0.42));
      image.data[offset + 2] = Math.round(color[2] * (0.58 + light * 0.42));
      image.data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return texture;
}

function createGrainTexture(seed: number) {
  const resolution = 168;
  const texture = document.createElement("canvas");
  texture.width = resolution;
  texture.height = resolution;
  const context = texture.getContext("2d");
  if (!context) return texture;

  const image = context.createImageData(resolution, resolution);
  let value = (seed ^ 0x9e3779b9) >>> 0;
  for (let index = 0; index < resolution * resolution; index += 1) {
    value += 0x6d2b79f5;
    let noise = value;
    noise = Math.imul(noise ^ (noise >>> 15), noise | 1);
    noise ^= noise + Math.imul(noise ^ (noise >>> 7), noise | 61);
    const random = ((noise ^ (noise >>> 14)) >>> 0) / 4294967296;
    const bright = random > 0.48;
    const offset = index * 4;
    image.data[offset] = bright ? 255 : 0;
    image.data[offset + 1] = bright ? 255 : 0;
    image.data[offset + 2] = bright ? 255 : 0;
    image.data[offset + 3] = Math.round(18 + Math.abs(random - 0.5) * 54);
  }
  context.putImageData(image, 0, 0);
  return texture;
}

export function paintOrbBackground(
  context: CanvasRenderingContext2D,
  size: number,
  dpr: number,
  identity: AvatarIdentity,
) {
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * ORB_RADIUS_RATIO;
  context.save();
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.clip();

  const texture = createReliefTexture(identity, size);
  context.imageSmoothingEnabled = true;
  context.drawImage(texture, center - radius, center - radius, radius * 2, radius * 2);

  const vignette = context.createRadialGradient(center, center, size * 0.2, center, center, radius);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.78, "rgba(0,0,0,0.08)");
  vignette.addColorStop(1, "rgba(0,0,0,0.52)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, size, size);

  if (identity.grain) {
    const grain = createGrainTexture(identity.seed);
    context.globalCompositeOperation = "soft-light";
    context.globalAlpha = 0.78;
    context.imageSmoothingEnabled = false;
    context.drawImage(grain, center - radius, center - radius, radius * 2, radius * 2);
  }
  context.restore();
}

export function paintOrbEdge(context: CanvasRenderingContext2D, size: number) {
  const center = size / 2;
  const radius = size * ORB_RADIUS_RATIO;
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.strokeStyle = "rgba(255,255,255,0.1)";
  context.lineWidth = Math.max(1, size * 0.0022);
  context.stroke();
}
