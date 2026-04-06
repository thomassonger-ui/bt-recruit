"use client";

import React from "react";

interface BearTeamLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}

const sizes = {
  sm: { iconSize: 32, fontSize: "14px", gap: 8 },
  md: { iconSize: 42, fontSize: "17px", gap: 10 },
  lg: { iconSize: 54, fontSize: "22px", gap: 12 },
};

export default function BearTeamLogo({
  className = "",
  size = "md",
  variant = "dark",
}: BearTeamLogoProps) {
  const { iconSize, fontSize, gap } = sizes[size];
  const isDark = variant === "dark";

  // Colors based on variant
  const markBg = isDark ? "var(--color-foreground)" : "var(--color-text-light)";
  const markFg = isDark ? "var(--color-card)" : "var(--color-panel-dark)";
  const wordmarkColor = isDark ? "var(--color-foreground)" : "var(--color-text-light)";

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: `${gap}px` }}
      aria-label="Bear Real Estate Team"
    >
      {/* BT square mark */}
      <img
        src={isDark ? "/bt-logo.png" : "/bt-logo-white.svg"}
        alt="BT"
        width={iconSize}
        height={iconSize}
        style={{ objectFit: 'contain' }}
        aria-hidden="true"
      />

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize,
          fontWeight: 700,
          color: wordmarkColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        Bear Real Estate Team
      </span>
    </div>
  );
}
