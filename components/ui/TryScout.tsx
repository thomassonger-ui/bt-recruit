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
    label: "Write a listing presentation for 2413 Summerfield Rd, Winter Park FL 32789 — Tom Songer",
    prompt:
      "Write a listing presentation for 2413 Summerfield Road, Winter Park, Florida 32789 for Tom Songer",
    response: `LISTING PRESENTATION
2413 Summerfield Road, Winter Park, FL 32789
Prepared by Tom Songer | Bear Team Real Estate

PRICING STRATEGY
Based on 6 recent comparable sales within 0.5 miles, the data supports a list price of $589,000–$605,000. Homes in this pocket of Winter Park are averaging 97.2% of list price with 14 days on market when priced correctly at entry.

WHY THIS HOME WINS AT THIS PRICE
- Corner lot with mature oak canopy — rare in this subdivision
- Updated kitchen (2021) with quartz countertops and gas range
- 3 bed / 2.5 bath, 2,140 sq ft — priced $18/sqft below the street average
- New roof (2022) eliminates the #1 buyer objection before it starts

BEAR TEAM MARKETING PLAN
Week 1: Professional photography, 3D Matterport tour, MLS launch
Week 1–2: Targeted Facebook/Instagram campaign — Winter Park move-up buyers
Week 2: Open house Saturday 11am–2pm, sphere blast to 400+ contacts
Ongoing: Weekly seller updates, showing feedback within 24 hours

COMPARABLE SALES (Last 90 Days)
- 2388 Summerfield Rd — $572,000 | 18 DOM
- 1947 Howell Branch Rd — $598,500 | 11 DOM
- 2501 Fontaine Blvd — $615,000 | 9 DOM

NEXT STEP
Sign the listing agreement today and we go live Thursday. Inventory in this zip is down 22% year-over-year — buyers are ready.`,
  },
  {
    label: "Write a follow-up text to Marcus — showed 4 homes, went quiet for 3 days",
    prompt:
      "Write a follow-up text to Marcus — he toured 4 homes with me last Tuesday, said he needed to think, and hasn't responded in 3 days",
    response: `Hey Marcus — Tom here. Wanted to check in since we looked at those four homes last Tuesday.

Totally understand needing a few days to process — four properties in one afternoon is a lot to think through.

Quick heads up: the Delaney Park split-level (the one with the workshop garage you mentioned liking) had two showings this weekend. It's still available but it's getting attention.

No pressure at all — just wanted to make sure you had what you need to make a decision that feels right.

If it helps, I can pull a quick side-by-side of the top two and run the numbers on what each looks like at closing. Takes me 10 minutes.

Worth a call this week? I'm open Tuesday or Wednesday afternoon.

— Tom`,
  },
  {
    label: "Build my prospecting plan — I have 2 hours and 40 contacts to work through",
    prompt:
      "Build me a prospecting plan for today — I have 2 hours blocked and 40 contacts to work through. Mix of past clients, open house leads from last weekend, and a cold geo-farm list in Baldwin Park",
    response: `PROSPECTING PLAN — 2-Hour Block
40 Contacts | 3 Segments

SEGMENT 1 — Past Clients (10 contacts) | 35 minutes
Goal: Referral activation + equity check-in
Script opener: "Hey [Name], it's Tom — just checking in. You've been in your place about [X] years now. Values in your neighborhood have moved — wanted to make sure you had the latest numbers in case it ever comes up."
Target outcome: 2 referral conversations, 1 equity review booked

SEGMENT 2 — Open House Leads (15 contacts) | 45 minutes
Goal: Qualify and convert to showing appointments
Script opener: "Hi [Name], this is Tom Songer — you came through the open house on [address] this past weekend. Just wanted to follow up personally and see if that one was in the right direction for you."
Target outcome: 3 showings booked, 5 moved to nurture

SEGMENT 3 — Baldwin Park Geo-Farm (15 contacts) | 40 minutes
Goal: Brand awareness + off-market lead generation
Script opener: "Hi [Name], my name is Tom Songer with Bear Team Real Estate — I specialize in the Baldwin Park area and wanted to introduce myself. Are you planning on staying in the neighborhood long-term or keeping your options open?"
Target outcome: 1 listing conversation, 3 "call me in 6 months"

TRACK AS YOU GO
Hot (ready now): Schedule immediately
Warm (3–6 months): Set calendar follow-up
Cold (12+ months): Add to monthly email list`,
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
