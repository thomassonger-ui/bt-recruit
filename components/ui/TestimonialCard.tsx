import React from "react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  className?: string;
}

export default function TestimonialCard({ quote, name, role, className = "" }: TestimonialCardProps) {
  return (
    <div className={`rounded-lg border border-muted/20 bg-card p-6 shadow-sm ${className}`}>
      <p className="mb-4 text-muted italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="text-sm font-semibold text-primary">{name}</p>
        <p className="text-xs text-muted">{role}</p>
      </div>
    </div>
  );
}
