"use client";

import { useEffect, useRef } from "react";

const POINT_COUNT = 84;
const FRAME_INTERVAL = 1_000 / 12;

function fract(value: number) {
  return value - Math.floor(value);
}

const points = Array.from({ length: POINT_COUNT }, (_, index) => ({
  x: fract((index + 1) * 0.754877666),
  y: fract((index + 1) * 0.569840296 + index * index * 0.0031),
  weight: 0.34 + fract((index + 3) * 0.438579) * 0.66,
}));

export function AmbientSignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let lastFrame = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const draw = (timestamp: number) => {
      if (!reducedMotion.matches && timestamp - lastFrame < FRAME_INTERVAL) {
        if (visible) frame = requestAnimationFrame(draw);
        return;
      }
      lastFrame = timestamp;
      const time = reducedMotion.matches ? 2.4 : timestamp / 1000;
      const signalX = width * (0.5 + Math.sin(time * 0.071) * 0.24);
      const signalY = height * (0.48 + Math.cos(time * 0.053) * 0.22);
      const reach = Math.max(width, height) * 0.27;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      for (const point of points) {
        const x = point.x * width;
        const y = point.y * height;
        const distance = Math.hypot(x - signalX, y - signalY);
        const response = Math.exp(-(distance * distance) / (reach * reach));
        const radius = 0.42 + point.weight * 0.45 + response * 0.55;
        context.fillStyle = `rgba(122, 190, 255, ${0.025 + point.weight * 0.035 + response * 0.17})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      const haze = context.createRadialGradient(signalX, signalY, 0, signalX, signalY, reach * 1.25);
      haze.addColorStop(0, "rgba(72, 145, 225, 0.035)");
      haze.addColorStop(1, "rgba(72, 145, 225, 0)");
      context.fillStyle = haze;
      context.fillRect(signalX - reach * 1.25, signalY - reach * 1.25, reach * 2.5, reach * 2.5);

      if (!reducedMotion.matches && visible) frame = requestAnimationFrame(draw);
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
    const onMotionChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    resize();
    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    reducedMotion.addEventListener("change", onMotionChange);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] block h-full w-full"
      aria-hidden="true"
    />
  );
}
