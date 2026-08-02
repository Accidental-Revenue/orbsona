import type { AgentState, AvatarMorphology } from "./index.js";

export interface TopologyPose {
  time: number;
  signal: number;
  drift: number;
  coherence: number;
  focus: number;
  division: number;
  pressure: number;
  flow: number;
  alignment: number;
  fracture: number;
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const unit = clamp((value - edge0) / (edge1 - edge0));
  return unit * unit * (3 - 2 * unit);
}

function hash2(x: number, y: number, seed: number) {
  let value = Math.imul(x | 0, 0x1f123bb5) ^ Math.imul(y | 0, 0x5f356495) ^ (seed >>> 0);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function seedUnit(seed: number, index: number) {
  return hash2(index * 37 + 11, index * 71 - 19, seed);
}

function valueNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(0, 1, x - x0);
  const ty = smoothstep(0, 1, y - y0);
  const top = mix(hash2(x0, y0, seed), hash2(x0 + 1, y0, seed), tx);
  const bottom = mix(hash2(x0, y0 + 1, seed), hash2(x0 + 1, y0 + 1, seed), tx);
  return mix(top, bottom, ty) * 2 - 1;
}

function gaussian(x: number, y: number, centerX: number, centerY: number, spread: number) {
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.exp(-(dx * dx + dy * dy) / spread);
}

function normalize(value: number) {
  return clamp(0.5 + Math.tanh(value) * 0.5);
}

export function createTopologyPose(
  state: AgentState,
  phase: number,
  stateAge: number,
  inputLevel: number,
  outputLevel: number,
  energyLevel: number,
  reduceMotion: boolean,
): TopologyPose {
  const input = clamp(inputLevel);
  const output = clamp(outputLevel);
  const energy = clamp(energyLevel);
  const time = reduceMotion ? 0.625 : phase;
  const base: TopologyPose = {
    time,
    signal: energy,
    drift: 0.16 + energy * 0.16,
    coherence: 0.08,
    focus: 0.05,
    division: 0.04,
    pressure: 0.03,
    flow: 0.06,
    alignment: 0.04,
    fracture: 0,
  };

  if (state === "connecting") {
    const arrival = smoothstep(0, 1.4, stateAge);
    return { ...base, signal: arrival, coherence: 0.28 + arrival * 0.65, drift: 0.1 };
  }
  if (state === "listening") {
    return { ...base, signal: input, focus: 0.34 + input * 0.66, drift: 0.08 + input * 0.1 };
  }
  if (state === "thinking") {
    return { ...base, signal: energy, division: 0.68 + energy * 0.28, drift: 0.28, flow: 0.18 };
  }
  if (state === "speaking") {
    return { ...base, signal: output, pressure: 0.3 + output * 0.7, drift: 0.14 + output * 0.18 };
  }
  if (state === "working") {
    return { ...base, signal: energy, flow: 0.58 + energy * 0.42, coherence: 0.24, drift: 0.3 };
  }
  if (state === "success") {
    const release = 1 - smoothstep(0.45, 1.5, stateAge);
    return { ...base, signal: release, alignment: 0.62 + release * 0.38, coherence: 0.72, drift: 0.05 };
  }
  if (state === "error") {
    return { ...base, signal: energy, fracture: 0.72 + energy * 0.28, drift: 0.04, coherence: 0 };
  }
  return base;
}

function deformPoint(x: number, y: number, seed: number, pose: TopologyPose) {
  const time = pose.time;
  const angle = seedUnit(seed, 3) * Math.PI * 2;
  let px = x;
  let py = y;

  const fieldX = valueNoise(px * 1.5 + time * 0.08, py * 1.5, seed + 17);
  const fieldY = valueNoise(px * 1.5, py * 1.5 - time * 0.07, seed + 43);
  px += fieldX * (0.045 + pose.drift * 0.055);
  py += fieldY * (0.045 + pose.drift * 0.055);

  if (pose.focus > 0) {
    const focusX = Math.cos(angle) * 0.34;
    const focusY = Math.sin(angle) * 0.25;
    const pull = gaussian(px, py, focusX, focusY, 0.62) * pose.focus;
    px = mix(px, focusX, pull * 0.24);
    py = mix(py, focusY, pull * 0.24);
  }

  if (pose.flow > 0) {
    const axis = px * Math.cos(angle) + py * Math.sin(angle);
    const cross = -px * Math.sin(angle) + py * Math.cos(angle);
    const bend = Math.sin(axis * 3.1 - time * 1.7) * pose.flow * 0.09;
    px += -Math.sin(angle) * bend + Math.cos(angle) * pose.flow * time * 0.012;
    py += Math.cos(angle) * bend + Math.sin(angle) * pose.flow * time * 0.012;
    px += cross * pose.flow * 0.018;
  }

  if (pose.fracture > 0) {
    const signed = px * Math.cos(angle) + py * Math.sin(angle)
      + Math.sin(py * 5.2 + seedUnit(seed, 9) * Math.PI * 2) * 0.09;
    const side = signed >= 0 ? 1 : -1;
    px += Math.cos(angle) * side * pose.fracture * 0.085;
    py += Math.sin(angle) * side * pose.fracture * 0.052;
  }

  return { x: px, y: py };
}

function basin(x: number, y: number, seed: number, time: number) {
  const centerX = (seedUnit(seed, 1) - 0.5) * 0.34 + Math.sin(time * 0.21) * 0.08;
  const centerY = (seedUnit(seed, 2) - 0.5) * 0.3 + Math.cos(time * 0.18) * 0.07;
  const primary = -gaussian(x, y, centerX, centerY, 0.52) * 1.25;
  const shoulder = gaussian(x, y, -centerX * 0.7, -centerY * 0.7, 1.1) * 0.72;
  const rings = Math.cos(Math.hypot(x - centerX, y - centerY) * 8.4 - time * 0.34) * 0.16;
  return primary + shoulder + rings;
}

function ridge(x: number, y: number, seed: number, time: number) {
  const angle = seedUnit(seed, 4) * Math.PI;
  const axis = x * Math.cos(angle) + y * Math.sin(angle);
  const cross = -x * Math.sin(angle) + y * Math.cos(angle);
  const fold = Math.sin((axis + Math.sin(cross * 2.2 + time * 0.22) * 0.2) * 8.1 - time * 0.31);
  const secondary = Math.sin(axis * 3.7 - cross * 2.4 + time * 0.19) * 0.3;
  return fold * 0.82 + secondary;
}

function archipelago(x: number, y: number, seed: number, time: number) {
  let first = 0;
  let second = 0;
  for (let index = 0; index < 7; index += 1) {
    const angle = seedUnit(seed, index * 2 + 5) * Math.PI * 2 + Math.sin(time * 0.12 + index) * 0.06;
    const distance = 0.16 + seedUnit(seed, index * 2 + 6) * 0.78;
    const island = gaussian(
      x,
      y,
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
      0.055 + seedUnit(seed, index + 31) * 0.16,
    );
    if (island > first) {
      second = first;
      first = island;
    } else if (island > second) {
      second = island;
    }
  }
  const tide = Math.sin(time * 0.27 + seedUnit(seed, 33) * Math.PI * 2) * 0.08;
  return first * 1.55 + second * 0.45 - 0.62 + tide;
}

function fault(x: number, y: number, seed: number, time: number) {
  const angle = seedUnit(seed, 7) * Math.PI * 2;
  const axis = x * Math.cos(angle) + y * Math.sin(angle);
  const cross = -x * Math.sin(angle) + y * Math.cos(angle);
  const seam = axis + Math.sin(cross * 4.3 + time * 0.2) * 0.12;
  const plate = Math.tanh(seam * 8.5) * 0.68;
  const compression = Math.sin(cross * 6.1 - time * 0.24 + Math.sign(seam) * 0.8) * 0.25;
  return plate + compression - Math.abs(seam) * 0.18;
}

function cellular(x: number, y: number, seed: number, time: number) {
  let nearest = Number.POSITIVE_INFINITY;
  let next = Number.POSITIVE_INFINITY;
  for (let index = 0; index < 9; index += 1) {
    const angle = seedUnit(seed, index * 2 + 13) * Math.PI * 2;
    const radius = seedUnit(seed, index * 2 + 14) * 0.95;
    const breath = Math.sin(time * 0.2 + index * 1.7) * 0.035;
    const dx = x - Math.cos(angle) * (radius + breath);
    const dy = y - Math.sin(angle) * (radius + breath);
    const distance = dx * dx + dy * dy;
    if (distance < nearest) {
      next = nearest;
      nearest = distance;
    } else if (distance < next) {
      next = distance;
    }
  }
  const membrane = Math.sqrt(next) - Math.sqrt(nearest);
  return Math.tanh((membrane - 0.14) * 7.2) * -0.76 + (0.34 - Math.sqrt(nearest)) * 0.42;
}

function pleat(x: number, y: number, seed: number, time: number) {
  const angle = seedUnit(seed, 21) * Math.PI;
  const axis = x * Math.cos(angle) + y * Math.sin(angle);
  const cross = -x * Math.sin(angle) + y * Math.cos(angle);
  const warp = Math.sin(cross * 2.7 - time * 0.18) * 0.18;
  const fold = 1 - Math.abs(Math.sin((axis + warp) * 7.4 + time * 0.23)) * 2;
  const drape = Math.cos(cross * 2.2 + time * 0.12) * 0.24;
  return fold * 0.74 + drape;
}

function current(x: number, y: number, seed: number, time: number) {
  const phase = seedUnit(seed, 25) * Math.PI * 2;
  const bend = Math.sin(y * 2.4 + time * 0.24 + phase) * 0.24
    + Math.sin((x + y) * 3.1 - time * 0.16) * 0.08;
  const stream = Math.sin((x * 0.72 + y * 0.5 + bend) * 8.2 - time * 0.48);
  const undertow = Math.sin((x * 0.28 - y * 0.82) * 4.4 + time * 0.27 + phase) * 0.34;
  return stream * 0.72 + undertow;
}

function chorus(x: number, y: number, seed: number, time: number) {
  let sum = 0;
  for (let index = 0; index < 5; index += 1) {
    const angle = seedUnit(seed, index + 40) * Math.PI * 2;
    const radius = 0.16 + seedUnit(seed, index + 51) * 0.58;
    const centerX = Math.cos(angle) * radius;
    const centerY = Math.sin(angle) * radius;
    const distance = Math.hypot(x - centerX, y - centerY);
    sum += Math.sin(distance * (7.2 + index * 0.55) - time * (0.32 + index * 0.025) + index);
  }
  return sum / 3.4;
}

export function sampleTopology(
  morphology: AvatarMorphology,
  x: number,
  y: number,
  seed: number,
  pose: TopologyPose,
) {
  const point = deformPoint(x, y, seed, pose);
  let value = 0;
  if (morphology === "basin") value = basin(point.x, point.y, seed, pose.time);
  else if (morphology === "ridge") value = ridge(point.x, point.y, seed, pose.time);
  else if (morphology === "archipelago") value = archipelago(point.x, point.y, seed, pose.time);
  else if (morphology === "fault") value = fault(point.x, point.y, seed, pose.time);
  else if (morphology === "cellular") value = cellular(point.x, point.y, seed, pose.time);
  else if (morphology === "pleat") value = pleat(point.x, point.y, seed, pose.time);
  else if (morphology === "current") value = current(point.x, point.y, seed, pose.time);
  else value = chorus(point.x, point.y, seed, pose.time);

  const radius = Math.hypot(point.x, point.y);
  const angle = Math.atan2(point.y, point.x);
  const division = Math.sin(point.x * 7.2 + pose.time * 0.5)
    * Math.cos(point.y * 6.4 - pose.time * 0.42) * pose.division * 0.42;
  const pressure = Math.sin(radius * 14.5 - pose.time * 3.1) * pose.pressure * 0.5;
  const focus = gaussian(point.x, point.y, Math.cos(seedUnit(seed, 3) * Math.PI * 2) * 0.34, Math.sin(seedUnit(seed, 3) * Math.PI * 2) * 0.25, 0.25)
    * pose.focus * 0.5;
  const alignment = Math.cos(radius * 8.8 + angle * 0.35) * pose.alignment * 0.38;
  const coherence = Math.cos(radius * 11.2 - pose.time * 0.5) * pose.coherence * 0.22;
  const fracture = Math.tanh((point.x + Math.sin(point.y * 5.2) * 0.08) * 12) * pose.fracture * 0.36;
  const detail = valueNoise(point.x * 3.4 + pose.time * 0.03, point.y * 3.4, seed + 101) * 0.1;

  return normalize(value + division + pressure + focus + alignment + coherence + fracture + detail);
}

export function topologyResolutionForSize(size: number) {
  if (size <= 20) return 40;
  if (size <= 32) return 48;
  if (size <= 64) return 72;
  if (size <= 128) return 112;
  return 144;
}
