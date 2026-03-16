"use client";

import React from "react";
import { motion } from "framer-motion";

interface Stat {
  value: string;
  label: string;
}

interface StatBarProps {
  stats: Stat[];
  className?: string;
}

export default function StatBar({ stats, className = "" }: StatBarProps) {
  return (
    <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-${stats.length} ${className}`}>
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <span
            className="text-5xl font-extrabold tracking-tight sm:text-6xl"
            style={{ fontFamily: "Inter, sans-serif", lineHeight: 1 }}
          >
            {stat.value}
          </span>
          <span
            className="text-xs font-medium uppercase tracking-widest opacity-60"
            style={{ letterSpacing: "0.1em" }}
          >
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
