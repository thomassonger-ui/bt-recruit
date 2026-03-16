"use client";

import React from "react";
import { motion } from "framer-motion";

interface IconCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export default function IconCard({ icon, title, description, className = "" }: IconCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`surface-card p-6 transition-shadow duration-300 ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-2xl">
        {icon}
      </div>
      <h3
        className="mb-2 text-lg font-semibold text-foreground"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
    </motion.div>
  );
}
