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

export default function ScoutPainPopups() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let current = 0;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let startTimer: ReturnType<typeof setTimeout>;

    function showNext() {
      setActiveIndex(current);
      setVisible(true);

      // Hide after 2.6s
      hideTimer = setTimeout(() => {
        setVisible(false);
        // Move to next after fade-out (0.4s)
        showTimer = setTimeout(() => {
          current = (current + 1) % PAIN_POINTS.length;
          showNext();
        }, 400);
      }, 2600);
    }

    // Start after 1.4s delay
    startTimer = setTimeout(showNext, 1400);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (activeIndex === null) return null;

  return (
    <>
      <style>{`
        .pain-popup {
          position: absolute;
          bottom: clamp(80px, 14vh, 130px);
          left: clamp(16px, 4vw, 48px);
          z-index: 40;
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 18px;
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
          max-width: min(280px, calc(100vw - 32px));
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .pain-popup.show {
          opacity: 1;
          transform: translateY(0px);
        }
        .pain-popup.hide {
          opacity: 0;
          transform: translateY(6px);
        }
        .pain-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #7eb8f7;
          flex-shrink: 0;
          opacity: 0.9;
        }
        .pain-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.82);
          letter-spacing: 0.01em;
          line-height: 1.3;
          font-family: Inter, -apple-system, sans-serif;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .pain-popup {
            bottom: clamp(60px, 10vh, 90px);
            left: 16px;
            right: 16px;
            max-width: none;
            padding: 10px 14px;
          }
          .pain-text {
            font-size: 0.75rem;
          }
        }
      `}</style>
      <div className={`pain-popup ${visible ? "show" : "hide"}`} aria-hidden="true">
        <div className="pain-dot" />
        <span className="pain-text">{PAIN_POINTS[activeIndex]}</span>
      </div>
    </>
  );
}
