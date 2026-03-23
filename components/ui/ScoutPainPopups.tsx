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

// Safe zone = protected center of hero (20%–80% horizontal, 15%–85% vertical)
// Balloons are ONLY placed OUTSIDE this zone.
// 8 pre-validated slots — each anchored to a corner/edge outside the safe zone.
// tail: which side the speech arrow points toward (toward center)
const SLOTS = [
  // TOP ROW — above safe zone (top < 15%)
  { top: "4%",  left: "1%",   maxW: 280, tail: "bottom-left"  },
  { top: "6%",  right: "1%",  maxW: 280, tail: "bottom-right" },
  // LEFT COLUMN — left of safe zone (left < 20%), mid-height
  { top: "30%", left: "0%",   maxW: 240, tail: "right"        },
  { top: "52%", left: "0%",   maxW: 240, tail: "right"        },
  // RIGHT COLUMN — right of safe zone (right < 20%), mid-height
  { top: "28%", right: "0%",  maxW: 240, tail: "left"         },
  { top: "54%", right: "0%",  maxW: 240, tail: "left"         },
  // BOTTOM ROW — below safe zone (top > 85%)
  { top: "87%", left: "1%",   maxW: 280, tail: "top-left"     },
  { top: "87%", right: "1%",  maxW: 280, tail: "top-right"    },
];

// Mobile: only use bottom-left and bottom-right slots (index 6, 7)
// to avoid any overlap with headline/CTA on small screens
const MOBILE_SLOTS = [6, 7];

interface Balloon {
  id: number;
  text: string;
  slotIndex: number;
  visible: boolean;
}

export default function ScoutPainPopups() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let idCounter = 0;
    let painIdx = 0;
    let slotIdx = 0;
    // Track which slots are currently occupied
    const occupiedSlots = new Set<number>();

    function getNextSlot(mobile: boolean): number {
      const pool = mobile ? MOBILE_SLOTS : SLOTS.map((_, i) => i);
      // Find a slot not currently occupied
      for (let attempt = 0; attempt < pool.length; attempt++) {
        const candidate = pool[slotIdx % pool.length];
        slotIdx++;
        if (!occupiedSlots.has(candidate)) return candidate;
      }
      // All occupied — use any slot (rare with max 2 balloons)
      return pool[slotIdx % pool.length];
    }

    function spawnBalloon() {
      // Never show more than 2 at once
      if (occupiedSlots.size >= 2) return;

      const id = idCounter++;
      const text = PAIN_POINTS[painIdx % PAIN_POINTS.length];
      painIdx++;

      const mobile = window.innerWidth < 768;
      const slotIndex = getNextSlot(mobile);
      occupiedSlots.add(slotIndex);

      setBalloons(prev => [...prev, { id, text, slotIndex, visible: false }]);

      // Trigger CSS transition on next paint
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
        // Remove from DOM + free slot after transition (0.5s)
        setTimeout(() => {
          setBalloons(prev => prev.filter(b => b.id !== id));
          occupiedSlots.delete(slotIndex);
        }, 500);
      }, 2800);
    }

    // Initial delay, then spawn every 2.2s
    const start = setTimeout(() => {
      spawnBalloon();
      const interval = setInterval(spawnBalloon, 2200);
      return () => clearInterval(interval);
    }, 1400);

    return () => clearTimeout(start);
  }, []);

  if (balloons.length === 0) return null;

  return (
    <>
      <style>{`
        .spb {
          position: absolute;
          z-index: 25;
          pointer-events: none;
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .spb.show { opacity: 1; transform: translateY(0); }
        .spb.hide { opacity: 0; transform: translateY(8px); }

        .spb-inner {
          position: relative;
          background: rgba(8, 20, 46, 0.78);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(126, 184, 247, 0.16);
          border-radius: 14px;
          padding: 13px 18px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
        }
        .spb-text {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          line-height: 1.4;
          letter-spacing: -0.01em;
          font-family: Inter, -apple-system, sans-serif;
          white-space: nowrap;
        }

        /* Tails */
        .spb-tail-right::after {
          content: "";
          position: absolute;
          right: -9px; top: 50%;
          transform: translateY(-50%);
          border: 8px solid transparent;
          border-left-color: rgba(8,20,46,0.78);
          border-right: 0;
        }
        .spb-tail-left::after {
          content: "";
          position: absolute;
          left: -9px; top: 50%;
          transform: translateY(-50%);
          border: 8px solid transparent;
          border-right-color: rgba(8,20,46,0.78);
          border-left: 0;
        }
        .spb-tail-bottom-left::after {
          content: "";
          position: absolute;
          bottom: -9px; left: 20px;
          border: 8px solid transparent;
          border-top-color: rgba(8,20,46,0.78);
          border-bottom: 0;
        }
        .spb-tail-bottom-right::after {
          content: "";
          position: absolute;
          bottom: -9px; right: 20px;
          border: 8px solid transparent;
          border-top-color: rgba(8,20,46,0.78);
          border-bottom: 0;
        }
        .spb-tail-top-left::after {
          content: "";
          position: absolute;
          top: -9px; left: 20px;
          border: 8px solid transparent;
          border-bottom-color: rgba(8,20,46,0.78);
          border-top: 0;
        }
        .spb-tail-top-right::after {
          content: "";
          position: absolute;
          top: -9px; right: 20px;
          border: 8px solid transparent;
          border-bottom-color: rgba(8,20,46,0.78);
          border-top: 0;
        }

        @media (max-width: 767px) {
          .spb-text { font-size: 0.75rem; white-space: normal; }
          .spb-inner { padding: 10px 14px; border-radius: 12px; }
        }
      `}</style>

      {balloons.map(({ id, text, slotIndex, visible }) => {
        const slot = SLOTS[slotIndex];
        const posStyle: React.CSSProperties = {
          top: slot.top,
          maxWidth: `min(${slot.maxW}px, 44vw)`,
          ...("left" in slot ? { left: (slot as { left: string } & typeof slot).left } : {}),
          ...("right" in slot ? { right: (slot as { right: string } & typeof slot).right } : {}),
        };

        return (
          <div
            key={id}
            className={`spb ${visible ? "show" : "hide"}`}
            style={posStyle}
            aria-hidden="true"
          >
            <div className={`spb-inner spb-tail-${slot.tail}`}>
              <span className="spb-text">{text}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
