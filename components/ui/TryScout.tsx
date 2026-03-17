"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

const GENERATED_LISTING = `Welcome to this beautifully maintained 3-bedroom, 2-bathroom home in the heart of Winter Park. Step inside to find an open-concept living area with natural light flowing through every room. The updated kitchen features granite countertops, stainless steel appliances, and a breakfast bar that opens to the family room.

The primary suite offers a walk-in closet and an en-suite bathroom with dual vanities. Two additional bedrooms provide flexible space for a home office, guest room, or growing family.

Step outside to a spacious backyard with a covered patio — perfect for entertaining year-round. Located minutes from Park Avenue shopping, dining, and top-rated schools.

Key Features:
• 1,850 sq ft living space
• Updated kitchen with modern finishes
• Covered patio with private backyard
• Two-car garage
• Walk to Park Avenue`;

const SMS_BODY = encodeURIComponent(
  "Hi, I just tried Scout on the site. Can you help me set it up for my listings?"
);

export default function TryScout() {
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const [displayedText, setDisplayedText] = useState("");
  const [showConversion, setShowConversion] = useState(false);

  const generate = useCallback(() => {
    if (state === "generating") return;
    setState("generating");
    setDisplayedText("");
    setShowConversion(false);

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(GENERATED_LISTING.slice(0, i));
      i += 2; // 2 chars at a time for speed
      if (i > GENERATED_LISTING.length) {
        setDisplayedText(GENERATED_LISTING);
        clearInterval(interval);
        setState("done");
      }
    }, 8);

    return () => clearInterval(interval);
  }, [state]);

  // Show conversion CTA after generation completes
  useEffect(() => {
    if (state !== "done") return;
    const timeout = setTimeout(() => setShowConversion(true), 800);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Input area */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border-light)",
        }}
      >
        {/* Prompt label */}
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground/60"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <span
            className="text-xs font-medium text-muted"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Scout AI
          </span>
        </div>

        {/* Prompt display */}
        <div className="mb-4">
          <p
            className="text-sm leading-relaxed text-foreground/80"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            &ldquo;Write a listing description for a 3 bed 2 bath in Winter
            Park&rdquo;
          </p>
        </div>

        {/* Generate button */}
        {state === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={generate}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{
                background: "var(--color-primary)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Generate
            </button>
          </motion.div>
        )}

        {/* Output area */}
        <AnimatePresence>
          {(state === "generating" || state === "done") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
              className="mt-4"
            >
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                {/* Status indicator */}
                <div className="mb-3 flex items-center gap-2">
                  {state === "generating" ? (
                    <>
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      <span
                        className="text-[10px] text-emerald-600"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Generating...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span
                        className="text-[10px] text-emerald-600"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        Complete
                      </span>
                    </>
                  )}
                </div>

                {/* Generated text */}
                <div
                  className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/70"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {displayedText}
                  {state === "generating" && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-foreground/40" />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conversion trigger — appears after generation completes */}
      <AnimatePresence>
        {showConversion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="mt-8 text-center"
          >
            <h3
              className="text-xl font-semibold text-foreground sm:text-2xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Want Scout working on your actual deals?
            </h3>
            <p
              className="mt-2 text-sm text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              We&apos;ll set it up for you and walk you through it.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a href={`sms:+18444072587?body=${SMS_BODY}`}>
                <Button variant="primary" className="!px-6 !py-3 !text-sm">
                  Text Me Scout
                </Button>
              </a>
              <a
                href={`https://m.me/bearteamfl?text=${SMS_BODY}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button
                  className="rounded-lg px-6 py-3 text-sm font-medium transition-colors"
                  style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border-light)",
                    color: "var(--color-foreground)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Continue in Messenger
                </button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
