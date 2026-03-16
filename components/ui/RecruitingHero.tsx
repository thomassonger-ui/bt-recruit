"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import Badge from "./Badge";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const highlights = [
  "Higher commission retention",
  "AI-powered real estate systems",
  "Structured agent training",
  "Real operational leadership",
];

export default function RecruitingHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Ambient light effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(63, 95, 138, 0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 80% at 20% 80%, rgba(59, 90, 130, 0.2) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Copy */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge variant="success">Now Recruiting in 15+ Markets</Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-display text-text-light"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Build a Real Estate Business — Not Just Another Job
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="max-w-lg text-base leading-relaxed text-text-light/70 sm:text-lg"
            >
              Join BearTeam Academy and build a scalable real estate business
              with training, systems, and operational support.
            </motion.p>

            <motion.ul variants={stagger} className="flex flex-col gap-3">
              {highlights.map((item) => (
                <motion.li
                  key={item}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 text-sm text-text-light/80"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="shrink-0"
                  >
                    <circle
                      cx="9"
                      cy="9"
                      r="9"
                      fill="#FFFFFF"
                      fillOpacity="0.12"
                    />
                    <path
                      d="M5.5 9.5L7.5 11.5L12.5 6.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <a href="sms:4077588102?body=Hello%20Tom,%20I%20would%20like%20to%20learn%20more%20about%20joining%20BearTeam.">
                <Button
                  variant="primary"
                  className="!bg-white !text-primary-dark hover:!bg-white/90 font-semibold !shadow-lg !px-6 !py-3"
                >
                  Schedule a Confidential Conversation
                </Button>
              </a>
              <p className="hidden text-sm text-text-light/70 sm:block">
                Text Tom at 407-758-8102
              </p>
              <a href="#advantage">
                <Button
                  variant="ghost"
                  className="!text-text-light !border !border-white/20 hover:!bg-white/10 !px-6 !py-3"
                >
                  See How BearTeam Works
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Right — Mock Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div
              className="overflow-hidden p-6"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-panel)",
                backdropFilter: "blur(12px)",
                boxShadow:
                  "0 24px 48px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Dashboard Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-medium uppercase tracking-wider text-text-light/50"
                    style={{ letterSpacing: "0.08em" }}
                  >
                    Agent Dashboard
                  </p>
                  <p
                    className="text-lg font-semibold text-text-light"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Your Production Overview
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              {/* Stats Row */}
              <div className="mb-6 grid grid-cols-3 gap-4">
                {[
                  { label: "YTD Closings", value: "24", delta: "+8 vs last year" },
                  { label: "Pipeline Value", value: "$3.2M", delta: "12 active deals" },
                  { label: "Commission", value: "$142K", delta: "+34% YoY" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "var(--radius-card)",
                    }}
                  >
                    <p className="text-xs text-text-light/50">{stat.label}</p>
                    <p
                      className="mt-1 text-xl font-bold text-text-light"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-400">{stat.delta}</p>
                  </div>
                ))}
              </div>

              {/* Training Modules */}
              <div className="mb-6">
                <p
                  className="mb-3 text-xs font-medium uppercase tracking-wider text-text-light/50"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Training Progress
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Lead Generation Mastery", progress: 100 },
                    { name: "Buyer Consultation System", progress: 75 },
                    { name: "Listing Presentation", progress: 40 },
                  ].map((mod) => (
                    <div key={mod.name} className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-text-light/80">{mod.name}</p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${mod.progress}%`,
                              background: "var(--gradient-accent)",
                            }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-text-light/60">
                        {mod.progress}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Pipeline */}
              <div>
                <p
                  className="mb-3 text-xs font-medium uppercase tracking-wider text-text-light/50"
                  style={{ letterSpacing: "0.08em" }}
                >
                  Recent Transactions
                </p>
                <div className="space-y-2">
                  {[
                    { address: "1420 Riverside Dr", status: "Closed", amount: "$485,000" },
                    { address: "302 Oak Hill Ln", status: "Under Contract", amount: "$372,000" },
                    { address: "8901 Summit View", status: "Listed", amount: "$529,000" },
                  ].map((tx) => (
                    <div
                      key={tx.address}
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "12px",
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium text-text-light/90">{tx.address}</p>
                        <p className="text-xs text-text-light/40">{tx.status}</p>
                      </div>
                      <p className="text-sm font-semibold text-text-light/80">{tx.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Glow effect behind card */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(63, 95, 138, 0.3) 0%, transparent 70%)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
