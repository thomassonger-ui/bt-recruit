"use client";

import React, { useEffect, useRef } from "react";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion";

interface BlueprintLineLayerProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/*
  Architectural drafting lines that drift slowly and respond to scroll.
  These sit between the grid (Layer 1) and the content (Layer 4),
  creating depth in the hero environment.

  Lines are rendered as absolutely positioned divs with framer-motion
  transforms — no canvas needed, keeping this layer lightweight.
*/

interface DraftLine {
  id: number;
  orientation: "h" | "v" | "d"; // horizontal, vertical, diagonal
  // Position as percentage of container
  startX: number;
  startY: number;
  length: number; // percentage
  angle: number; // degrees
  baseOpacity: number;
  driftSpeed: number; // parallax multiplier
  thickness: number;
  fadeDelay: number; // seconds into animation cycle
}

// Predefined architectural lines — positioned to avoid center content area
const lines: DraftLine[] = [
  // Horizontal drafting lines
  { id: 1, orientation: "h", startX: 0, startY: 18, length: 35, angle: 0, baseOpacity: 0.045, driftSpeed: 0.15, thickness: 0.5, fadeDelay: 0 },
  { id: 2, orientation: "h", startX: 60, startY: 25, length: 40, angle: 0, baseOpacity: 0.035, driftSpeed: 0.1, thickness: 0.5, fadeDelay: 2 },
  { id: 3, orientation: "h", startX: 5, startY: 72, length: 30, angle: 0, baseOpacity: 0.04, driftSpeed: 0.2, thickness: 0.5, fadeDelay: 4 },
  { id: 4, orientation: "h", startX: 55, startY: 82, length: 45, angle: 0, baseOpacity: 0.03, driftSpeed: 0.12, thickness: 0.5, fadeDelay: 1 },

  // Vertical drafting lines
  { id: 5, orientation: "v", startX: 12, startY: 5, length: 30, angle: 90, baseOpacity: 0.04, driftSpeed: 0.18, thickness: 0.5, fadeDelay: 3 },
  { id: 6, orientation: "v", startX: 88, startY: 15, length: 35, angle: 90, baseOpacity: 0.035, driftSpeed: 0.14, thickness: 0.5, fadeDelay: 0.5 },
  { id: 7, orientation: "v", startX: 52, startY: 60, length: 25, angle: 90, baseOpacity: 0.03, driftSpeed: 0.1, thickness: 0.5, fadeDelay: 5 },

  // Diagonal drafting lines — subtle architectural angles
  { id: 8, orientation: "d", startX: 0, startY: 40, length: 45, angle: 15, baseOpacity: 0.025, driftSpeed: 0.08, thickness: 0.5, fadeDelay: 1.5 },
  { id: 9, orientation: "d", startX: 70, startY: 10, length: 40, angle: -12, baseOpacity: 0.025, driftSpeed: 0.06, thickness: 0.5, fadeDelay: 3.5 },
  { id: 10, orientation: "d", startX: 20, startY: 85, length: 35, angle: 8, baseOpacity: 0.02, driftSpeed: 0.1, thickness: 0.5, fadeDelay: 2.5 },

  // Short measurement tick marks
  { id: 11, orientation: "h", startX: 8, startY: 18.5, length: 2, angle: 90, baseOpacity: 0.05, driftSpeed: 0.15, thickness: 0.5, fadeDelay: 0 },
  { id: 12, orientation: "h", startX: 15, startY: 18.5, length: 2, angle: 90, baseOpacity: 0.05, driftSpeed: 0.15, thickness: 0.5, fadeDelay: 0 },
  { id: 13, orientation: "h", startX: 22, startY: 18.5, length: 2, angle: 90, baseOpacity: 0.05, driftSpeed: 0.15, thickness: 0.5, fadeDelay: 0 },
];

function ArchLine({
  line,
  scrollProgress,
}: {
  line: DraftLine;
  scrollProgress: number;
}) {
  const scrollOffset = scrollProgress * line.driftSpeed * 100;

  // Calculate line dimensions
  const isVertical = line.orientation === "v";
  const width = isVertical ? `${line.thickness}px` : `${line.length}%`;
  const height = isVertical ? `${line.length}%` : `${line.thickness}px`;

  // Drift direction based on orientation
  const translateX = isVertical ? 0 : scrollOffset * 0.3;
  const translateY = isVertical ? scrollOffset * 0.5 : 0;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${line.startX}%`,
        top: `${line.startY}%`,
        width,
        height,
        background: `var(--color-muted)`,
        transform: `translate(${translateX}px, ${translateY}px) rotate(${line.angle}deg)`,
        transformOrigin: "0 0",
        willChange: "transform, opacity",
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, line.baseOpacity, line.baseOpacity, 0],
      }}
      transition={{
        duration: 12,
        delay: line.fadeDelay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.15, 0.85, 1],
      }}
      aria-hidden="true"
    />
  );
}

export default function BlueprintLineLayer({
  className = "",
  containerRef,
}: BlueprintLineLayerProps) {
  const scrollRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef ?? undefined,
    offset: ["start start", "end start"],
  });

  // Track scroll progress via ref to avoid re-renders
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
  });

  // Use a lightweight animation loop to update line positions
  const layerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const children = layer.children;

    const animate = () => {
      timeRef.current += 0.016;
      const scroll = scrollRef.current;

      // Update each line's transform based on scroll
      for (let i = 0; i < children.length && i < lines.length; i++) {
        const line = lines[i];
        const el = children[i] as HTMLElement;
        const scrollOffset = scroll * line.driftSpeed * 100;

        const isVertical = line.orientation === "v";
        const tx = isVertical ? 0 : scrollOffset * 0.3;
        const ty = isVertical ? scrollOffset * 0.5 : 0;

        // Add subtle time-based drift
        const timeDriftX = Math.sin(timeRef.current * 0.3 + line.id) * 2;
        const timeDriftY = Math.cos(timeRef.current * 0.2 + line.id * 0.7) * 1.5;

        el.style.transform = `translate(${tx + timeDriftX}px, ${ty + timeDriftY}px) rotate(${line.angle}deg)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div
      ref={layerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {lines.map((line) => (
        <ArchLine
          key={line.id}
          line={line}
          scrollProgress={scrollRef.current}
        />
      ))}
    </div>
  );
}
