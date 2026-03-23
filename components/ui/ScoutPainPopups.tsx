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

// All slots on the RIGHT side only — staggered vertically
// tail always points left (toward center content)
const SLOTS = [
  { top: "10%", right: "2%" },
  { top: "28%", right: "2%" },
  { top: "46%", right: "2%" },
  { top: "64%", right: "2%" },
  { top: "78%", right: "2%" },
];

interface Balloon {
  id: number;
  text: string;
  slotIndex: number;
  visible: boolean;
}

export default function ScoutPainPopups() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    let idCounter = 0;
    let painIdx = 0;
    let slotIdx = 0;
    const occupiedSlots = new Set<number>();

    function spawnBalloon() {
      if (occupiedSlots.size >= 2) return;

      // Find next unoccupied slot
      let slotIndex = slotIdx % SLOTS.length;
      let tries = 0;
      while (occupiedSlots.has(slotIndex) && tries < SLOTS.length) {
        slotIdx++;
        slotIndex = slotIdx % SLOTS.length;
        tries++;
      }
      slotIdx++;
      occupiedSlots.add(slotIndex);

      const id = idCounter++;
      const text = PAIN_POINTS[painIdx % PAIN_POINTS.length];
      painIdx++;

      setBalloons(prev => [...prev, { id, text, slotIndex, visible: false }]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBalloons(prev =>
            prev.map(b => b.id === id ? { ...b, visible: true } : b)
          );
        });
      });

      // Fade out after 3s
      setTimeout(() => {
        setBalloons(prev =>
          prev.map(b => b.id === id ? { ...b, visible: false } : b)
        );
        setTimeout(() => {
          setBalloons(prev => prev.filter(b => b.id !== id));
          occupiedSlots.delete(slotIndex);
        }, 500);
      }, 3000);
    }

    const start = setTimeout(() => {
      spawnBalloon();
      const interval = setInterval(spawnBalloon, 2400);
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
          width: clamp(260px, 28vw, 420px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .spb.show { opacity: 1; transform: translateY(0); }
        .spb.hide { opacity: 0; transform: translateY(10px); }

        .spb-inner {
          position: relative;
          background: rgba(8, 20, 46, 0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(126, 184, 247, 0.20);
          border-radius: 18px;
          padding: 20px 26px;
          box-shadow: 0 20px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .spb-text {
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.45;
          letter-spacing: -0.015em;
          font-family: Inter, -apple-system, sans-serif;
          display: block;
          white-space: normal;
          word-break: break-word;
        }
        /* Tail pointing LEFT (toward center) */
        .spb-inner::after {
          content: "";
          position: absolute;
          left: -11px;
          top: 50%;
          transform: translateY(-50%);
          border: 10px solid transparent;
          border-right-color: rgba(8, 20, 46, 0.82);
          border-left: 0;
        }

        @media (max-width: 767px) {
          .spb {
            width: clamp(200px, 60vw, 300px);
          }
          .spb-text {
            font-size: 0.9rem;
          }
          .spb-inner {
            padding: 14px 18px;
          }
        }
      `}</style>

      {balloons.map(({ id, text, slotIndex, visible }) => {
        const slot = SLOTS[slotIndex];
        return (
          <div
            key={id}
            className={`spb ${visible ? "show" : "hide"}`}
            style={{ top: slot.top, right: slot.right }}
            aria-hidden="true"
          >
            <div className="spb-inner">
              <span className="spb-text">{text}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
