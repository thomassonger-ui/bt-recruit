"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

/*
  DepthLayer — 5-tier 3D parallax depth system.

  Each depth level maps to a predefined scroll speed, creating
  layered spatial separation as the user scrolls.

  Depth tiers:
    1 (background)   — slowest, moves 0→40px  (grids, textures)
    2 (environment)   — slow,    moves 0→80px  (floating lines, shapes)
    3 (content)       — subtle,  moves 0→30px  (headings, body text)
    4 (interactive)   — medium,  moves 0→60px  (cards, UI elements)
    5 (foreground)    — fast,    moves 0→100px (overlays, accents)

  All movement uses Framer Motion values — zero React state, zero re-renders.
  Hardware-accelerated via `willChange: transform`.
*/

type DepthTier = 1 | 2 | 3 | 4 | 5;

interface DepthLayerProps {
  children: React.ReactNode;
  /** Depth tier (1–5). Lower = further back, slower. Higher = closer, faster. */
  depth: DepthTier;
  /** Override the default translateY range in pixels */
  range?: [number, number];
  /** Additional className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
  /** Scroll tracking mode */
  mode?: "viewport" | "page" | "container";
  /** Container ref for "container" mode */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Add a subtle scale transform for extra depth perception */
  scale?: boolean;
  /** Add opacity fade based on scroll position */
  fade?: boolean;
  /** Disable parallax on mobile (<768px) — motion values still created but range zeroed */
  disableOnMobile?: boolean;
}

// Default translateY ranges per depth tier [start, end] in px
const DEPTH_RANGES: Record<DepthTier, [number, number]> = {
  1: [0, 40],    // background — very slow
  2: [0, 80],    // environment — slow drift
  3: [0, 30],    // content — subtle
  4: [0, 60],    // interactive — medium
  5: [0, 100],   // foreground — noticeable
};

// Scale ranges per tier (when scale=true)
const SCALE_RANGES: Record<DepthTier, [number, number]> = {
  1: [1, 1.01],
  2: [1, 1.015],
  3: [1, 1],      // no scale on content
  4: [0.98, 1],
  5: [0.96, 1],
};

// Opacity ranges per tier (when fade=true)
const FADE_RANGES: Record<DepthTier, [number, number]> = {
  1: [0.6, 1],
  2: [0.5, 1],
  3: [0.8, 1],
  4: [0.7, 1],
  5: [0.6, 1],
};

export default function DepthLayer({
  children,
  depth,
  range,
  className = "",
  style,
  mode = "viewport",
  containerRef,
  scale = false,
  fade = false,
  disableOnMobile = true,
}: DepthLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Determine scroll source — avoid readonly offset arrays by using mutable vars
  const containerOffset: ["start start", "end start"] = ["start start", "end start"];
  const viewportOffset: ["start end", "end start"] = ["start end", "end start"];

  const scrollConfig =
    mode === "container" && containerRef
      ? { target: containerRef, offset: containerOffset }
      : mode === "page"
        ? undefined
        : { target: ref, offset: viewportOffset };

  const { scrollYProgress } = useScroll(scrollConfig);

  // Resolve ranges
  const [yStart, yEnd] = range ?? DEPTH_RANGES[depth];
  const [scaleStart, scaleEnd] = SCALE_RANGES[depth];
  const [opacityStart, opacityEnd] = FADE_RANGES[depth];

  // Create motion values
  const y = useTransform(scrollYProgress, [0, 1], [yStart, -yEnd]);
  const scaleVal = useTransform(scrollYProgress, [0, 0.5, 1], [scaleStart, scaleEnd, scaleStart]);
  const opacityVal = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [opacityStart, opacityEnd, opacityEnd, opacityStart]);

  // Build style object — only include transforms that are enabled
  // position: relative is required by Framer Motion's scroll offset calculation
  const motionStyle: Record<string, MotionValue | string> = {
    y,
    willChange: "transform",
    position: "relative",
  };

  if (scale) {
    motionStyle.scale = scaleVal;
  }

  return (
    <motion.div
      ref={ref}
      style={{
        ...motionStyle,
        ...(fade ? { opacity: opacityVal as unknown as number } : {}),
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/*
  Convenience exports for common depth patterns.
  These are pre-configured DepthLayer wrappers.
*/

export function BackgroundDepth({
  children,
  className = "",
  ...props
}: Omit<DepthLayerProps, "depth"> & { depth?: never }) {
  return (
    <DepthLayer depth={1} fade className={className} {...props}>
      {children}
    </DepthLayer>
  );
}

export function EnvironmentDepth({
  children,
  className = "",
  ...props
}: Omit<DepthLayerProps, "depth"> & { depth?: never }) {
  return (
    <DepthLayer depth={2} fade className={className} {...props}>
      {children}
    </DepthLayer>
  );
}

export function ContentDepth({
  children,
  className = "",
  ...props
}: Omit<DepthLayerProps, "depth"> & { depth?: never }) {
  return (
    <DepthLayer depth={3} className={className} {...props}>
      {children}
    </DepthLayer>
  );
}

export function InteractiveDepth({
  children,
  className = "",
  ...props
}: Omit<DepthLayerProps, "depth"> & { depth?: never }) {
  return (
    <DepthLayer depth={4} scale className={className} {...props}>
      {children}
    </DepthLayer>
  );
}

export function ForegroundDepth({
  children,
  className = "",
  ...props
}: Omit<DepthLayerProps, "depth"> & { depth?: never }) {
  return (
    <DepthLayer depth={5} scale fade className={className} {...props}>
      {children}
    </DepthLayer>
  );
}
