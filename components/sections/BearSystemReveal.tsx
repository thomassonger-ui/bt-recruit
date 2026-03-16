"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

/* ── Card data ── */
const systemCards = [
  {
    title: "Bear Academy",
    description:
      "Structured training programs that help agents build production systems and business discipline.",
  },
  {
    title: "BearTeamOS",
    description:
      "Operational infrastructure that supports listings, buyers, transactions, and team coordination.",
  },
  {
    title: "Scout AI Assistant",
    description:
      "An AI assistant that helps agents create marketing, client communication, and daily workflow support.",
  },
  {
    title: "30 / 60 / 90 Day Growth Plan",
    description:
      "A structured onboarding framework that helps new agents build momentum quickly.",
  },
]

/* ── Floating 3D Panel ── */
function FloatingPanel({
  title,
  description,
  index,
}: {
  title: string
  description: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 5, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5 + index * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.8,
        }}
        whileHover={{
          y: -12,
          rotateY: 2,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(59,90,130,0.12)",
        }}
        className="relative rounded-2xl p-8 md:p-10 transition-shadow duration-300"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(160,175,195,0.12)",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(59,90,130,0.06)",
          backdropFilter: "blur(8px)",
          willChange: "transform",
        }}
      >
        {/* Card number */}
        <span
          className="absolute top-6 right-8 text-4xl font-extrabold"
          style={{
            fontFamily: "Inter, sans-serif",
            color: "rgba(160,175,195,0.08)",
            lineHeight: 1,
          }}
        >
          0{index + 1}
        </span>

        <h3
          className="text-lg font-semibold mb-3"
          style={{ fontFamily: "Inter, sans-serif", color: "#E8ECF0" }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: "Inter, sans-serif",
            color: "rgba(160,175,195,0.7)",
            maxWidth: "36ch",
          }}
        >
          {description}
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ── Blueprint background grid (lightweight CSS) ── */
function BlueprintBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        backgroundImage: `
          linear-gradient(rgba(160,175,195,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(160,175,195,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "56px 56px",
      }}
    >
      {/* Intersection dots */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(160,175,195,0.1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  )
}

/* ── Main Section ── */
export default function BearSystemReveal() {
  const sectionRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Parallax: background grid drifts slowly
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -40])
  // Title parallax
  const titleY = useTransform(scrollYProgress, [0, 0.3], [30, 0])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 sm:px-6 lg:px-8"
      style={{ background: "#2C3440" }}
    >
      {/* Blueprint grid background with parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: gridY, willChange: "transform" }}
      >
        <BlueprintBg />
      </motion.div>

      {/* Gradient fade edges */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, #2C3440, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to top, #2C3440, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl py-28 sm:py-36">
        {/* Section header */}
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="mx-auto mb-20 max-w-2xl text-center"
        >
          <p
            className="mb-4 text-sm font-medium uppercase tracking-wider"
            style={{
              color: "rgba(160,175,195,0.5)",
              letterSpacing: "0.1em",
              fontFamily: "Inter, sans-serif",
            }}
          >
            The BearTeam System
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold mb-5"
            style={{
              color: "#E8ECF0",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.2,
            }}
          >
            Build Your Business on a System
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{
              color: "rgba(160,175,195,0.6)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            BearTeam provides the structure, systems, and technology that help
            agents scale production without chaos.
          </p>
        </motion.div>

        {/* Cards — 2×2 grid on desktop, stacked mobile */}
        <div className="grid gap-8 sm:grid-cols-2">
          {systemCards.map((card, i) => (
            <FloatingPanel
              key={card.title}
              title={card.title}
              description={card.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
