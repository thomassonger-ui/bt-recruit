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
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer square */}
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="3"
          fill={markBg}
        />
        {/* Inner border */}
        <rect
          x="5"
          y="5"
          width="38"
          height="38"
          rx="1.5"
          stroke={markFg}
          strokeWidth="2.5"
          fill="none"
        />
        {/* B letter */}
        <text
          x="13"
          y="33"
          fill={markFg}
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="22"
          letterSpacing="-0.5"
        >
          B
        </text>
        {/* T letter */}
        <text
          x="26"
          y="33"
          fill={markFg}
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="22"
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
          lineHeight: 1.15,
        }}
      >
        Bear Real Estate Team
      </span>
    </div>
  );
}
