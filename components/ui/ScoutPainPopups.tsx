"use client";

import { useState, useEffect } from "react";

const PAIN_POINTS = [
  "Buried in paperwork instead of closing deals",
  "Pipeline runs dry between transactions",
  "Paying for tools that don't move the needle",
  "Lead costs keep climbing, ROI keeps shrinking",
  "Clients expect 24/7 — you can't be everywhere",
  "No two weeks look the same — zero predictability",
  "Fees go up, support stays missing",
];

// Each position is a safe zone in the hero — avoids center headline/CTA
// tail direction: "left" = tail on left side, "right" = tail on right side
const POSITIONS = [
  { top: "12%",  left: "2%",   tail: "left",  align: "left"  }, // top-left
  { top: "18%",  right: "2%",  tail: "right", align: "right" }, // top-right
  { top: "42%",  left: "1%",   tail: "left",  align: "left"  }, // mid-left
  { top: "55%",  right: "2%",  tail: "right", align: "right" }, // mid-right
  { top: "72%",  left: "3%",   tail: "left",  align: "left"  }, // lower-left
  { top: "68%",  right: "3%",  tail: "right", align: "right" }, // lower-right
  { top: "30%",  left: "2%",   tail: "left",  align: "left"  }, // upper-mid-left
];

interface Balloon {
  id: number;
  text: string;
  position: typeof POSITIONS[0];
  visible: boolean;
}

export default function ScoutPainPopups() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    let idCounter = 0;
    let painIndex = 0;
    let posIndex = 0;
    const active: number[] = [];

    function spawnBalloon() {
      const id = idCounter++;
      const text = PAIN_POINTS[painIndex % PAIN_POINTS.length];
      const position = POSITIONS[posIndex % POSITIONS.length];
      painIndex++;
      posIndex++;

      // Keep max 2 active at once
      if (active.length >= 2) return;
      active.push(id);

      setBalloons(prev => [...prev, { id, text, position, visible: false }]);

      // Trigger fade-in on next tick
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBalloons(prev =>
            prev.map(b => b.id === id ? { ...b, visible: true } : b)
          );
        });
      });

      // Fade out after 2.8s
      setTimeout(() => {
        setBalloons(prev =>
          prev.map(b => b.id === id ? { ...b, visible: false } : b)
        );
        // Remove from DOM after transition
        setTimeout(() => {
          setBalloons(prev => prev.filter(b => b.id !== id));
          const idx = active.indexOf(id);
          if (idx > -1) active.splice(idx, 1);
        }, 500);
      }, 2800);
    }

    // Start after 1.5s, then spawn every 2.2s (creates overlapping effect)
    const startTimer = setTimeout(() => {
      spawnBalloon();
      const interval = setInterval(spawnBalloon, 2200);
      return () => clearInterval(interval);
    }, 1500);

    return () => clearTimeout(startTimer);
  }, []);

  if (balloons.length === 0) return null;

  return (
    <>
      <style>{`
        .scout-balloon {
          position: absolute;
          z-index: 30;
          pointer-events: none;
          max-width: min(340px, 42vw);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .scout-balloon.show {
          opacity: 1;
          transform: translateY(0px);
        }
        .scout-balloon.hide {
          opacity: 0;
          transform: translateY(10px);
        }
        .scout-balloon-inner {
          position: relative;
          background: rgba(11, 28, 58, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(126, 184, 247, 0.18);
          border-radius: 16px;
          padding: 14px 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .scout-balloon-text {
          font-size: 0.92rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.90);
          line-height: 1.4;
          letter-spacing: -0.01em;
          font-family: Inter, -apple-system, sans-serif;
        }
        /* Tail — left side (points left) */
        .scout-balloon-tail-left {
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 10px solid rgba(11, 28, 58, 0.72);
        }
        /* Tail — right side (points right) */
        .scout-balloon-tail-right {
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 10px solid rgba(11, 28, 58, 0.72);
        }
        @media (max-width: 768px) {
          .scout-balloon {
            max-width: min(260px, 70vw);
          }
          .scout-balloon-text {
            font-size: 0.78rem;
          }
          .scout-balloon-inner {
            padding: 10px 14px;
          }
        }
        @media (max-width: 480px) {
          .scout-balloon {
            max-width: min(220px, 78vw);
          }
        }
      `}</style>

      {balloons.map(({ id, text, position, visible }) => {
        const style: React.CSSProperties = {
          top: position.top,
          ...(("left" in position) ? { left: (position as { left: string }).left } : {}),
          ...(("right" in position) ? { right: (position as { right: string }).right } : {}),
        };

        return (
          <div
            key={id}
            className={`scout-balloon ${visible ? "show" : "hide"}`}
            style={style}
            aria-hidden="true"
          >
            <div className="scout-balloon-inner">
              {position.tail === "left" && <div className="scout-balloon-tail-left" />}
              {position.tail === "right" && <div className="scout-balloon-tail-right" />}
              <span className="scout-balloon-text">{text}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
