"use client";

import React, { useEffect, useRef } from "react";

/*
  Floating architectural shapes — thin rectangles, L-brackets,
  and abstract grid fragments that drift slowly across the hero.

  Rendered via a single lightweight canvas to avoid DOM bloat.
  All shapes float independently using sine/cosine time functions.
  No React state is used — everything runs in a rAF loop.
*/

interface FloatingShapesProps {
  className?: string;
}

interface Shape {
  type: "rect" | "lbracket" | "cross" | "dash";
  x: number; // 0–1 normalized
  y: number; // 0–1 normalized
  width: number; // pixels
  height: number; // pixels
  rotation: number; // degrees
  opacity: number; // 0–1
  driftSpeedX: number; // pixels per second
  driftSpeedY: number; // pixels per second
  floatAmplitudeX: number; // pixels
  floatAmplitudeY: number; // pixels
  floatFreqX: number; // radians per second
  floatFreqY: number; // radians per second
  phaseOffset: number; // radians
}

// Predefined shapes — positioned around edges and corners to avoid center content
const shapes: Shape[] = [
  // Thin horizontal dashes — top area
  { type: "dash", x: 0.06, y: 0.12, width: 60, height: 1, rotation: 0, opacity: 0.06, driftSpeedX: 3, driftSpeedY: 0.5, floatAmplitudeX: 8, floatAmplitudeY: 4, floatFreqX: 0.15, floatFreqY: 0.1, phaseOffset: 0 },
  { type: "dash", x: 0.85, y: 0.08, width: 45, height: 1, rotation: 0, opacity: 0.05, driftSpeedX: -2, driftSpeedY: 0.8, floatAmplitudeX: 6, floatAmplitudeY: 5, floatFreqX: 0.12, floatFreqY: 0.08, phaseOffset: 1.2 },

  // Small rectangles — corner regions
  { type: "rect", x: 0.04, y: 0.35, width: 24, height: 16, rotation: 0, opacity: 0.04, driftSpeedX: 1, driftSpeedY: -1.5, floatAmplitudeX: 5, floatAmplitudeY: 8, floatFreqX: 0.08, floatFreqY: 0.12, phaseOffset: 2.1 },
  { type: "rect", x: 0.92, y: 0.55, width: 20, height: 12, rotation: 15, opacity: 0.04, driftSpeedX: -1.5, driftSpeedY: 1, floatAmplitudeX: 7, floatAmplitudeY: 6, floatFreqX: 0.1, floatFreqY: 0.07, phaseOffset: 3.4 },
  { type: "rect", x: 0.08, y: 0.78, width: 18, height: 28, rotation: -5, opacity: 0.035, driftSpeedX: 2, driftSpeedY: -0.5, floatAmplitudeX: 4, floatAmplitudeY: 7, floatFreqX: 0.09, floatFreqY: 0.14, phaseOffset: 0.7 },

  // L-bracket shapes — architectural drafting reference
  { type: "lbracket", x: 0.15, y: 0.06, width: 20, height: 20, rotation: 0, opacity: 0.055, driftSpeedX: 0.5, driftSpeedY: 1, floatAmplitudeX: 3, floatAmplitudeY: 5, floatFreqX: 0.06, floatFreqY: 0.1, phaseOffset: 4.2 },
  { type: "lbracket", x: 0.88, y: 0.75, width: 16, height: 16, rotation: 180, opacity: 0.045, driftSpeedX: -1, driftSpeedY: -1.2, floatAmplitudeX: 5, floatAmplitudeY: 4, floatFreqX: 0.11, floatFreqY: 0.08, phaseOffset: 1.8 },

  // Cross marks — small + shapes
  { type: "cross", x: 0.78, y: 0.2, width: 10, height: 10, rotation: 0, opacity: 0.05, driftSpeedX: -0.8, driftSpeedY: 0.6, floatAmplitudeX: 4, floatAmplitudeY: 3, floatFreqX: 0.13, floatFreqY: 0.09, phaseOffset: 5.1 },
  { type: "cross", x: 0.2, y: 0.88, width: 8, height: 8, rotation: 45, opacity: 0.04, driftSpeedX: 1.2, driftSpeedY: -0.3, floatAmplitudeX: 3, floatAmplitudeY: 6, floatFreqX: 0.07, floatFreqY: 0.15, phaseOffset: 2.9 },

  // Additional dashes — scattered
  { type: "dash", x: 0.03, y: 0.55, width: 40, height: 1, rotation: 90, opacity: 0.045, driftSpeedX: 0.3, driftSpeedY: -2, floatAmplitudeX: 2, floatAmplitudeY: 10, floatFreqX: 0.05, floatFreqY: 0.11, phaseOffset: 3.7 },
  { type: "dash", x: 0.95, y: 0.4, width: 35, height: 1, rotation: 90, opacity: 0.04, driftSpeedX: -0.5, driftSpeedY: 1.5, floatAmplitudeX: 3, floatAmplitudeY: 7, floatFreqX: 0.09, floatFreqY: 0.06, phaseOffset: 0.3 },
];

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  x: number,
  y: number,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((shape.rotation * Math.PI) / 180);
  ctx.globalAlpha = alpha;

  // Use muted color from design system
  ctx.strokeStyle = "#6B7280";
  ctx.fillStyle = "#6B7280";
  ctx.lineWidth = 0.5;

  switch (shape.type) {
    case "dash":
      ctx.beginPath();
      ctx.moveTo(-shape.width / 2, 0);
      ctx.lineTo(shape.width / 2, 0);
      ctx.stroke();
      break;

    case "rect":
      ctx.strokeRect(
        -shape.width / 2,
        -shape.height / 2,
        shape.width,
        shape.height
      );
      break;

    case "lbracket": {
      const w = shape.width;
      const h = shape.height;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      break;
    }

    case "cross": {
      const s = shape.width / 2;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, 0);
      ctx.moveTo(0, -s);
      ctx.lineTo(0, s);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

export default function FloatingShapes({ className = "" }: FloatingShapesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isMobileRef.current = window.matchMedia("(max-width: 768px)").matches;

    // Don't render floating shapes on mobile
    if (isMobileRef.current) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Use parent dimensions as the canvas itself may not have layout yet
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // skip if no layout
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Initial resize with a frame delay to ensure layout is computed
    requestAnimationFrame(resize);
    window.addEventListener("resize", resize);

    // Also observe parent for size changes
    const parent = canvas.parentElement;
    let ro: ResizeObserver | null = null;
    if (parent && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(parent);
    }

    let startTime = performance.now();

    const draw = (timestamp: number) => {
      const t = (timestamp - startTime) / 1000; // seconds elapsed
      const parentEl = canvas.parentElement;
      const rect = parentEl ? parentEl.getBoundingClientRect() : canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) {
        frameRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      for (const shape of shapes) {
        // Base position (normalized to pixels)
        const baseX = shape.x * w;
        const baseY = shape.y * h;

        // Slow constant drift (wraps around)
        const driftX = (shape.driftSpeedX * t) % w;
        const driftY = (shape.driftSpeedY * t) % h;

        // Floating sine/cosine motion
        const floatX =
          Math.sin(t * shape.floatFreqX + shape.phaseOffset) *
          shape.floatAmplitudeX;
        const floatY =
          Math.cos(t * shape.floatFreqY + shape.phaseOffset * 0.7) *
          shape.floatAmplitudeY;

        const finalX = baseX + driftX + floatX;
        const finalY = baseY + driftY + floatY;

        // Gentle opacity pulsing
        const opacityPulse =
          0.7 + 0.3 * Math.sin(t * 0.3 + shape.phaseOffset);
        const alpha = shape.opacity * opacityPulse;

        drawShape(ctx, shape, finalX, finalY, alpha);
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
