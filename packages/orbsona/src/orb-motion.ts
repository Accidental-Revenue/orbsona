import type { AgentState, AvatarIdentity } from "./index.js";
import { ORB_RADIUS_RATIO } from "./orb-backgrounds.js";

interface MotionTargets {
  speed: number;
  scale: number;
  rotationVelocity: number;
  glow: number;
  opacity: number;
}

export interface MotionRuntime extends MotionTargets {
  phase: number;
  rotation: number;
  state: AgentState;
  stateAge: number;
  inputLevel: number;
  outputLevel: number;
  energyLevel: number;
}

export interface MotionFrame {
  phase: number;
  rotation: number;
  scale: number;
  glow: number;
  opacity: number;
  state: AgentState;
  stateAge: number;
  inputLevel: number;
  outputLevel: number;
  energyLevel: number;
}

const stateTargets: Record<AgentState, MotionTargets> = {
  idle: { speed: 0.3, scale: 1, rotationVelocity: 0, glow: 0.12, opacity: 0.8 },
  connecting: { speed: 0.42, scale: 0.965, rotationVelocity: 0.18, glow: 0.3, opacity: 0.88 },
  listening: { speed: 0.46, scale: 0.965, rotationVelocity: 0.03, glow: 0.42, opacity: 0.92 },
  thinking: { speed: 0.58, scale: 0.92, rotationVelocity: -0.24, glow: 0.5, opacity: 0.94 },
  speaking: { speed: 0.52, scale: 1, rotationVelocity: 0.04, glow: 0.68, opacity: 1 },
  working: { speed: 0.68, scale: 0.985, rotationVelocity: 0.48, glow: 0.38, opacity: 0.96 },
  success: { speed: 0.22, scale: 1, rotationVelocity: 0, glow: 0.7, opacity: 1 },
  error: { speed: 0.16, scale: 0.94, rotationVelocity: -0.08, glow: 0.74, opacity: 0.9 },
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.max(minimum, Math.min(maximum, value));
}

function mix(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
}

function approach(current: number, target: number, deltaTime: number, timeConstant: number) {
  const amount = 1 - Math.exp(-deltaTime / timeConstant);
  return mix(current, target, amount);
}

function previewSpeechEnvelope(time: number, seed: number, channel: "input" | "output") {
  const offset = seed * 0.00017 + (channel === "output" ? 1.73 : 0);
  const phrase = 0.5 + 0.5 * Math.sin(time * (channel === "output" ? 1.34 : 1.08) + offset);
  const gate = easeOutCubic(clamp((phrase - 0.13) / 0.52));
  const syllables = 0.5 + 0.5 * Math.sin(time * (channel === "output" ? 11.8 : 9.7) + offset * 3.1);
  const consonants = 0.5 + 0.5 * Math.sin(time * 18.4 - offset * 1.7);
  return clamp(gate * (0.16 + syllables * 0.58 + consonants * 0.16));
}

function successScale(age: number) {
  if (age < 0.25) return mix(1, 0.86, easeInOutCubic(age / 0.25));
  if (age < 0.7) return mix(0.86, 1.065, easeOutCubic((age - 0.25) / 0.45));
  if (age < 1.4) return mix(1.065, 1, easeOutCubic((age - 0.7) / 0.7));
  return 1;
}

export function createMotionRuntime(state: AgentState): MotionRuntime {
  return {
    ...stateTargets[state],
    phase: 0.6,
    rotation: 0,
    state,
    stateAge: 0,
    inputLevel: 0,
    outputLevel: 0,
    energyLevel: 0,
  };
}

export function updateMotion(
  runtime: MotionRuntime,
  state: AgentState,
  deltaTime: number,
  timestamp: number,
  seed: number,
  reduceMotion: boolean,
  inputLevel?: number,
  outputLevel?: number,
  energyLevel?: number,
): MotionFrame {
  if (runtime.state !== state) {
    runtime.state = state;
    runtime.stateAge = 0;
  }

  const delta = reduceMotion ? 0 : clamp(deltaTime, 0, 0.05);
  runtime.stateAge += delta;
  // Input and output remain independent because listening and speaking express
  // different physical behaviors in the shared layered motion grammar.
  const inputTarget = state === "listening"
    ? clamp(inputLevel ?? (reduceMotion ? 0.48 : previewSpeechEnvelope(timestamp, seed, "input")))
    : 0;
  const outputTarget = state === "speaking"
    ? clamp(outputLevel ?? (reduceMotion ? 0.58 : previewSpeechEnvelope(timestamp, seed, "output")))
    : 0;
  const energyTarget = clamp(energyLevel ?? 0);
  runtime.inputLevel = approach(runtime.inputLevel, inputTarget, delta, inputTarget > runtime.inputLevel ? 0.05 : 0.3);
  runtime.outputLevel = approach(runtime.outputLevel, outputTarget, delta, outputTarget > runtime.outputLevel ? 0.04 : 0.15);
  runtime.energyLevel = approach(runtime.energyLevel, energyTarget, delta, energyTarget > runtime.energyLevel ? 0.06 : 0.24);

  const targets = stateTargets[state];
  const irregularity = state === "thinking"
    ? 0.88 + Math.sin(runtime.phase * 0.73) * 0.09 + Math.sin(runtime.phase * 1.91) * 0.04
    : 1;
  const stateSignal = state === "listening"
    ? runtime.inputLevel
    : state === "speaking"
      ? runtime.outputLevel
      : runtime.energyLevel;
  const speedBoost = 1 + stateSignal * (state === "idle" ? 0.55 : 0.9);

  runtime.speed = approach(runtime.speed, targets.speed * irregularity * speedBoost, delta, 0.16);
  runtime.scale = approach(runtime.scale, targets.scale, delta, state === "idle" ? 0.55 : 0.24);
  runtime.rotationVelocity = approach(runtime.rotationVelocity, targets.rotationVelocity, delta, 0.2);
  runtime.glow = approach(runtime.glow, targets.glow, delta, 0.22);
  runtime.opacity = approach(runtime.opacity, targets.opacity, delta, 0.2);
  runtime.phase += delta * runtime.speed;
  runtime.rotation += delta * runtime.rotationVelocity;

  let scale = runtime.scale;
  if (state === "idle") scale *= 1 + Math.sin(runtime.phase * Math.PI * 2 / 1.26) * (0.014 + runtime.energyLevel * 0.016) + runtime.energyLevel * 0.035;
  if (state === "listening") scale *= 0.97 + runtime.inputLevel * 0.12;
  if (state === "thinking") scale *= 1 + Math.sin(runtime.phase * 2.1) * 0.006;
  if (state === "speaking") scale *= 0.98 + runtime.outputLevel * 0.17;
  if (state !== "idle" && state !== "listening" && state !== "speaking") scale *= 1 + runtime.energyLevel * 0.05;
  if (state === "success") scale *= successScale(runtime.stateAge);
  const glow = clamp(runtime.glow + Math.max(stateSignal, runtime.energyLevel) * 0.34);

  if (reduceMotion) {
    const staticLevels: Record<AgentState, { scale: number; rotation: number; glow: number; input: number; output: number }> = {
      idle: { scale: 1, rotation: 0, glow: 0.1, input: 0, output: 0 },
      connecting: { scale: 0.965, rotation: 0.18, glow: 0.3, input: 0, output: 0 },
      listening: { scale: 0.98, rotation: 0, glow: 0.38, input: 0.48, output: 0 },
      thinking: { scale: 0.92, rotation: -0.24, glow: 0.48, input: 0, output: 0 },
      speaking: { scale: 1.045, rotation: 0, glow: 0.62, input: 0, output: 0.58 },
      working: { scale: 0.985, rotation: 0.38, glow: 0.34, input: 0, output: 0 },
      success: { scale: 1.045, rotation: 0, glow: 0.66, input: 0, output: 0 },
      error: { scale: 0.94, rotation: -0.08, glow: 0.7, input: 0, output: 0 },
    };
    const pose = staticLevels[state];
    const staticInput = state === "listening" ? inputTarget : pose.input;
    const staticOutput = state === "speaking" ? outputTarget : pose.output;
    const staticSignal = Math.max(energyTarget, staticInput, staticOutput);
    return {
      phase: 0.6,
      state,
      stateAge: state === "success" ? 0.66 : 0,
      opacity: targets.opacity,
      scale: pose.scale * (1 + staticSignal * 0.05),
      rotation: pose.rotation,
      glow: clamp(pose.glow + staticSignal * 0.28),
      inputLevel: staticInput,
      outputLevel: staticOutput,
      energyLevel: energyTarget,
    };
  }

  return {
    phase: runtime.phase,
    rotation: runtime.rotation,
    scale,
    glow,
    opacity: runtime.opacity,
    state,
    stateAge: runtime.stateAge,
    inputLevel: runtime.inputLevel,
    outputLevel: runtime.outputLevel,
    energyLevel: runtime.energyLevel,
  };
}

export function drawPulseGeometry(context: CanvasRenderingContext2D, size: number, time: number) {
  const center = size / 2;
  context.save();
  for (let ring = 0; ring < 5; ring += 1) {
    const radius = size * (0.105 + ring * 0.061) * (1 + Math.sin(time * 1.3 + ring * 0.9) * 0.018);
    const points = 22 + ring * 10;
    const direction = ring % 2 === 0 ? 1 : -1;
    for (let point = 0; point < points; point += 1) {
      const unit = point / points;
      const angle = unit * Math.PI * 2 + time * direction * (0.24 + ring * 0.018);
      const signal = 0.5 + 0.5 * Math.sin(angle * 2 - time * 2.2 + ring * 0.8);
      const dotRadius = Math.max(0.55, size * (0.0042 + signal * 0.0018));
      context.globalAlpha = 0.34 + signal * 0.58;
      context.fillStyle = "#fff";
      context.beginPath();
      context.arc(center + Math.cos(angle) * radius, center + Math.sin(angle) * radius, dotRadius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 0.9;
  context.beginPath();
  context.arc(center, center, Math.max(0.8, size * 0.008), 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function strokeCircle(
  context: CanvasRenderingContext2D,
  center: number,
  radius: number,
  color: string,
  alpha: number,
  width: number,
) {
  context.globalAlpha = clamp(alpha);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.arc(center, center, radius, 0, Math.PI * 2);
  context.stroke();
}

export function drawStateOverlay(
  context: CanvasRenderingContext2D,
  size: number,
  frame: MotionFrame,
  colors: AvatarIdentity["palette"]["colors"],
) {
  const center = size / 2;
  const radius = size * ORB_RADIUS_RATIO;
  const lineWidth = Math.max(0.8, size * 0.006);
  context.save();
  context.globalCompositeOperation = "lighter";
  context.lineCap = "round";

  if (frame.state === "listening") {
    const level = frame.inputLevel;
    strokeCircle(context, center, radius * (0.73 + level * 0.09), colors[2], 0.16 + level * 0.58, lineWidth * (0.75 + level));
    const wave = (frame.stateAge * 0.72) % 1;
    strokeCircle(context, center, radius * (0.32 + wave * 0.58), colors[0], level * (1 - wave) * 0.46, lineWidth * 0.72);
  }

  if (frame.state === "connecting") {
    context.strokeStyle = colors[2];
    context.lineWidth = lineWidth * 0.9;
    context.globalAlpha = 0.58;
    context.setLineDash([radius * 0.16, radius * 0.12]);
    context.lineDashOffset = -frame.stateAge * radius * 0.72;
    context.beginPath();
    context.arc(center, center, radius * 0.86, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  if (frame.state === "thinking") {
    const core = context.createRadialGradient(center, center, 0, center, center, radius * 0.46);
    core.addColorStop(0, `${colors[2]}80`);
    core.addColorStop(0.34, `${colors[0]}38`);
    core.addColorStop(1, `${colors[0]}00`);
    context.globalAlpha = 0.58;
    context.fillStyle = core;
    context.fillRect(center - radius, center - radius, radius * 2, radius * 2);
    context.strokeStyle = colors[2];
    context.lineWidth = lineWidth * 0.75;
    context.globalAlpha = 0.34;
    context.beginPath();
    context.arc(center, center, radius * 0.42, -frame.stateAge * 1.35, -frame.stateAge * 1.35 + Math.PI * 0.7);
    context.stroke();
    context.globalAlpha = 0.22;
    context.beginPath();
    context.arc(center, center, radius * 0.58, frame.stateAge * 0.92, frame.stateAge * 0.92 + Math.PI * 0.52);
    context.stroke();
  }

  if (frame.state === "speaking") {
    const level = frame.outputLevel;
    context.strokeStyle = colors[2];
    context.lineWidth = lineWidth * (0.8 + level * 1.45);
    context.globalAlpha = 0.18 + level * 0.66;
    context.setLineDash([radius * 0.2, radius * 0.11]);
    context.lineDashOffset = -frame.stateAge * radius * 0.8;
    context.beginPath();
    context.arc(center, center, radius * (0.86 + level * 0.045), 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  if (frame.state === "working") {
    const angle = frame.stateAge * (Math.PI * 2 / 1.8);
    context.strokeStyle = colors[2];
    context.lineWidth = lineWidth;
    context.globalAlpha = 0.72;
    context.beginPath();
    context.arc(center, center, radius * 0.88, angle, angle + Math.PI * 0.52);
    context.stroke();
    context.globalAlpha = 0.2;
    context.beginPath();
    context.arc(center, center, radius * 0.72, -angle * 0.72, -angle * 0.72 + Math.PI * 0.34);
    context.stroke();
  }

  if (frame.state === "success") {
    const bloom = clamp((frame.stateAge - 0.24) / 0.7);
    const fade = 1 - easeOutCubic(bloom);
    strokeCircle(context, center, radius * (0.34 + bloom * 0.62), colors[2], fade * 0.92, lineWidth * (1.5 - bloom * 0.6));
    if (frame.stateAge >= 0.7) {
      strokeCircle(context, center, radius * 0.84, colors[2], 0.16, lineWidth * 0.65);
    }
  }

  if (frame.state === "error") {
    context.strokeStyle = colors[2];
    context.lineWidth = lineWidth * 1.15;
    context.globalAlpha = 0.72;
    context.beginPath();
    context.arc(center, center, radius * 0.82, -0.72, 0.72);
    context.stroke();
    context.beginPath();
    context.arc(center, center, radius * 0.82, Math.PI - 0.72, Math.PI + 0.72);
    context.stroke();
  }

  context.restore();
}
