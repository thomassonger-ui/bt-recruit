"use client";

import React from "react";
import { motion } from "framer-motion";

interface RoleCardProps {
  title: string;
  location: string;
  type: string;
  tags: string[];
  className?: string;
}

export default function RoleCard({ title, location, type, tags, className = "" }: RoleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex flex-col gap-4 rounded-lg border border-muted/20 bg-card p-6 shadow-sm ${className}`}
    >
      <div>
        <h3 className="text-lg font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted">{location} &middot; {type}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-background px-3 py-1 text-xs font-medium text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto pt-2">
        <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
          View Role &rarr;
        </span>
      </div>
    </motion.div>
  );
}
