"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface ScoutOption {
  label: string;
  prompt: string;
  response: string;
}

const OPTIONS: ScoutOption[] = [
  {
    label: "Write a listing description",
    prompt:
      "Write a listing description for a 3 bed 2 bath in Winter Park",
    response: `Welcome to this beautifully maintained 3-bedroom, 2-bathroom home in the heart of Winter Park. Step inside to find an open-concept living area with natural light flowing through every room. The updated kitchen features granite countertops, stainless steel appliances, and a breakfast bar that opens to the family room.

The primary suite offers a walk-in closet and an en-suite bathroom with dual vanities. Two additional bedrooms provide flexible space for a home office, guest room, or growing family.

Step outside to a spacious backyard with a covered patio -- perfect for entertaining year-round. Located minutes from Park Avenue shopping, dining, and top-rated schools.

Key Features:
- 1,850 sq ft living space
- Updated kitchen with modern finishes
- Covered patio with private backyard
- Two-car garage
- Walk to Park Avenue`,
  },
  {
    label: "Draft a follow-up message",
    prompt:
      "Draft a follow-up message to a buyer who visited a home yesterday",
    response: `Hi Sarah,

Thank you for taking the time to visit the Lake Nona property yesterday. I wanted to follow up and see how you're feeling about it.

Based on what you mentioned during the showing -- the open kitchen layout, the proximity to top-rated schools, and the backyard space for the kids -- I think this one checks a lot of your boxes.

I pulled a few comparable sales in the area so you can see where this home sits relative to recent transactions. Happy to walk through those numbers whenever you're ready.

If you'd like to schedule a second visit or if anything else caught your eye, just let me know. I'm here to help you make the best decision for your family.

Looking forward to hearing from you.`,
  },
  {
    label: "Organize my daily workflow",
    prompt:
      "Help me organize my prospecting and follow-up for today",
    response: `Here's your daily workflow for today:

Morning Block (8:00 - 10:00 AM)
- Review new leads from overnight inquiries
- Send follow-up messages to 3 active buyers from this week
- Confirm showing appointments for today and tomorrow

Midday Block (10:00 AM - 12:00 PM)
- Prospecting calls: 15 contacts from your sphere of influence
- Check MLS for new listings matching buyer criteria
- Update CRM notes from yesterday's showings

Afternoon Block (1:00 - 3:00 PM)
- Prepare listing presentation for Thursday consultation
- Review pending transaction checklist (Rivera closing March 28)
- Send weekly market update to your seller pipeline

End of Day (4:00 - 5:00 PM)
- Log all conversations and next steps in CRM
- Schedule tomorrow's priority tasks
- Review pending offers and counter deadlines`,
  },
];

const SMS_BODY = encodeURIComponent(
  "Hi, I just tried Scout on the site. Can you help me set it up for my listings?"
);

export default function TryScout() {
  const [selected, setSelected] = useState<ScoutOption | null>(null);
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");
  const [displayedText, setDisplayedText] = useState("");
  const [showConversion, setShowConversion] = useState(false);

  const generate = useCallback(
    (option: ScoutOption) => {
      if (state === "generating") return;
      setSelected(option);
      setState("generating");
      setDisplayedText("");
      setShowConversion(false);

      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(option.response.slice(0, i));
        i += 2;
        if (i > option.response.length) {
          setDisplayedText(option.response);
          clearInterval(interval);
          setState("done");
        }
      }, 8);

      return () => clearInterval(interval);
    },
    [state]
  );

  const reset = useCallback(() => {
    setSelected(null);
    setState("idle");
    setDisplayedText("");
    setShowConversion(false);
  }, []);

  useEffect(() => {
    if (state !== "done") return;
    const timeout = setTimeout(() => setShowConversion(true), 800);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Option selector or active prompt */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border-light)",
        }}
      >
        {/* Scout AI label */}
        <div className="mb-4 flex items-center gap-2">
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

        {/* Idle state — show 3 options */}
        {state === "idle" && (
          <div className="flex flex-col gap-3">
            <p
              className="mb-2 text-sm text-muted"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Choose a task to see Scout in action:
            </p>
            {OPTIONS.map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                onClick={() => generate(option)}
                className="flex items-center gap-3 rounded-xl px-5 py-4 text-left transition-all hover:shadow-md"
                style={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border-light)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
                <span className="text-sm font-medium text-foreground/80">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Generating / Done state — show prompt + output */}
        {selected && (state === "generating" || state === "done") && (
          <>
            <div className="mb-4">
              <p
                className="text-sm leading-relaxed text-foreground/80"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                &ldquo;{selected.prompt}&rdquo;
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--color-background)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
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

            {/* Try another */}
            {state === "done" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mt-4"
              >
                <button
                  onClick={reset}
                  className="text-xs font-medium text-muted transition-colors hover:text-foreground"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Try another task
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Conversion trigger */}
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
