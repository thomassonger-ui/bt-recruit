"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BearTeamLogo from "@/components/ui/BearTeamLogo";

interface NavbarProps {
  brand?: string;
  children?: React.ReactNode;
  variant?: "dark" | "light";
}

export default function Navbar({ children, variant = "dark" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLight = variant === "light";

  return (
    <nav
      className="relative px-6 py-4"
      style={{
        background: isLight ? "transparent" : "var(--color-card)",
        borderBottom: isLight ? "none" : "1px solid var(--color-border-light)",
        boxShadow: isLight ? "none" : "0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="/" aria-label="BearTeam Home">
          <BearTeamLogo size="md" variant={variant} />
        </a>

        {/* Desktop nav */}
        {children && (
          <div className="hidden items-center gap-6 md:flex">{children}</div>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-background md:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.svg
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.15 }}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 5L15 15M15 5L5 15"
                  stroke={isLight ? "white" : "currentColor"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.15 }}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 5H17M3 10H17M3 15H17"
                  stroke={isLight ? "white" : "currentColor"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden md:hidden"
          >
            <div
              className="mx-auto flex max-w-7xl flex-col gap-1 pb-2 pt-4"
              onClick={() => setMobileOpen(false)}
              role="presentation"
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
