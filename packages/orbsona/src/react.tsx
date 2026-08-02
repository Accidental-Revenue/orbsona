"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { AgentState, AvatarIdentity } from "./index.js";
import { createMotionRuntime, updateMotion } from "./orb-motion.js";
import { createTopologyPose } from "./topology.js";
import {
  createTopologySurface,
  drawTopologySurface,
  paintTopologySurface,
} from "./topology-renderer.js";

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
  const { material, morphology, name, palette, seed } = identity;
  const [primaryColor, baseColor, highlightColor] = palette.colors;
  const stableIdentity = useMemo<AvatarIdentity>(() => ({
    material,
    morphology,
    name,
    palette: {
      id: palette.id,
      name: palette.name,
      colors: [primaryColor, baseColor, highlightColor],
    },
    seed,
  }), [
    baseColor,
    highlightColor,
    material,
    morphology,
    name,
    palette.id,
    palette.name,
    primaryColor,
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
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const surface = createTopologySurface();
    let frame = 0;
    let visible = true;
    let cssSize = 1;
    let dpr = 1;
    let lastTimestamp = 0;
    const frameInterval = 1_000 / (state === "idle" ? 24 : 30);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      cssSize = Math.max(1, Math.min(bounds.width, bounds.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixels = Math.max(1, Math.round(cssSize * dpr));
      if (canvas.width !== pixels || canvas.height !== pixels) {
        canvas.width = pixels;
        canvas.height = pixels;
      }
      delete canvas.dataset.avatarReady;
    };

    const draw = (timestamp: number) => {
      if (!reduceMotion && lastTimestamp > 0 && timestamp - lastTimestamp < frameInterval) {
        if (visible && document.visibilityState === "visible") frame = requestAnimationFrame(draw);
        return;
      }

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
      const pose = createTopologyPose(
        state,
        motion.phase,
        motion.stateAge,
        motion.inputLevel,
        motion.outputLevel,
        motion.energyLevel,
        reduceMotion,
      );

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, cssSize, cssSize);
      const resolution = paintTopologySurface(surface, stableIdentity, pose, cssSize);
      drawTopologySurface(context, surface, cssSize, pose, stableIdentity.palette);
      canvas.dataset.avatarReady = "true";
      canvas.dataset.avatarTopologyResolution = String(resolution);

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
