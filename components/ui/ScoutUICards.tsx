"use client";

import React, { useState, useEffect, useRef } from "react";

/* ── Base Card Wrapper ── */
const CardWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-[340px] w-[260px] flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white/90 p-4 shadow-xl backdrop-blur-md">
    {children}
  </div>
);

/* ── 1. Listing Assistant — Typing Effect ── */
export const ListingCard = () => {
  const [text, setText] = useState("");
  const fullText =
    "Beautifully maintained home featuring an open floor plan, updated kitchen, and spacious backyard ideal for entertaining...";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let i = 0;
    intervalRef.current = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 20);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <CardWrapper>
      <div className="text-xs text-gray-500">Scout AI</div>
      <div className="text-sm font-semibold text-gray-900">
        Write a listing description
      </div>
      <div className="rounded-md bg-gray-100 p-2 text-xs text-gray-600">
        3 bed • 2 bath • Lake Nona
      </div>
      <div className="min-h-[80px] text-xs leading-relaxed text-gray-700">
        {text}
        <span className="inline-block h-3 w-0.5 animate-pulse bg-gray-400" />
      </div>
      <div className="flex flex-wrap gap-1 text-[10px]">
        <span className="rounded bg-gray-200 px-2 py-1">Pool</span>
        <span className="rounded bg-gray-200 px-2 py-1">Renovated</span>
      </div>
    </CardWrapper>
  );
};

/* ── 2. Client Communication — Typing + Delay ── */
export const CommunicationCard = () => {
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowReply(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <CardWrapper>
      <div className="text-xs text-gray-500">Scout Chat</div>
      <div className="self-start rounded-lg rounded-bl-none bg-gray-200 p-2.5 text-xs text-gray-700">
        Loved the home—what are next steps?
      </div>
      {showReply ? (
        <div className="self-end rounded-lg rounded-br-none bg-blue-500 p-2.5 text-xs text-white">
          Let&apos;s review comps and prepare an offer strategy.
        </div>
      ) : (
        <div className="flex items-center gap-1 self-end py-2">
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}
      <div className="mt-auto text-[10px] text-gray-400">
        AI-assisted response
      </div>
    </CardWrapper>
  );
};

/* ── 3. Marketing Assistant — Fade-in ── */
export const MarketingCard = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <CardWrapper>
      <div className="text-xs text-gray-500">Social Post</div>
      <div className="text-sm font-semibold text-gray-900">Just Listed</div>
      <div
        className="text-xs leading-relaxed text-gray-700 transition-opacity duration-700"
        style={{ opacity: visible ? 1 : 0 }}
      >
        Stunning 4BR home with modern finishes, gourmet kitchen, and resort-style
        pool in the heart of Winter Park.
      </div>
      <div className="rounded-md bg-gray-100 p-2 text-xs text-gray-500">
        #JustListed #OrlandoRealEstate
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        Ready to publish
      </div>
    </CardWrapper>
  );
};

/* ── 4. Showing Assistant — Staggered List ── */
export const ShowingCard = () => {
  const items = ["Updated kitchen with quartz counters", "Top-rated school district", "Low HOA — $175/mo", "New roof installed 2024"];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= items.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <CardWrapper>
      <div className="text-xs text-gray-500">Showing Prep</div>
      <div className="text-sm font-semibold text-gray-900">
        Key Talking Points
      </div>
      <ul className="flex flex-col gap-1.5 text-xs">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 transition-all duration-300"
            style={{
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto text-[10px] text-gray-400">
        4 points generated
      </div>
    </CardWrapper>
  );
};

/* ── 5. Workflow Assistant — Pipeline Animation ── */
export const WorkflowCard = () => {
  const [active, setActive] = useState(0);
  const steps = ["Lead", "Showing", "Offer", "Closing"];

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <CardWrapper>
      <div className="text-xs text-gray-500">Pipeline</div>
      <div className="text-sm font-semibold text-gray-900">Daily Workflow</div>
      <div className="flex flex-col gap-1.5">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-md p-2.5 text-xs transition-all duration-300"
            style={{
              background: i === active ? "#3B5A82" : "#F3F4F6",
              color: i === active ? "#FFFFFF" : "#374151",
              transform: i === active ? "scale(1.02)" : "scale(1)",
            }}
          >
            <span className="flex items-center justify-between">
              {step}
              {i < active && (
                <span className="text-[10px] text-green-500">✓</span>
              )}
              {i === active && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto text-[10px] text-gray-400">
        Step {active + 1} of {steps.length}
      </div>
    </CardWrapper>
  );
};
