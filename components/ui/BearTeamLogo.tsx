"use client";

import React from "react";

interface BearTeamLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}

const sizes = {
  sm: { iconSize: 24, fontSize: "14px", gap: 7 },
  md: { iconSize: 30, fontSize: "18px", gap: 9 },
  lg: { iconSize: 40, fontSize: "24px", gap: 11 },
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
      aria-label="BearTeam"
    >
      {/* BT square mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer square */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="2"
          fill={markBg}
        />
        {/* Inner border */}
        <rect
          x="4"
          y="4"
          width="32"
          height="32"
          rx="1"
          stroke={markFg}
          strokeWidth="2"
          fill="none"
        />
        {/* B letter */}
        <text
          x="11.5"
          y="27.5"
          fill={markFg}
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="-0.5"
        >
          B
        </text>
        {/* T letter */}
        <text
          x="22"
          y="27.5"
          fill={markFg}
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="-0.5"
        >
          T
        </text>
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize,
          fontWeight: 700,
          color: wordmarkColor,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        BearTeam
      </span>
    </div>
  );
}
