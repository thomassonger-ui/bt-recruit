"use client";

import React, { useEffect, useRef } from "react";

interface BlueprintGridProps {
  className?: string;
}

export default function BlueprintGrid({ className = "" }: BlueprintGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      const gridSize = 60;
      const cols = Math.ceil(w / gridSize) + 1;
      const rows = Math.ceil(h / gridSize) + 1;

      // Draw grid lines
      ctx.strokeStyle = "rgba(59, 90, 130, 0.06)";
      ctx.lineWidth = 0.5;

      for (let i = 0; i <= cols; i++) {
        const x = i * gridSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let j = 0; j <= rows; j++) {
        const y = j * gridSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw intersection dots with subtle pulse
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * gridSize;
          const y = j * gridSize;

          // Staggered wave animation
          const phase = (i + j) * 0.3 + time * 0.8;
          const pulse = 0.3 + Math.sin(phase) * 0.15;

          ctx.fillStyle = `rgba(59, 90, 130, ${pulse})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw subtle diagonal accent lines that drift
      const numAccents = 4;
      for (let k = 0; k < numAccents; k++) {
        const offset = (time * 12 + k * (w / numAccents)) % (w + h);
        const alpha = 0.03 + Math.sin(time * 0.5 + k) * 0.015;

        ctx.strokeStyle = `rgba(59, 90, 130, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset - h, h);
        ctx.stroke();
      }

      // Draw a few floating node connections
      const nodes = [
        { x: w * 0.2, y: h * 0.3 },
        { x: w * 0.5, y: h * 0.15 },
        { x: w * 0.8, y: h * 0.4 },
        { x: w * 0.35, y: h * 0.7 },
        { x: w * 0.65, y: h * 0.65 },
        { x: w * 0.15, y: h * 0.85 },
      ];

      // Draw node connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < w * 0.35) {
            const connectionAlpha =
              0.025 *
              (1 - dist / (w * 0.35)) *
              (0.6 + Math.sin(time * 0.4 + i + j) * 0.4);

            ctx.strokeStyle = `rgba(59, 90, 130, ${connectionAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw node dots
      nodes.forEach((node, i) => {
        const nodePulse = 0.08 + Math.sin(time * 0.6 + i * 1.2) * 0.04;
        const nodeRadius = 2 + Math.sin(time * 0.4 + i) * 0.5;

        ctx.fillStyle = `rgba(59, 90, 130, ${nodePulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      time += 0.016;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
