"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface BlueprintFloatingElementsProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Floating architectural drafting elements that drift with parallax.
 *
 * Renders subtle SVG shapes — wall outlines, room rectangles,
 * dimension lines, and tick marks — at low opacity. Each element
 * moves independently based on scroll for layered depth.
 */

interface DraftElement {
  id: string;
  type: "wall" | "room" | "dimension" | "tick" | "arc";
  x: string; // CSS position
  y: string;
  depth: number; // parallax multiplier
  opacity: number;
  svg: React.ReactNode;
}

const elements: DraftElement[] = [
  // Wall segments
  {
    id: "wall-1",
    type: "wall",
    x: "8%",
    y: "15%",
    depth: 0.15,
    opacity: 0.08,
    svg: (
      <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
        <rect x="2" y="2" width="176" height="116" stroke="currentColor" strokeWidth="1.5" />
        <line x1="70" y1="2" x2="70" y2="72" stroke="currentColor" strokeWidth="1.2" />
        <line x1="70" y1="72" x2="176" y2="72" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "wall-2",
    type: "wall",
    x: "72%",
    y: "8%",
    depth: 0.12,
    opacity: 0.06,
    svg: (
      <svg width="140" height="90" viewBox="0 0 140 90" fill="none">
        <rect x="2" y="2" width="136" height="86" stroke="currentColor" strokeWidth="1.5" />
        <line x1="68" y1="2" x2="68" y2="52" stroke="currentColor" strokeWidth="1" />
        <line x1="2" y1="52" x2="68" y2="52" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  // Room rectangles
  {
    id: "room-1",
    type: "room",
    x: "25%",
    y: "55%",
    depth: 0.2,
    opacity: 0.07,
    svg: (
      <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
        <rect x="2" y="2" width="96" height="76" stroke="currentColor" strokeWidth="0.8" />
        <rect x="8" y="8" width="40" height="32" stroke="currentColor" strokeWidth="0.5" />
        <rect x="52" y="8" width="40" height="32" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    id: "room-2",
    type: "room",
    x: "60%",
    y: "65%",
    depth: 0.18,
    opacity: 0.06,
    svg: (
      <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
        <rect x="2" y="2" width="116" height="66" stroke="currentColor" strokeWidth="0.8" />
        <line x1="60" y1="2" x2="60" y2="68" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    ),
  },
  // Dimension lines with ticks
  {
    id: "dim-1",
    type: "dimension",
    x: "15%",
    y: "35%",
    depth: 0.1,
    opacity: 0.07,
    svg: (
      <svg width="200" height="12" viewBox="0 0 200 12" fill="none">
        <line x1="0" y1="6" x2="200" y2="6" stroke="currentColor" strokeWidth="0.5" />
        <line x1="0" y1="2" x2="0" y2="10" stroke="currentColor" strokeWidth="0.5" />
        <line x1="200" y1="2" x2="200" y2="10" stroke="currentColor" strokeWidth="0.5" />
        <line x1="50" y1="3" x2="50" y2="9" stroke="currentColor" strokeWidth="0.4" />
        <line x1="100" y1="3" x2="100" y2="9" stroke="currentColor" strokeWidth="0.4" />
        <line x1="150" y1="3" x2="150" y2="9" stroke="currentColor" strokeWidth="0.4" />
      </svg>
    ),
  },
  {
    id: "dim-2",
    type: "dimension",
    x: "78%",
    y: "42%",
    depth: 0.08,
    opacity: 0.06,
    svg: (
      <svg width="12" height="160" viewBox="0 0 12 160" fill="none">
        <line x1="6" y1="0" x2="6" y2="160" stroke="currentColor" strokeWidth="0.5" />
        <line x1="2" y1="0" x2="10" y2="0" stroke="currentColor" strokeWidth="0.5" />
        <line x1="2" y1="160" x2="10" y2="160" stroke="currentColor" strokeWidth="0.5" />
        <line x1="3" y1="40" x2="9" y2="40" stroke="currentColor" strokeWidth="0.4" />
        <line x1="3" y1="80" x2="9" y2="80" stroke="currentColor" strokeWidth="0.4" />
        <line x1="3" y1="120" x2="9" y2="120" stroke="currentColor" strokeWidth="0.4" />
      </svg>
    ),
  },
  // Door arc
  {
    id: "arc-1",
    type: "arc",
    x: "45%",
    y: "20%",
    depth: 0.14,
    opacity: 0.06,
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M2 38 L2 2 L38 2" stroke="currentColor" strokeWidth="0.8" />
        <path d="M2 38 A36 36 0 0 1 38 2" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    ),
  },
  // Tick marks cluster
  {
    id: "tick-1",
    type: "tick",
    x: "88%",
    y: "75%",
    depth: 0.22,
    opacity: 0.05,
    svg: (
      <svg width="60" height="8" viewBox="0 0 60 8" fill="none">
        {[0, 10, 20, 30, 40, 50, 60].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="8" stroke="currentColor" strokeWidth="0.4" />
        ))}
        <line x1="0" y1="4" x2="60" y2="4" stroke="currentColor" strokeWidth="0.3" />
      </svg>
    ),
  },
  // Small floor plan fragment
  {
    id: "wall-3",
    type: "wall",
    x: "4%",
    y: "78%",
    depth: 0.16,
    opacity: 0.05,
    svg: (
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
        <path d="M2 2 H78 V58 H42 V30 H2 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M42 58 A16 16 0 0 1 58 42" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    ),
  },
];

export default function BlueprintFloatingElements({
  className = "",
  containerRef,
}: BlueprintFloatingElementsProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollTarget = containerRef ?? ref;

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start start", "end start"],
  });

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ color: "var(--color-muted)" }}
    >
      {elements.map((el) => {
        return (
          <FloatingElement
            key={el.id}
            element={el}
            scrollYProgress={scrollYProgress}
          />
        );
      })}
    </div>
  );
}

function FloatingElement({
  element,
  scrollYProgress,
}: {
  element: DraftElement;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, element.depth * 200]
  );

  return (
    <motion.div
      className="absolute"
      style={{
        left: element.x,
        top: element.y,
        opacity: element.opacity,
        y,
        willChange: "transform",
      }}
    >
      {element.svg}
    </motion.div>
  );
}
