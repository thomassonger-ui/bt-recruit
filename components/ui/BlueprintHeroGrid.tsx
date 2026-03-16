"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface BlueprintHeroGridProps {
  className?: string;
}

// ── Architectural element definitions ──
// These define repeating blueprint "floor plan" tiles drawn with simple lines.
// All coordinates are relative to a tile origin.

const TILE_W = 448; // tile width  (8 × 56)
const TILE_H = 392; // tile height (7 × 56)

// Wall segments: [x1, y1, x2, y2]
const WALLS: [number, number, number, number][] = [
  // Outer walls of a house footprint
  [28, 28, 420, 28],
  [420, 28, 420, 364],
  [420, 364, 28, 364],
  [28, 364, 28, 28],

  // Internal walls
  [196, 28, 196, 196],   // vertical divider upper-left
  [196, 196, 420, 196],  // horizontal mid
  [28, 224, 196, 224],   // horizontal lower-left area
  [308, 196, 308, 364],  // vertical divider lower-right
  [112, 224, 112, 364],  // vertical divider lower-left
];

// Room rectangles (interior partitions): [x, y, w, h]
const ROOMS: [number, number, number, number][] = [
  [36, 36, 152, 152],    // room top-left
  [204, 36, 208, 152],   // room top-right
  [36, 232, 68, 124],    // small room bottom-left
  [120, 232, 68, 124],   // small room bottom-mid-left
  [204, 204, 96, 152],   // room bottom-mid
  [316, 204, 96, 152],   // room bottom-right
];

// Door arcs: [cx, cy, radius, startAngle, endAngle, counterclockwise]
const DOORS: [number, number, number, number, number, boolean][] = [
  [196, 100, 24, -Math.PI / 2, 0, false],       // door on upper vertical wall
  [260, 196, 24, 0, Math.PI / 2, false],         // door on horizontal mid
  [140, 224, 24, -Math.PI / 2, -Math.PI, true],  // door lower-left area
  [308, 280, 24, Math.PI / 2, Math.PI, false],   // door lower-right divider
  [80, 364, 24, Math.PI, Math.PI * 1.5, false],  // door on bottom wall
];

// Window markers: [x1, y1, x2, y2] — drawn as a line with small perpendicular ticks
const WINDOWS: [number, number, number, number][] = [
  [80, 28, 140, 28],     // top wall window 1
  [280, 28, 360, 28],    // top wall window 2
  [420, 80, 420, 150],   // right wall window upper
  [420, 260, 420, 330],  // right wall window lower
  [28, 100, 28, 160],    // left wall window
  [200, 364, 280, 364],  // bottom wall window
];

// Dimension lines: [x1, y1, x2, y2] — with tick marks at ends and a measurement label position
const DIMENSIONS: [number, number, number, number][] = [
  [28, 12, 420, 12],     // top overall width
  [436, 28, 436, 364],   // right overall height
  [28, 380, 196, 380],   // partial bottom width
  [12, 28, 12, 196],     // partial left height
];

// Measurement tick marks along dimension lines: small perpendicular marks
const TICK_LENGTH = 5;

// Cross-hatch / detail marks for specific rooms (like bathroom tiles or kitchen)
const DETAIL_HATCHES: [number, number, number, number][] = [
  // Small diagonal hatches in bottom-left room (suggesting bathroom)
  [44, 240, 56, 252],
  [56, 240, 68, 252],
  [68, 240, 80, 252],
  [44, 252, 56, 264],
  [56, 252, 68, 264],
  [68, 252, 80, 264],
];

export default function BlueprintHeroGrid({ className = "" }: BlueprintHeroGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const isMobileRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    isMobileRef.current = window.matchMedia("(max-width: 768px)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      isMobileRef.current = window.matchMedia("(max-width: 768px)").matches;
    };

    resize();
    window.addEventListener("resize", resize);

    const parent = canvas.parentElement;
    if (!isMobileRef.current && parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseleave", handleMouseLeave);
    }

    // Lighter tint of muted for visibility on dark hero background
    // Based on muted #6B7280, shifted lighter to contrast against panelDark #3E4A54
    const C = [160, 175, 195];

    // Parallax speed multipliers for 3 layers
    const layerSpeeds = [1.0, 0.7, 0.45];

    let lastTime = 0;
    const baseSpeed = 8; // steady drift speed

    // ── Helper: compute alpha with spotlight ──
    function spotAlpha(
      baseAlpha: number,
      boostAlpha: number,
      px: number,
      py: number,
      mx: number,
      my: number,
      hasSpot: boolean,
      radius: number
    ): number {
      if (!hasSpot) return baseAlpha;
      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = Math.max(0, 1 - dist / radius);
      return baseAlpha + factor * boostAlpha;
    }

    // ── Helper: draw a line segment ──
    function line(
      x1: number, y1: number, x2: number, y2: number,
      alpha: number, width: number
    ) {
      ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // ── Helper: draw an arc ──
    function arc(
      cx: number, cy: number, r: number,
      start: number, end: number, ccw: boolean,
      alpha: number, width: number
    ) {
      ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end, ccw);
      ctx.stroke();
    }

    // ── Helper: draw window marker ──
    function drawWindow(
      x1: number, y1: number, x2: number, y2: number,
      alpha: number
    ) {
      const lw = 0.8;
      // Main line
      line(x1, y1, x2, y2, alpha, lw);

      // Perpendicular ticks at each end
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const nx = -dy / len;
      const ny = dx / len;
      const t = 4;
      line(x1 - nx * t, y1 - ny * t, x1 + nx * t, y1 + ny * t, alpha, lw);
      line(x2 - nx * t, y2 - ny * t, x2 + nx * t, y2 + ny * t, alpha, lw);
      // Middle double-line effect
      const mx = (x1 + x2) / 2;
      const my2 = (y1 + y2) / 2;
      line(mx - nx * 3, my2 - ny * 3, mx + nx * 3, my2 + ny * 3, alpha * 0.7, lw);
    }

    // ── Helper: draw dimension line with ticks ──
    function drawDimension(
      x1: number, y1: number, x2: number, y2: number,
      alpha: number
    ) {
      const lw = 0.5;
      line(x1, y1, x2, y2, alpha, lw);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const nx = -dy / len;
      const ny = dx / len;

      // End ticks
      line(x1 + nx * TICK_LENGTH, y1 + ny * TICK_LENGTH, x1 - nx * TICK_LENGTH, y1 - ny * TICK_LENGTH, alpha, lw);
      line(x2 + nx * TICK_LENGTH, y2 + ny * TICK_LENGTH, x2 - nx * TICK_LENGTH, y2 - ny * TICK_LENGTH, alpha, lw);

      // Intermediate ticks every ~56px
      const steps = Math.round(len / 56);
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const px = x1 + dx * t;
        const py = y1 + dy * t;
        line(px + nx * 3, py + ny * 3, px - nx * 3, py - ny * 3, alpha * 0.6, lw);
      }
    }

    // ── Main draw loop ──
    const draw = (timestamp: number) => {
      const dt = lastTime ? (timestamp - lastTime) / 1000 : 0.016;
      lastTime = timestamp;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      // Advance base offset
      const spd = isMobileRef.current ? baseSpeed * 0.5 : baseSpeed;
      offsetRef.current.x = (offsetRef.current.x + spd * dt * 0.6) % TILE_W;
      offsetRef.current.y = (offsetRef.current.y + spd * dt * 0.4) % TILE_H;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hasSpot = !isMobileRef.current && mx >= 0 && my >= 0;
      const spotRadius = 350;

      // Number of tiles to cover viewport
      const tilesX = Math.ceil(w / TILE_W) + 2;
      const tilesY = Math.ceil(h / TILE_H) + 2;

      // ═══════════════════════════════════════
      // LAYER 1: Base grid (lightest, fastest)
      // ═══════════════════════════════════════
      const l1ox = offsetRef.current.x * layerSpeeds[0];
      const l1oy = offsetRef.current.y * layerSpeeds[0];
      const gridSize = 56;
      const cols = Math.ceil(w / gridSize) + 2;
      const rows = Math.ceil(h / gridSize) + 2;

      for (let i = -1; i <= cols; i++) {
        const x = i * gridSize + (l1ox % gridSize);
        const midAlpha = spotAlpha(0.08, 0.08, x, h / 2, mx, my, hasSpot, spotRadius);
        line(x, 0, x, h, midAlpha, 0.5);
      }
      for (let j = -1; j <= rows; j++) {
        const y = j * gridSize + (l1oy % gridSize);
        const midAlpha = spotAlpha(0.08, 0.08, w / 2, y, mx, my, hasSpot, spotRadius);
        line(0, y, w, y, midAlpha, 0.5);
      }

      // Grid intersection dots
      for (let i = -1; i <= cols; i++) {
        for (let j = -1; j <= rows; j++) {
          const x = i * gridSize + (l1ox % gridSize);
          const y = j * gridSize + (l1oy % gridSize);
          if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue;

          const alpha = spotAlpha(0.10, 0.15, x, y, mx, my, hasSpot, spotRadius);
          const r = hasSpot ? 1 + Math.max(0, 1 - Math.sqrt((x - mx) ** 2 + (y - my) ** 2) / spotRadius) : 1;
          ctx.fillStyle = `rgba(${C[0]},${C[1]},${C[2]},${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════
      // LAYER 2: Room outlines & walls (medium layer)
      // ═══════════════════════════════════════
      const l2ox = offsetRef.current.x * layerSpeeds[1];
      const l2oy = offsetRef.current.y * layerSpeeds[1];

      for (let tx = -1; tx < tilesX; tx++) {
        for (let ty = -1; ty < tilesY; ty++) {
          const baseX = tx * TILE_W + (l2ox % TILE_W);
          const baseY = ty * TILE_H + (l2oy % TILE_H);

          // Skip tiles clearly off-screen
          if (baseX + TILE_W < -50 || baseX > w + 50 || baseY + TILE_H < -50 || baseY > h + 50) continue;

          // Walls
          for (const [x1, y1, x2, y2] of WALLS) {
            const ax = baseX + x1;
            const ay = baseY + y1;
            const bx = baseX + x2;
            const by = baseY + y2;
            const alpha = spotAlpha(0.14, 0.10, (ax + bx) / 2, (ay + by) / 2, mx, my, hasSpot, spotRadius);
            line(ax, ay, bx, by, alpha, 1.8);
          }

          // Room rectangles (lighter internal lines)
          for (const [rx, ry, rw, rh] of ROOMS) {
            const ax = baseX + rx;
            const ay = baseY + ry;
            const alpha = spotAlpha(0.10, 0.08, ax + rw / 2, ay + rh / 2, mx, my, hasSpot, spotRadius);
            ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(ax, ay, rw, rh);
          }

          // Door arcs
          for (const [cx, cy, r, start, end, ccw] of DOORS) {
            const ax = baseX + cx;
            const ay = baseY + cy;
            const alpha = spotAlpha(0.10, 0.10, ax, ay, mx, my, hasSpot, spotRadius);
            arc(ax, ay, r, start, end, ccw, alpha, 0.8);
          }

          // Windows
          for (const [x1, y1, x2, y2] of WINDOWS) {
            const ax = baseX + x1;
            const ay = baseY + y1;
            const bx = baseX + x2;
            const by = baseY + y2;
            const alpha = spotAlpha(0.10, 0.09, (ax + bx) / 2, (ay + by) / 2, mx, my, hasSpot, spotRadius);
            drawWindow(ax, ay, bx, by, alpha);
          }

          // Detail hatches
          for (const [x1, y1, x2, y2] of DETAIL_HATCHES) {
            const ax = baseX + x1;
            const ay = baseY + y1;
            const bx = baseX + x2;
            const by = baseY + y2;
            const alpha = spotAlpha(0.08, 0.07, (ax + bx) / 2, (ay + by) / 2, mx, my, hasSpot, spotRadius);
            line(ax, ay, bx, by, alpha, 0.5);
          }
        }
      }

      // ═══════════════════════════════════════
      // LAYER 3: Dimension lines (slowest parallax)
      // ═══════════════════════════════════════
      const l3ox = offsetRef.current.x * layerSpeeds[2];
      const l3oy = offsetRef.current.y * layerSpeeds[2];

      for (let tx = -1; tx < tilesX; tx++) {
        for (let ty = -1; ty < tilesY; ty++) {
          const baseX = tx * TILE_W + (l3ox % TILE_W);
          const baseY = ty * TILE_H + (l3oy % TILE_H);

          if (baseX + TILE_W < -50 || baseX > w + 50 || baseY + TILE_H < -50 || baseY > h + 50) continue;

          for (const [x1, y1, x2, y2] of DIMENSIONS) {
            const ax = baseX + x1;
            const ay = baseY + y1;
            const bx = baseX + x2;
            const by = baseY + y2;
            const alpha = spotAlpha(0.09, 0.08, (ax + bx) / 2, (ay + by) / 2, mx, my, hasSpot, spotRadius);
            drawDimension(ax, ay, bx, by, alpha);
          }
        }
      }

      // ── Spotlight glow overlay (desktop only) ──
      if (hasSpot) {
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, spotRadius);
        gradient.addColorStop(0, `rgba(${C[0]},${C[1]},${C[2]},0.018)`);
        gradient.addColorStop(0.5, `rgba(${C[0]},${C[1]},${C[2]},0.006)`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
