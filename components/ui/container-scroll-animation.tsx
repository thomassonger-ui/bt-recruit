"use client"

import React, { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"

interface ContainerScrollProps {
  titleComponent: React.ReactNode
  children: React.ReactNode
}

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const scaleDimensions = useTransform(scrollYProgress, [0.05, 0.3], [0.85, 1])
  const rotate = useTransform(scrollYProgress, [0.05, 0.3], [8, 0])
  const translateY = useTransform(scrollYProgress, [0.05, 0.3], [100, 0])
  const opacity = useTransform(scrollYProgress, [0.0, 0.15], [0, 1])
  const titleTranslateY = useTransform(scrollYProgress, [0.05, 0.3], [40, 0])

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-start"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        style={{ translateY: titleTranslateY, opacity }}
        className="w-full max-w-4xl mx-auto text-center mb-10"
      >
        {titleComponent}
      </motion.div>

      <motion.div
        style={{
          rotateX: rotate,
          scale: scaleDimensions,
          translateY,
          opacity,
        }}
        className="w-full max-w-5xl mx-auto"
      >
        {children}
      </motion.div>
    </div>
  )
}
