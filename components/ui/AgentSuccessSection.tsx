"use client";

import React from "react";
import { motion } from "framer-motion";
import Badge from "./Badge";

interface SuccessCard {
  agentType: string;
  badgeVariant: "primary" | "success" | "warning" | "muted";
  metric: string;
  metricLabel: string;
  quote: string;
  name: string;
  initials: string;
}

const successStories: SuccessCard[] = [
  {
    agentType: "New Agent",
    badgeVariant: "success",
    metric: "6",
    metricLabel: "Transactions in Year One",
    quote:
      "I came in with zero experience and closed 6 deals my first year using BearTeam's lead gen and training systems. The onboarding gave me a real business — not just a license.",
    name: "Marcus Chen",
    initials: "MC",
  },
  {
    agentType: "Experienced Agent",
    badgeVariant: "primary",
    metric: "+41%",
    metricLabel: "Net Income Increase",
    quote:
      "I was at a big-box brokerage paying fees that didn't make sense. Switching to BearTeam cut my overhead and gave me better tools. My net income jumped 41% in the first year.",
    name: "Dana Kowalski",
    initials: "DK",
  },
  {
    agentType: "Team Builder",
    badgeVariant: "warning",
    metric: "4",
    metricLabel: "Agents on Her Team",
    quote:
      "BearTeam Academy gave me the leadership framework I needed. Within 18 months I built a 4-person production team — all using the same systems I learned on day one.",
    name: "Jasmine Okafor",
    initials: "JO",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function AgentSuccessSection({ className = "" }: { className?: string }) {
  return (
    <section className={`px-4 py-16 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <Badge variant="muted" className="mb-4">Proof, Not Promises</Badge>
          <h2
            className="text-heading mb-4 text-foreground"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Real Agents. Real Results.
          </h2>
          <p className="mx-auto max-w-2xl text-muted">
            See how agents at every stage are building real businesses with BearTeam systems.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {successStories.map((story, i) => (
            <motion.div
              key={story.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="surface-card group flex flex-col p-6 transition-shadow duration-300"
            >
              {/* Top — Badge + Metric */}
              <div className="mb-5 flex items-start justify-between">
                <Badge variant={story.badgeVariant}>{story.agentType}</Badge>
                <div className="text-right">
                  <p
                    className="text-3xl font-bold text-primary"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {story.metric}
                  </p>
                  <p className="text-xs text-muted">{story.metricLabel}</p>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="mb-6 flex-1 text-sm leading-relaxed text-muted">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              {/* Attribution */}
              <div className="flex items-center gap-3 border-t border-muted/10 pt-4">
                {/* Avatar placeholder */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  aria-hidden="true"
                >
                  {story.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{story.name}</p>
                  <p className="text-xs text-muted">{story.agentType} &middot; BearTeam</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
