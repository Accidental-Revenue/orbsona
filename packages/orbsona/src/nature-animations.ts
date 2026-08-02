import type { AvatarAnimation } from "./index.js";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export interface PhyllotaxisPoint {
  angle: number;
  radius: number;
  size: number;
  phase: number;
}

export interface RadiolariaNode {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
}

export interface RadiolariaMesh {
  nodes: RadiolariaNode[];
  edges: Array<[number, number]>;
}

function seededUnit(seed: number, index: number) {
  let value = (seed + Math.imul(index + 1, 0x9e3779b9)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967296;
}

export function createPhyllotaxisPoints(count: number, seed: number): PhyllotaxisPoint[] {
  const safeCount = Math.max(1, Math.floor(count));
  const seedAngle = seededUnit(seed, 0) * Math.PI * 2;
  return Array.from({ length: safeCount }, (_, index) => ({
    angle: seedAngle + index * GOLDEN_ANGLE,
    radius: Math.sqrt((index + 0.5) / safeCount),
    size: 0.68 + seededUnit(seed, index + 1) * 0.72,
    phase: seededUnit(seed, index + safeCount + 1) * Math.PI * 2,
  }));
}

export function createRadiolariaMesh(count: number, seed: number): RadiolariaMesh {
  const safeCount = Math.max(12, Math.floor(count));
  const seedAngle = seededUnit(seed, 0) * Math.PI * 2;
  const nodes = Array.from({ length: safeCount }, (_, index): RadiolariaNode => {
    const y = 1 - 2 * ((index + 0.5) / safeCount);
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = seedAngle + index * GOLDEN_ANGLE;
    return {
      x: Math.cos(angle) * radial,
      y,
      z: Math.sin(angle) * radial,
      size: 0.72 + seededUnit(seed, index + 1) * 0.58,
      phase: seededUnit(seed, index + safeCount + 1) * Math.PI * 2,
    };
  });

  const edges: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (let from = 0; from < nodes.length; from += 1) {
    const nearest = nodes
      .map((node, to) => ({
        to,
        distance: to === from
          ? Number.POSITIVE_INFINITY
          : (node.x - nodes[from].x) ** 2
            + (node.y - nodes[from].y) ** 2
            + (node.z - nodes[from].z) ** 2,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
    for (const { to } of nearest) {
      const low = Math.min(from, to);
      const high = Math.max(from, to);
      const key = `${low}:${high}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([low, high]);
      }
    }
  }

  return { nodes, edges };
}

const phyllotaxisCache = new Map<string, PhyllotaxisPoint[]>();
const radiolariaCache = new Map<string, RadiolariaMesh>();

function phyllotaxisPoints(count: number, seed: number) {
  const key = `${count}:${seed}`;
  const cached = phyllotaxisCache.get(key);
  if (cached) return cached;
  const points = createPhyllotaxisPoints(count, seed);
  phyllotaxisCache.set(key, points);
  return points;
}

function radiolariaMesh(count: number, seed: number) {
  const key = `${count}:${seed}`;
  const cached = radiolariaCache.get(key);
  if (cached) return cached;
  const mesh = createRadiolariaMesh(count, seed);
  radiolariaCache.set(key, mesh);
  return mesh;
}

function drawPhyllotaxis(
  context: CanvasRenderingContext2D,
  size: number,
  time: number,
  seed: number,
) {
  const count = size < 40 ? 96 : 196;
  const points = phyllotaxisPoints(count, seed);
  const center = size / 2;
  const extent = size * 0.33;
  const rotation = time * 0.16;

  context.save();
  context.fillStyle = "#fff";
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const growthWave = 0.5 + 0.5 * Math.sin(time * 1.65 - point.radius * 11.5 + point.phase);
    const breath = 1 + Math.sin(time * 0.74 + point.radius * 5.2) * 0.018;
    const radius = point.radius * extent * breath;
    const angle = point.angle + rotation + Math.sin(time * 0.42 + point.radius * 4) * 0.025;
    const edgeFade = Math.max(0.16, 1 - point.radius ** 4 * 0.72);
    const depth = 0.58 + Math.cos(angle - time * 0.1) * 0.28;
    const dotRadius = Math.max(0.48, size * 0.0042 * point.size * (0.82 + growthWave * 0.42));
    context.globalAlpha = edgeFade * (0.34 + depth * 0.42 + growthWave * 0.18);
    context.beginPath();
    context.arc(
      center + Math.cos(angle) * radius,
      center + Math.sin(angle) * radius,
      dotRadius,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();
}

interface ProjectedNode extends RadiolariaNode {
  screenX: number;
  screenY: number;
  depth: number;
}

function drawRadiolaria(
  context: CanvasRenderingContext2D,
  size: number,
  time: number,
  seed: number,
) {
  const count = size < 40 ? 42 : 72;
  const { nodes, edges } = radiolariaMesh(count, seed);
  const center = size / 2;
  const extent = size * 0.325;
  const rotationY = time * 0.21 + seed * 0.00017;
  const rotationX = -0.35 + Math.sin(time * 0.17 + seed * 0.00009) * 0.1;
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const projected: ProjectedNode[] = nodes.map((node) => {
    const x1 = node.x * cosY - node.z * sinY;
    const z1 = node.x * sinY + node.z * cosY;
    const y2 = node.y * cosX - z1 * sinX;
    const z2 = node.y * sinX + z1 * cosX;
    return {
      ...node,
      screenX: center + x1 * extent,
      screenY: center + y2 * extent,
      depth: z2,
    };
  });

  context.save();
  context.strokeStyle = "#fff";
  context.lineWidth = Math.max(0.45, size * 0.0022);
  for (const [from, to] of edges) {
    const a = projected[from];
    const b = projected[to];
    const depth = (a.depth + b.depth) * 0.5;
    const signal = 0.5 + 0.5 * Math.sin(time * 1.3 + a.phase + b.phase);
    context.globalAlpha = 0.08 + (depth + 1) * 0.105 + signal * 0.09;
    context.beginPath();
    context.moveTo(a.screenX, a.screenY);
    context.lineTo(b.screenX, b.screenY);
    context.stroke();
  }

  context.fillStyle = "#fff";
  const sorted = projected.slice().sort((a, b) => a.depth - b.depth);
  for (const node of sorted) {
    const signal = 0.5 + 0.5 * Math.sin(time * 1.45 + node.phase);
    const depth = (node.depth + 1) * 0.5;
    context.globalAlpha = 0.24 + depth * 0.54 + signal * 0.18;
    context.beginPath();
    context.arc(
      node.screenX,
      node.screenY,
      Math.max(0.5, size * 0.0044 * node.size * (0.78 + signal * 0.32)),
      0,
      Math.PI * 2,
    );
    context.fill();
  }
  context.restore();
}

export function drawNatureAnimation(
  context: CanvasRenderingContext2D,
  size: number,
  time: number,
  animation: Extract<AvatarAnimation, "phyllotaxis" | "radiolaria">,
  seed: number,
) {
  if (animation === "radiolaria") {
    drawRadiolaria(context, size, time, seed);
    return;
  }
  drawPhyllotaxis(context, size, time, seed);
}
