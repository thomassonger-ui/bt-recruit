import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Section({ children, className = "", style }: SectionProps) {
  return (
    <section className={`px-4 py-20 sm:px-6 lg:px-8 ${className}`} style={style}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
