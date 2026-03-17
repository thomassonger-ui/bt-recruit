"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CircularGalleryProps {
  items: React.ReactNode[];
  labels?: string[];
}

/**
 * Circular Gallery — Interactive carousel that presents Scout UI cards
 * in a 3D perspective layout. Desktop shows a fan of 3 visible cards
 * with the active card scaled up. Mobile shows a single card with
 * swipe navigation.
 */
export default function CircularGallery({ items, labels }: CircularGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = items.length;

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (!isAutoPlaying) return;
    autoPlayRef.current = setInterval(next, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, next]);

  const handleUserInteraction = useCallback(
    (action: () => void) => {
      setIsAutoPlaying(false);
      action();
      // Resume autoplay after 8 seconds of inactivity
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = setTimeout(() => setIsAutoPlaying(true), 8000) as unknown as ReturnType<typeof setInterval>;
    },
    []
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleUserInteraction(prev);
      if (e.key === "ArrowRight") handleUserInteraction(next);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleUserInteraction, next, prev]);

  // Get indices for visible cards (prev, active, next)
  const getVisibleIndices = () => {
    const prevIdx = (activeIndex - 1 + total) % total;
    const nextIdx = (activeIndex + 1) % total;
    return [prevIdx, activeIndex, nextIdx];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <div className="flex flex-col items-center gap-8">
      {/* ── Gallery viewport ── */}
      <div className="relative flex h-[400px] w-full items-center justify-center">
        {/* ── Navigation arrows ── */}
        <button
          onClick={() => handleUserInteraction(prev)}
          className="absolute left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg sm:left-4 md:left-8"
          aria-label="Previous card"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => handleUserInteraction(next)}
          className="absolute right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg sm:right-4 md:right-8"
          aria-label="Next card"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 4L14 10L8 16" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* ── Cards — Desktop: 3-card fan, Mobile: single card ── */}
        {/* Desktop layout */}
        <div className="relative hidden h-full w-full max-w-[800px] items-center justify-center md:flex" style={{ perspective: "1200px" }}>
          {visibleIndices.map((idx, position) => {
            const isActive = position === 1;
            const isLeft = position === 0;

            return (
              <motion.div
                key={`card-${idx}-${position}`}
                className="absolute cursor-pointer"
                onClick={() => {
                  if (!isActive) handleUserInteraction(() => setActiveIndex(idx));
                }}
                initial={false}
                animate={{
                  x: isActive ? 0 : isLeft ? -200 : 200,
                  z: isActive ? 50 : -50,
                  scale: isActive ? 1 : 0.85,
                  opacity: isActive ? 1 : 0.6,
                  rotateY: isActive ? 0 : isLeft ? 12 : -12,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 28,
                  mass: 0.8,
                }}
                style={{
                  zIndex: isActive ? 10 : 5,
                  transformStyle: "preserve-3d",
                }}
              >
                {items[idx]}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile layout — single card */}
        <div className="flex h-full items-center justify-center md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {items[activeIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Label ── */}
      {labels && (
        <AnimatePresence mode="wait">
          <motion.p
            key={activeIndex}
            className="text-sm font-medium text-foreground"
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {labels[activeIndex]}
          </motion.p>
        </AnimatePresence>
      )}

      {/* ── Dot indicators ── */}
      <div className="flex items-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => handleUserInteraction(() => setActiveIndex(i))}
            className="group relative flex h-6 w-6 items-center justify-center"
            aria-label={`Go to card ${i + 1}${labels ? `: ${labels[i]}` : ""}`}
          >
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? "24px" : "8px",
                height: "8px",
                background: i === activeIndex ? "var(--color-primary)" : "var(--color-border)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
