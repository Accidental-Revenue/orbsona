import {
  resolvePreset,
  type ModeKey,
  type OrbSize,
  type OrbState,
} from "thinking-orbs";
import type { AvatarAnimation } from "./index.js";

type BuiltInAnimation = Exclude<AvatarAnimation, "pulse">;

const animationPreset: Record<BuiltInAnimation, OrbState> = {
  field: "composing",
  orbit: "working",
  globe: "searching",
  wave: "listening",
  solve: "solving",
};

export const COMPACT_AVATAR_BREAKPOINT = 40;

export interface AnimationPresetConfig {
  mode: ModeKey | "pulse";
  speed: number;
  opts: Record<string, number | undefined>;
  presetSize: OrbSize;
}

export function presetSizeForAvatar(size: number): OrbSize {
  return size < COMPACT_AVATAR_BREAKPOINT ? 20 : 64;
}

export function resolveAnimationPreset(
  animation: AvatarAnimation,
  size: number,
): AnimationPresetConfig {
  const presetSize = presetSizeForAvatar(size);
  if (animation === "pulse") {
    return {
      mode: "pulse" as const,
      speed: 1,
      opts: {},
      presetSize,
    };
  }

  const preset = resolvePreset(animationPreset[animation], presetSize);
  return {
    mode: preset.mode as ModeKey,
    speed: preset.speed,
    opts: preset.opts,
    presetSize,
  };
}
