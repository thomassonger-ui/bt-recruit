"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface InteractiveCardProps {
  title: string;
  summary: string;
  detail: string;
  index?: number;
}

export default function InteractiveCard({
  title,
  summary,
  detail,
  index = 0,
}: InteractiveCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative cursor-pointer"
        style={{ minHeight: "260px", transformStyle: "preserve-3d" }}
        role="button"
        tabIndex={0}
        aria-label={`${title} card. Click to ${isFlipped ? "show summary" : "show details"}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
      >
        {/* Front face */}
        <motion.div
          style={{
            rotateX: isFlipped ? 0 : rotateX,
            rotateY: isFlipped ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 backface-hidden"
        >
          <div
            className="flex h-full flex-col gap-4 p-8 transition-shadow duration-300"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border-light)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              className="text-lg font-semibold text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{summary}</p>
            <div className="mt-auto pt-4">
              <span
                className="text-xs font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Click to learn more
              </span>
            </div>
          </div>
        </motion.div>

        {/* Back face */}
        <motion.div
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            rotateY: isFlipped ? 0 : -180,
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 backface-hidden"
        >
          <div
            className="flex h-full flex-col gap-4 p-8"
            style={{
              background: "var(--color-primary)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            <h3
              className="text-lg font-semibold"
              style={{
                fontFamily: "Inter, sans-serif",
                color: "var(--color-text-light)",
              }}
            >
              {title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255, 255, 255, 0.85)" }}
            >
              {detail}
            </p>
            <div className="mt-auto pt-4">
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                Click to go back
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
