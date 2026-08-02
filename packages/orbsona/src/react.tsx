"use client";

import { MODE_DRAWS } from "thinking-orbs";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AgentState, AvatarIdentity } from "./index.js";
import { drawNatureAnimation } from "./nature-animations.js";
import { ORB_RADIUS_RATIO, paintOrbBackground, paintOrbEdge } from "./orb-backgrounds.js";
import {
  createMotionRuntime,
  drawPulseGeometry,
  drawStateOverlay,
  updateMotion,
} from "./orb-motion.js";
import { resolveAnimationPreset } from "./orb-presets.js";

export interface AgentAvatarProps {
  identity: AvatarIdentity;
  state: AgentState;
  className?: string;
  size?: number | string;
  style?: CSSProperties;
  energy?: number;
  inputLevel?: number;
  outputLevel?: number;
}

function tintParticles(
  context: CanvasRenderingContext2D,
  size: number,
  colors: AvatarIdentity["palette"]["colors"],
) {
  context.save();
  context.globalCompositeOperation = "source-in";
  const tint = context.createLinearGradient(size * 0.2, size * 0.12, size * 0.82, size * 0.88);
  tint.addColorStop(0, colors[2]);
  tint.addColorStop(0.46, colors[0]);
  tint.addColorStop(1, colors[2]);
  context.fillStyle = tint;
  context.fillRect(0, 0, size, size);
  context.restore();
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function AgentAvatar({
  identity,
  state,
  className,
  size,
  style,
  energy,
  inputLevel,
  outputLevel,
}: AgentAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionRuntimeRef = useRef(createMotionRuntime(state));
  const inputLevelRef = useRef(inputLevel ?? energy);
  const outputLevelRef = useRef(outputLevel ?? energy);
  const energyRef = useRef(energy);
  const redrawRef = useRef<(() => void) | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const {
    animation,
    background,
    grain,
    name,
    palette,
    rotateBackground,
    seed,
  } = identity;
  const [primaryColor, baseColor, highlightColor] = palette.colors;
  const stableIdentity = useMemo<AvatarIdentity>(() => ({
    animation,
    background,
    grain,
    name,
    palette: {
      id: palette.id,
      name: palette.name,
      colors: [primaryColor, baseColor, highlightColor],
    },
    rotateBackground,
    seed,
  }), [
    animation,
    background,
    baseColor,
    grain,
    highlightColor,
    name,
    palette.id,
    palette.name,
    primaryColor,
    rotateBackground,
    seed,
  ]);

  useEffect(() => {
    inputLevelRef.current = inputLevel ?? energy;
    outputLevelRef.current = outputLevel ?? energy;
    energyRef.current = energy;
    if (reduceMotion) requestAnimationFrame(() => redrawRef.current?.());
  }, [energy, inputLevel, outputLevel, reduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    const backgroundCanvas = document.createElement("canvas");
    const backgroundContext = backgroundCanvas.getContext("2d", { alpha: true });
    const particleCanvas = document.createElement("canvas");
    const particleContext = particleCanvas.getContext("2d", { alpha: true });
    if (!context || !backgroundContext || !particleContext) return;

    let frame = 0;
    let visible = true;
    let cssSize = 1;
    let dpr = 1;
    let lastTimestamp = 0;
    let renderConfig = resolveAnimationPreset(stableIdentity.animation, 64);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      cssSize = Math.max(1, Math.min(bounds.width, bounds.height));
      renderConfig = resolveAnimationPreset(stableIdentity.animation, cssSize);
      delete canvas.dataset.avatarReady;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixels = Math.max(1, Math.round(cssSize * dpr));
      canvas.width = pixels;
      canvas.height = pixels;
      backgroundCanvas.width = pixels;
      backgroundCanvas.height = pixels;
      particleCanvas.width = pixels;
      particleCanvas.height = pixels;
      paintOrbBackground(backgroundContext, cssSize, dpr, stableIdentity);
    };

    const draw = (timestamp: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, cssSize, cssSize);
      const backgroundRotation = stableIdentity.rotateBackground && !reduceMotion
        ? timestamp * 0.000052 + stableIdentity.seed * 0.00019
        : stableIdentity.seed * 0.00019;
      const backgroundScale = stableIdentity.rotateBackground ? 1.055 : 1.01;
      context.save();
      context.beginPath();
      context.arc(cssSize / 2, cssSize / 2, cssSize * ORB_RADIUS_RATIO, 0, Math.PI * 2);
      context.clip();
      context.translate(cssSize / 2, cssSize / 2);
      context.rotate(backgroundRotation);
      context.scale(backgroundScale, backgroundScale);
      context.translate(-cssSize / 2, -cssSize / 2);
      context.drawImage(backgroundCanvas, 0, 0, cssSize, cssSize);
      context.restore();

      particleContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      particleContext.clearRect(0, 0, cssSize, cssSize);
      particleContext.globalCompositeOperation = "source-over";
      particleContext.globalAlpha = 1;

      const deltaTime = lastTimestamp === 0 ? 1 / 60 : (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const motion = updateMotion(
        motionRuntimeRef.current,
        state,
        deltaTime,
        timestamp / 1000,
        stableIdentity.seed,
        reduceMotion,
        inputLevelRef.current,
        outputLevelRef.current,
        energyRef.current,
      );

      particleContext.save();
      particleContext.translate(cssSize / 2, cssSize / 2);
      particleContext.rotate(motion.rotation);
      particleContext.scale(1.11 * motion.scale, 1.11 * motion.scale);
      particleContext.translate(-cssSize / 2, -cssSize / 2);
      const time = motion.phase * renderConfig.speed;
      if (renderConfig.mode === "pulse") {
        drawPulseGeometry(particleContext, cssSize, time);
      } else if (renderConfig.mode === "phyllotaxis" || renderConfig.mode === "radiolaria") {
        drawNatureAnimation(particleContext, cssSize, time, renderConfig.mode, stableIdentity.seed);
      } else {
        MODE_DRAWS[renderConfig.mode](particleContext, cssSize, time, true, renderConfig.opts);
      }
      particleContext.restore();
      tintParticles(particleContext, cssSize, stableIdentity.palette.colors);

      context.save();
      context.globalAlpha = Math.min(1, motion.opacity + motion.energyLevel * 0.12);
      context.shadowColor = stableIdentity.palette.colors[0];
      context.shadowBlur = cssSize * (0.008 + motion.glow * 0.032);
      context.drawImage(particleCanvas, 0, 0, cssSize, cssSize);
      context.restore();

      if (motion.energyLevel > 0.01) {
        context.save();
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = motion.energyLevel * 0.42;
        context.shadowColor = stableIdentity.palette.colors[2];
        context.shadowBlur = cssSize * (0.018 + motion.energyLevel * 0.038);
        context.drawImage(particleCanvas, 0, 0, cssSize, cssSize);
        context.restore();
      }
      drawStateOverlay(context, cssSize, motion, stableIdentity.palette.colors);
      paintOrbEdge(context, cssSize);

      context.save();
      context.globalCompositeOperation = "destination-in";
      context.beginPath();
      context.arc(cssSize / 2, cssSize / 2, cssSize * ORB_RADIUS_RATIO, 0, Math.PI * 2);
      context.fillStyle = "#fff";
      context.fill();
      context.restore();
      canvas.dataset.avatarReady = "true";
      canvas.dataset.avatarPresetSize = String(renderConfig.presetSize);
      canvas.dataset.avatarAnimation = stableIdentity.animation;

      if (!reduceMotion && visible && document.visibilityState === "visible") {
        frame = requestAnimationFrame(draw);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(draw);
    });
    const onVisibilityChange = () => {
      cancelAnimationFrame(frame);
      if (document.visibilityState === "visible" && visible) frame = requestAnimationFrame(draw);
    };

    resize();
    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    redrawRef.current = () => draw(performance.now());
    frame = requestAnimationFrame(draw);

    return () => {
      redrawRef.current = null;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reduceMotion, stableIdentity, state]);

  return (
    <div
      className={className}
      style={{ ...style, width: size ?? style?.width, height: size ?? style?.height }}
      data-avatar-canvas
      role="img"
      aria-label={`${identity.name} avatar, ${state} state`}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} aria-hidden="true" />
    </div>
  );
}
