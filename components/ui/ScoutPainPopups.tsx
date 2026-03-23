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

const SLOTS = [
  { top: "8%",  right: "2%" },
  { top: "16%", right: "2%" },
  { top: "24%", right: "2%" },
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
    let intervalRef: ReturnType<typeof setInterval> | null = null;

    function spawnBalloon() {
      // All pain points shown — stop completely
      if (painIdx >= PAIN_POINTS.length) {
        if (intervalRef) clearInterval(intervalRef);
        return;
      }

      if (occupiedSlots.size >= 1) return;

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
      const text = PAIN_POINTS[painIdx];
      painIdx++;

      setBalloons(prev => [...prev, { id, text, slotIndex, visible: false }]);

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
        setTimeout(() => {
          setBalloons(prev => prev.filter(b => b.id !== id));
          occupiedSlots.delete(slotIndex);
        }, 500);
      }, 2800);
    }

    const start = setTimeout(() => {
      spawnBalloon();
      intervalRef = setInterval(spawnBalloon, 3400);
    }, 1400);

    return () => {
      clearTimeout(start);
      if (intervalRef) clearInterval(intervalRef);
    };
  }, []);

  if (balloons.length === 0) return null;

  return (
    <>
      <style>{`
        .spb {
          position: absolute;
          z-index: 25;
          pointer-events: none;
          width: clamp(220px, 24vw, 380px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .spb.show { opacity: 1; transform: translateY(0); }
        .spb.hide { opacity: 0; transform: translateY(8px); }
        .spb-inner {
          position: relative;
          background: rgba(8, 20, 46, 0.85);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(126, 184, 247, 0.20);
          border-radius: 16px;
          padding: 18px 22px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.55);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .spb-inner::after {
          content: "";
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          border: 9px solid transparent;
          border-right-color: rgba(8, 20, 46, 0.85);
          border-left: 0;
        }
        .spb-text {
          font-size: clamp(0.95rem, 1.4vw, 1.15rem);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.92);
          line-height: 1.45;
          letter-spacing: -0.01em;
          font-family: Inter, -apple-system, sans-serif;
          display: block;
          white-space: normal;
          word-break: break-word;
        }
        @media (max-width: 767px) {
          .spb { display: none; }
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
