"use client"

import { motion } from "framer-motion"

/**
 * Minimalist floating AI robot character for Scout.
 * Enters from right, pauses center, looks around, exits left.
 * ~5s total animation. Desktop only (hidden on mobile via parent).
 */
export default function ScoutRobot() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[12%] z-[5]"
      initial={{ x: "110vw" }}
      animate={{
        x: ["110vw", "50vw", "50vw", "-15vw"],
      }}
      transition={{
        duration: 5.5,
        times: [0, 0.25, 0.7, 1],
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      {/* Robot body */}
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0, -4, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Subtle head look-around */}
        <motion.div
          animate={{ rotate: [0, 0, -6, 4, -3, 0, 0] }}
          transition={{
            duration: 5.5,
            times: [0, 0.25, 0.38, 0.48, 0.55, 0.65, 1],
            ease: "easeInOut",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Antenna */}
            <line
              x1="24"
              y1="4"
              x2="24"
              y2="12"
              stroke="var(--color-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="24" cy="3" r="2" fill="var(--color-primary)" opacity="0.6" />

            {/* Head — rounded rectangle */}
            <rect
              x="8"
              y="12"
              width="32"
              height="24"
              rx="10"
              fill="var(--color-card)"
              stroke="var(--color-border-light)"
              strokeWidth="1.5"
            />

            {/* Left eye */}
            <motion.circle
              cx="18"
              cy="23"
              r="3"
              fill="var(--color-primary)"
              animate={{ scale: [1, 1, 0.15, 1, 1] }}
              transition={{
                duration: 4,
                times: [0, 0.45, 0.5, 0.55, 1],
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Right eye */}
            <motion.circle
              cx="30"
              cy="23"
              r="3"
              fill="var(--color-primary)"
              animate={{ scale: [1, 1, 0.15, 1, 1] }}
              transition={{
                duration: 4,
                times: [0, 0.45, 0.5, 0.55, 1],
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Mouth — subtle smile arc */}
            <path
              d="M19 30 Q24 33 29 30"
              stroke="var(--color-muted)"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Body connector */}
            <rect
              x="20"
              y="36"
              width="8"
              height="4"
              rx="2"
              fill="var(--color-border-light)"
            />

            {/* Body */}
            <rect
              x="14"
              y="40"
              width="20"
              height="6"
              rx="3"
              fill="var(--color-card)"
              stroke="var(--color-border-light)"
              strokeWidth="1"
            />
          </svg>
        </motion.div>

        {/* Glow beneath robot */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3 w-10 rounded-full blur-sm"
          style={{ background: "var(--color-primary)", opacity: 0.08 }}
        />
      </motion.div>
    </motion.div>
  )
}
