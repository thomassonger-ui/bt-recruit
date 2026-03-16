"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

/**
 * Apple-style cinematic product reveal for Scout.
 * As users scroll, the Scout interface scales up, floats in 3D,
 * and elements fade into position — creating a premium reveal moment.
 */
export default function CinematicReveal() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Interface card: scale up + rotate flatten + move up
  const cardScale = useTransform(scrollYProgress, [0.05, 0.35], [0.88, 1])
  const cardRotateX = useTransform(scrollYProgress, [0.05, 0.35], [8, 0])
  const cardY = useTransform(scrollYProgress, [0.05, 0.35], [80, 0])
  const cardOpacity = useTransform(scrollYProgress, [0.0, 0.2], [0, 1])

  // Title reveal
  const titleY = useTransform(scrollYProgress, [0.0, 0.2], [40, 0])
  const titleOpacity = useTransform(scrollYProgress, [0.0, 0.15], [0, 1])

  // Background grid drift
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -50])

  // Floating sidebar panels
  const panelLeftX = useTransform(scrollYProgress, [0.1, 0.4], [-60, 0])
  const panelRightX = useTransform(scrollYProgress, [0.1, 0.4], [60, 0])
  const panelOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 sm:px-6 lg:px-8"
      style={{ background: "#1E2530", minHeight: "100vh" }}
    >
      {/* Blueprint grid background with parallax */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ y: gridY, willChange: "transform" }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(160,175,195,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(160,175,195,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(160,175,195,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </motion.div>

      {/* Gradient fades */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 z-10"
        style={{ background: "linear-gradient(to bottom, #1E2530, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 z-10"
        style={{ background: "linear-gradient(to top, #1E2530, transparent)" }}
      />

      <div
        className="relative z-20 mx-auto max-w-6xl flex flex-col items-center justify-center"
        style={{ minHeight: "100vh", perspective: "1200px" }}
      >
        {/* Section title */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="mb-16 text-center"
        >
          <p
            className="mb-3 text-sm font-medium uppercase tracking-wider"
            style={{
              color: "rgba(160,175,195,0.45)",
              letterSpacing: "0.1em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Platform
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{
              color: "#E8ECF0",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.15,
            }}
          >
            The Scout Experience
          </h2>
          <p
            className="text-base md:text-lg max-w-lg mx-auto"
            style={{
              color: "rgba(160,175,195,0.55)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            A purpose-built AI platform designed for real estate professionals.
          </p>
        </motion.div>

        {/* Main interface card — cinematic reveal */}
        <div className="relative w-full max-w-3xl">
          {/* Floating left panel */}
          <motion.div
            className="absolute -left-4 top-12 hidden lg:block"
            style={{
              x: panelLeftX,
              opacity: panelOpacity,
              willChange: "transform",
            }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(160,175,195,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "#E8ECF0", fontFamily: "Inter, sans-serif" }}>
                Active Deals
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)", fontFamily: "Inter, sans-serif" }}>
                12
              </p>
              <p className="text-xs" style={{ color: "rgba(160,175,195,0.5)" }}>This quarter</p>
            </motion.div>
          </motion.div>

          {/* Floating right panel */}
          <motion.div
            className="absolute -right-4 top-24 hidden lg:block"
            style={{
              x: panelRightX,
              opacity: panelOpacity,
              willChange: "transform",
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(160,175,195,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "#E8ECF0", fontFamily: "Inter, sans-serif" }}>
                Pipeline Value
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)", fontFamily: "Inter, sans-serif" }}>
                $3.2M
              </p>
              <p className="text-xs" style={{ color: "rgba(160,175,195,0.5)" }}>Projected close</p>
            </motion.div>
          </motion.div>

          {/* Central Scout interface */}
          <motion.div
            style={{
              scale: cardScale,
              rotateX: cardRotateX,
              y: cardY,
              opacity: cardOpacity,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(160,175,195,0.1)",
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(59,90,130,0.06)",
              }}
            >
              {/* Interface header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgba(160,175,195,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--color-primary)", fontFamily: "Inter, sans-serif" }}
                  >
                    S
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#E8ECF0", fontFamily: "Inter, sans-serif" }}>
                      Scout
                    </p>
                    <p className="text-xs" style={{ color: "rgba(160,175,195,0.5)" }}>
                      BearTeam AI Assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs" style={{ color: "rgba(160,175,195,0.5)" }}>Online</span>
                </div>
              </div>

              {/* Simulated conversation */}
              <div className="px-6 py-8 space-y-4" style={{ minHeight: "280px" }}>
                {/* Agent message */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 text-sm"
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    What pricing strategy would you recommend for my Winter Park listing?
                  </div>
                </div>

                {/* Scout response */}
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(160,175,195,0.1)",
                      color: "#C8CED6",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Based on 14 comparable sales within 0.8 miles over the past 90 days,
                    a competitive listing range would be $410,000-$425,000. Median price
                    per sqft in this micro-market is $192.
                  </div>
                </div>

                {/* Agent follow-up */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-3 text-sm"
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Create a social media post for it.
                  </div>
                </div>

                {/* Scout response 2 */}
                <div className="flex justify-start">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(160,175,195,0.1)",
                      color: "#C8CED6",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Just listed in Winter Park. Beautiful 3-bedroom home with modern
                    finishes and a private backyard. Priced to move. Message me for
                    details or to schedule a private showing.
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderTop: "1px solid rgba(160,175,195,0.08)" }}
              >
                <div
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(160,175,195,0.08)",
                    color: "rgba(160,175,195,0.4)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Ask Scout anything...
                </div>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "var(--color-primary)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Try Scout CTA */}
        <motion.div
          style={{ opacity: cardOpacity }}
          className="mt-12 text-center"
        >
          <a
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)", fontFamily: "Inter, sans-serif" }}
          >
            Try Scout Live
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
