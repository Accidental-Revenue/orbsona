"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type DottedGlowBackgroundProps = {
  className?: string;
  gap?: number;
  radius?: number;
  color?: string;
  darkColor?: string;
  glowColor?: string;
  darkGlowColor?: string;
  colorLightVar?: string;
  colorDarkVar?: string;
  glowColorLightVar?: string;
  glowColorDarkVar?: string;
  opacity?: number;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
};

const MAX_GLOW_DOTS = 56;

function positionHash(column: number, row: number) {
  let hash = Math.imul(column + 17, 0x1f123bb5) ^ Math.imul(row + 29, 0x5f356495);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  return (hash ^ (hash >>> 16)) >>> 0;
}

function cssVariable(element: Element, variableName?: string) {
  if (!variableName) return null;
  const normalized = variableName.startsWith("--") ? variableName : `--${variableName}`;
  return getComputedStyle(element).getPropertyValue(normalized).trim()
    || getComputedStyle(document.documentElement).getPropertyValue(normalized).trim()
    || null;
}

function isDarkMode() {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function DottedGlowBackground({
  className,
  gap = 12,
  radius = 2,
  color = "rgba(0,0,0,0.7)",
  darkColor,
  glowColor = "rgba(0,170,255,0.85)",
  darkGlowColor,
  colorLightVar,
  colorDarkVar,
  glowColorLightVar,
  glowColorDarkVar,
  opacity = 0.6,
  backgroundOpacity = 0,
  speedMin = 0.4,
  speedMax = 1.3,
  speedScale = 1,
}: DottedGlowBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement>(null);
  const [resolvedColor, setResolvedColor] = useState(color);
  const [resolvedGlowColor, setResolvedGlowColor] = useState(glowColor);
  const averageSpeed = ((speedMin + speedMax) / 2) * Math.max(speedScale, 0.05);
  const glowDuration = `${Math.max(7, (Math.PI * 2) / averageSpeed)}s`;

  useEffect(() => {
    const compute = () => {
      const container = containerRef.current ?? document.documentElement;
      const dark = isDarkMode();
      setResolvedColor(
        (dark ? cssVariable(container, colorDarkVar) || darkColor : cssVariable(container, colorLightVar))
          || color,
      );
      setResolvedGlowColor(
        (dark ? cssVariable(container, glowColorDarkVar) || darkGlowColor : cssVariable(container, glowColorLightVar))
          || glowColor,
      );
    };
    compute();
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const mutationObserver = new MutationObserver(compute);
    colorScheme.addEventListener("change", compute);
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    return () => {
      colorScheme.removeEventListener("change", compute);
      mutationObserver.disconnect();
    };
  }, [color, colorDarkVar, colorLightVar, darkColor, darkGlowColor, glowColor, glowColorDarkVar, glowColorLightVar]);

  useEffect(() => {
    const container = containerRef.current;
    const baseCanvas = baseCanvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    const baseContext = baseCanvas?.getContext("2d");
    const glowContext = glowCanvas?.getContext("2d");
    if (!container || !baseCanvas || !glowCanvas || !baseContext || !glowContext) return;

    const dpr = Math.min(Math.max(1, window.devicePixelRatio || 1), 2);
    const rebuild = () => {
      const bounds = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      for (const canvas of [baseCanvas, glowCanvas]) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      baseContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      glowContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseContext.clearRect(0, 0, width, height);
      glowContext.clearRect(0, 0, width, height);

      const columns = Math.ceil(width / gap) + 2;
      const rows = Math.ceil(height / gap) + 2;
      const total = (columns + 1) * (rows + 1);
      const glowCount = Math.min(MAX_GLOW_DOTS, Math.max(24, Math.round(Math.sqrt(total) * 0.7)));
      const path = new Path2D();
      const glowCandidates: Array<{ x: number; y: number; hash: number }> = [];

      for (let column = -1; column < columns; column += 1) {
        for (let row = -1; row < rows; row += 1) {
          const x = column * gap + (row % 2 === 0 ? 0 : gap * 0.5);
          const y = row * gap;
          path.moveTo(x + radius, y);
          path.arc(x, y, radius, 0, Math.PI * 2);
          glowCandidates.push({ x, y, hash: positionHash(column, row) });
        }
      }

      glowCandidates.sort((a, b) => a.hash - b.hash);
      const selectedGlows: typeof glowCandidates = [];
      const minimumDistanceSquared = (gap * 3.25) ** 2;
      for (const candidate of glowCandidates) {
        const hasSpace = selectedGlows.every(({ x, y }) => (
          (x - candidate.x) ** 2 + (y - candidate.y) ** 2 >= minimumDistanceSquared
        ));
        if (hasSpace) selectedGlows.push(candidate);
        if (selectedGlows.length === glowCount) break;
      }

      for (const { x, y } of selectedGlows) {
        const glowRadius = Math.max(8, radius * 9);
        const gradient = glowContext.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, resolvedGlowColor);
        gradient.addColorStop(0.14, resolvedGlowColor);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        glowContext.fillStyle = gradient;
        glowContext.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
      }

      baseContext.globalAlpha = opacity * 0.54;
      baseContext.fillStyle = resolvedColor;
      baseContext.fill(path);
      baseContext.globalAlpha = 1;
      if (backgroundOpacity > 0) {
        const fade = baseContext.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.7);
        fade.addColorStop(0, "rgba(0,0,0,0)");
        fade.addColorStop(1, `rgba(0,0,0,${Math.min(Math.max(backgroundOpacity, 0), 1)})`);
        baseContext.fillStyle = fade;
        baseContext.fillRect(0, 0, width, height);
      }
    };

    const resizeObserver = new ResizeObserver(rebuild);
    rebuild();
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [backgroundOpacity, gap, opacity, radius, resolvedColor, resolvedGlowColor]);

  return (
    <div ref={containerRef} className={className} style={{ position: "absolute", inset: 0 }}>
      <canvas ref={baseCanvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      <canvas
        ref={glowCanvasRef}
        aria-hidden="true"
        className="dotted-glow-layer absolute inset-0 block h-full w-full"
        style={{ "--dot-duration": glowDuration, "--dot-opacity": opacity * 0.62 } as CSSProperties}
      />
    </div>
  );
}
