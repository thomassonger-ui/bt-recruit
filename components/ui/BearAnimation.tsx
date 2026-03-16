"use client"

import { motion } from "framer-motion"

/**
 * Minimalist bear brand animation for the /scout hero.
 * Appears from behind the hero card, moves forward with a zoom,
 * pauses, then exits left. ~5s total. Desktop only.
 */
export default function BearAnimation() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[10%] right-[18%] z-[3]"
      initial={{ x: 60, opacity: 0, scale: 0.6 }}
      animate={{
        x: [60, -80, -80, -800],
        opacity: [0, 1, 1, 0],
        scale: [0.6, 1.1, 1.1, 0.9],
      }}
      transition={{
        duration: 5.5,
        times: [0, 0.3, 0.7, 1],
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      {/* Floating bob */}
      <motion.div
        animate={{ y: [0, -5, 0, -3, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Subtle head turn */}
        <motion.div
          animate={{ rotate: [0, 0, -4, 3, -2, 0, 0] }}
          transition={{
            duration: 5.5,
            times: [0, 0.3, 0.42, 0.52, 0.6, 0.68, 1],
            ease: "easeInOut",
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left ear */}
            <circle
              cx="14"
              cy="12"
              r="8"
              fill="var(--color-muted)"
              opacity="0.25"
            />
            <circle
              cx="14"
              cy="12"
              r="5"
              fill="var(--color-card)"
              stroke="var(--color-border-light)"
              strokeWidth="1"
            />

            {/* Right ear */}
            <circle
              cx="42"
              cy="12"
              r="8"
              fill="var(--color-muted)"
              opacity="0.25"
            />
            <circle
              cx="42"
              cy="12"
              r="5"
              fill="var(--color-card)"
              stroke="var(--color-border-light)"
              strokeWidth="1"
            />

            {/* Head */}
            <ellipse
              cx="28"
              cy="28"
              rx="18"
              ry="17"
              fill="var(--color-card)"
              stroke="var(--color-border-light)"
              strokeWidth="1.5"
            />

            {/* Left eye */}
            <motion.circle
              cx="21"
              cy="25"
              r="2.5"
              fill="var(--color-primary)"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                duration: 4,
                times: [0, 0.42, 0.48, 0.54, 1],
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
            />

            {/* Right eye */}
            <motion.circle
              cx="35"
              cy="25"
              r="2.5"
              fill="var(--color-primary)"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                duration: 4,
                times: [0, 0.42, 0.48, 0.54, 1],
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
            />

            {/* Nose */}
            <ellipse
              cx="28"
              cy="31"
              rx="4"
              ry="2.5"
              fill="var(--color-muted)"
              opacity="0.35"
            />

            {/* Mouth */}
            <path
              d="M24 34 Q28 37 32 34"
              stroke="var(--color-muted)"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />

            {/* Muzzle highlight */}
            <ellipse
              cx="28"
              cy="33"
              rx="7"
              ry="5"
              fill="none"
              stroke="var(--color-border-light)"
              strokeWidth="0.8"
              opacity="0.4"
            />
          </svg>
        </motion.div>

        {/* Ground shadow */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-8 rounded-full blur-sm"
          style={{ background: "var(--color-primary)", opacity: 0.06 }}
        />
      </motion.div>
    </motion.div>
  )
}
