"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxLayerProps {
  children: React.ReactNode;
  /** Parallax speed: 0 = no movement, positive = moves slower than scroll (pushes down), negative = moves opposite */
  speed?: number;
  /** Depth shorthand: 0.1 = slow, 0.3 = medium, 0.6 = fast. Converted to speed internally. */
  depth?: number;
  /** Additional className */
  className?: string;
  /** Style overrides */
  style?: React.CSSProperties;
  /** Use the entire page scroll instead of element-in-viewport */
  usePageScroll?: boolean;
}

/**
 * Reusable parallax wrapper.
 *
 * Wraps children in a motion.div that translates vertically based on scroll.
 * Uses `useTransform` from Framer Motion — no React state, no re-renders.
 *
 * speed values:
 *   0.0 → no parallax (static)
 *   0.05–0.15 → very subtle drift (text, headings)
 *   0.2–0.4 → medium parallax (cards, images)
 *   0.5+ → strong parallax (background elements)
 *
 * depth values (alternative to speed):
 *   0.1 → slow movement
 *   0.3 → medium movement
 *   0.6 → faster movement
 *
 * Negative speed makes elements move in the opposite direction.
 */
export default function ParallaxLayer({
  children,
  speed,
  depth,
  className = "",
  style,
  usePageScroll = false,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  // depth is a convenience alias: depth 0.3 maps to speed 0.3
  const resolvedSpeed = speed ?? depth ?? 0.1;

  const { scrollYProgress } = useScroll(
    usePageScroll
      ? undefined
      : {
          target: ref,
          offset: ["start end", "end start"],
        }
  );

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [resolvedSpeed * 100, resolvedSpeed * -100]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, willChange: "transform", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
