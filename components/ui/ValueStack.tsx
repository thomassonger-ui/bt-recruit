"use client";

import React from "react";
import { motion } from "framer-motion";
import Badge from "./Badge";

interface ValueItem {
  badge: string;
  badgeVariant: "primary" | "success" | "warning" | "muted";
  title: string;
  description: string;
  visualCards: {
    label: string;
    value: string;
    sublabel?: string;
  }[];
  visualTitle: string;
  visualIcon: string;
}

const valueItems: ValueItem[] = [
  {
    badge: "Production",
    badgeVariant: "success",
    title: "Systems That Drive Real Production",
    description:
      "Stop guessing what works. BearTeam agents get access to proven lead generation, CRM automations, and follow-up sequences that convert. Our top agents close 30+ transactions per year because the systems do the heavy lifting.",
    visualTitle: "Production Dashboard",
    visualIcon: "📈",
    visualCards: [
      { label: "Avg. Transactions / Year", value: "24", sublabel: "Top quartile" },
      { label: "Lead Conversion Rate", value: "18%", sublabel: "Industry avg: 2%" },
      { label: "Avg. Days to Close", value: "31", sublabel: "From contract" },
      { label: "Pipeline Accuracy", value: "92%", sublabel: "Forecast reliability" },
    ],
  },
  {
    badge: "Training",
    badgeVariant: "primary",
    title: "Academy-Level Training From Day One",
    description:
      "BearTeam Academy is a 12-week structured program that turns new agents into confident closers and experienced agents into team leaders. Live coaching, on-demand modules, and a dedicated mentor — not a webinar and a handshake.",
    visualTitle: "Academy Modules",
    visualIcon: "🎓",
    visualCards: [
      { label: "Week 1–3", value: "Foundation", sublabel: "Scripts, CRM, prospecting" },
      { label: "Week 4–6", value: "Execution", sublabel: "Live deals, objections" },
      { label: "Week 7–9", value: "Scaling", sublabel: "Listings, referrals, SOI" },
      { label: "Week 10–12", value: "Leadership", sublabel: "Team building, planning" },
    ],
  },
  {
    badge: "Operations",
    badgeVariant: "warning",
    title: "Operational Support That Removes Friction",
    description:
      "Transaction coordination, compliance, marketing assets, and listing support — all handled. You focus on clients and closings while our operations team handles everything behind the scenes. No more late nights on paperwork.",
    visualTitle: "Operations Hub",
    visualIcon: "🛠️",
    visualCards: [
      { label: "Transaction Coordination", value: "100%", sublabel: "Fully managed" },
      { label: "Marketing Assets", value: "50+", sublabel: "Ready to deploy" },
      { label: "Compliance Reviews", value: "48hr", sublabel: "Turnaround time" },
      { label: "Listing Support", value: "24/7", sublabel: "Photo, copy, launch" },
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

function VisualPanel({ item }: { item: ValueItem }) {
  return (
    <div
      className="relative overflow-hidden p-6"
      style={{
        background: "var(--gradient-hero)",
        borderRadius: "var(--radius-panel)",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative">
        {/* Panel header */}
        <div className="mb-5 flex items-center gap-3">
          <span className="text-2xl">{item.visualIcon}</span>
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wider text-text-light/50"
              style={{ letterSpacing: "0.08em" }}
            >
              {item.visualTitle}
            </p>
          </div>
        </div>

        {/* Stat cards grid */}
        <div className="grid grid-cols-2 gap-3">
          {item.visualCards.map((card) => (
            <div
              key={card.label}
              className="p-4"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius-card)",
              }}
            >
              <p
                className="text-xs text-text-light/50"
                style={{ letterSpacing: "0.02em" }}
              >
                {card.label}
              </p>
              <p
                className="mt-1 text-xl font-bold text-text-light"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {card.value}
              </p>
              {card.sublabel && (
                <p className="mt-0.5 text-xs text-text-light/40">{card.sublabel}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ValueStack({ className = "" }: { className?: string }) {
  return (
    <section className={`px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <Badge variant="primary" className="mb-4">
            The BearTeam Difference
          </Badge>
          <h2
            className="text-heading mb-4 text-foreground"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Why Top Agents Choose BearTeam
          </h2>
          <p className="mx-auto max-w-2xl text-muted">
            Three pillars that separate BearTeam agents from everyone else —
            production systems, real training, and operational support that
            actually works.
          </p>
        </motion.div>

        {/* Stacked value sections */}
        <div className="flex flex-col gap-20 lg:gap-28">
          {valueItems.map((item, i) => {
            const isReversed = i % 2 === 1;
            return (
              <motion.div
                key={item.title}
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  isReversed ? "lg:direction-rtl" : ""
                }`}
              >
                {/* Visual panel */}
                <div
                  className={`${isReversed ? "lg:order-2" : "lg:order-1"}`}
                >
                  <VisualPanel item={item} />
                </div>

                {/* Text content */}
                <div
                  className={`flex flex-col gap-5 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <Badge variant={item.badgeVariant}>{item.badge}</Badge>
                  <h3
                    className="text-subheading text-foreground"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-muted">
                    {item.description}
                  </p>
                  {/* Subtle divider + learn more hint */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-px flex-1 bg-border" />
                    <a
                      href="#apply"
                      className="text-sm font-medium text-primary transition-colors hover:text-primary-dark"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Learn more &rarr;
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
