"use client";

import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const features = [
  {
    title: "Deal analysis",
    description:
      "Evaluate comparable properties, estimate closing timelines, and identify risks before they surface.",
  },
  {
    title: "Listing preparation",
    description:
      "Generate property descriptions, pricing recommendations, and marketing copy in seconds.",
  },
  {
    title: "Market insights",
    description:
      "Access real-time market data, absorption rates, and neighborhood trends on demand.",
  },
  {
    title: "Production tracking",
    description:
      "Monitor pipeline health, forecast income, and stay ahead of your quarterly goals.",
  },
];

export default function ScoutSection({ className = "" }: { className?: string }) {
  return (
    <section className={`px-4 py-24 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Copy */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <p
              className="text-sm font-medium uppercase tracking-wider text-muted"
              style={{ letterSpacing: "0.08em" }}
            >
              AI-Powered
            </p>
            <h2
              className="text-heading text-foreground"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Meet Scout
            </h2>
            <p className="max-w-lg text-lg leading-relaxed text-muted">
              Scout is the BearTeam AI assistant designed to help agents move
              faster and make better decisions. Available to every agent from
              day one.
            </p>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex flex-col gap-2"
                >
                  <h3
                    className="text-sm font-semibold text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Chat UI */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div
              className="overflow-hidden"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-panel)",
                boxShadow: "var(--shadow-elevated)",
              }}
            >
              {/* Chat header */}
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderBottom: "1px solid var(--color-border-light)" }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  S
                </div>
                <div>
                  <p
                    className="text-sm font-medium text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Scout
                  </p>
                  <p className="text-xs text-muted">Online</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex flex-col gap-4 p-6">
                {/* User message */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-text-light)",
                    }}
                  >
                    What should I price 4210 Elm Street at?
                  </div>
                </div>

                {/* Scout response */}
                <div className="flex justify-start">
                  <div
                    className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed text-foreground"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    Based on 6 comparable sales within 0.5 miles, I recommend
                    listing at <strong>$415,000–$425,000</strong>. The median
                    price per sqft in this area is $187, and days on market
                    average 22 days at this range.
                  </div>
                </div>

                {/* User follow-up */}
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-text-light)",
                    }}
                  >
                    Draft the listing description.
                  </div>
                </div>

                {/* Scout typing indicator */}
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-1 rounded-2xl rounded-bl-md px-4 py-3"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>

              {/* Chat input */}
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderTop: "1px solid var(--color-border-light)" }}
              >
                <div
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm text-muted"
                  style={{
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border-light)",
                  }}
                >
                  Ask Scout anything...
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
