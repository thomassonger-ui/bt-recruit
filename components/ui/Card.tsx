"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export default function Card({ children, className = "", elevated = false }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`surface-card p-6 transition-shadow duration-300 ${elevated ? "surface-elevated" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
