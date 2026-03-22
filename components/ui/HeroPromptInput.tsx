"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const quickPrompts = [
  "What would I net at Bear Team vs where I am now?",
  "I'm at KW and I never hit my cap — is that normal?",
  "What does it actually cost to join Bear Team?",
  "How does the $16K cap work?",
  "I just got my license — is Bear Team a good first home?",
]

const simulatedResponses: Record<string, string> = {
  "What would I net at Bear Team vs where I am now?":
    "At 8 deals and a $415K average, you'd net approximately $66,975 at Bear Team after splits and the $150 flat fee — with zero monthly costs. Most agents at KW in that range net around $64,000 after fees. Bear Team wins year 1, and year 2 you start at Tier 2 automatically.",
  "I'm at KW and I never hit my cap — is that normal?":
    "Very normal. Most KW agents doing 6–14 deals per year never hit their cap. You pay the full 70/30 + 6% royalty all year, reset, and pay it again. That's the cap treadmill. Bear Team's $16K cap is a graduation trigger — once the broker collects $16K, your split improves automatically. No reset.",
  "What does it actually cost to join Bear Team?":
    "Zero upfront. Zero monthly fees. Zero desk fees. Zero tech fees. E&O insurance is covered by Bear Team. Your only cost is a flat $150 per closing — same whether the deal is $200K or $2M. That's it.",
  "How does the $16K cap work?":
    "The $16K cap is a graduation trigger, not a ceiling. Once Bear Team collects $16K from your deals, you automatically promote to the next tier — 70/30. Keep producing and you move to 80/20, then 90/10. The brokerage earns at every tier. You just keep more as you grow.",
  "I just got my license — is Bear Team a good first home?":
    "Bear Team is one of the best first moves you can make. Zero monthly fees means a slow month costs you nothing. BearTeam Academy covers everything: commission structure, transaction workflow, and compliance — free and self-paced. And Scout is here for questions anytime.",
}

export default function HeroPromptInput() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSubmit = (prompt: string) => {
    const text = prompt || input
    if (!text.trim()) return

    setInput(text)
    setResponse("")
    setIsTyping(true)

    const answer =
      simulatedResponses[text] ||
      "Scout can help with that. Try the full experience to get a real-time AI response tailored to your situation."

    let i = 0
    const interval = setInterval(() => {
      i++
      setResponse(answer.slice(0, i))
      if (i >= answer.length) {
        clearInterval(interval)
        setIsTyping(false)
      }
    }, 14)
  }

  return (
    <div className="w-full max-w-full sm:max-w-xl">
      {/* Input field */}
      <div
        className="flex items-center gap-2 rounded-xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(160,175,195,0.15)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit("")
          }}
          placeholder="Ask Scout about splits, fees, or joining Bear Team..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-white/40 outline-none"
          style={{ fontFamily: "Inter, sans-serif", color: "#ffffff" }}
        />
        <button
          onClick={() => handleSubmit("")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80 sm:h-8 sm:w-8"
          style={{ background: "var(--color-primary)" }}
          aria-label="Send prompt"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Quick prompt pills */}
      <div className="mt-3 flex flex-wrap gap-2" style={{ maxWidth: "100%" }}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSubmit(prompt)}
            className="rounded-lg px-3 py-1.5 text-xs transition-all text-left leading-snug"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#ffffff",
              fontFamily: "Inter, sans-serif",
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.14)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.30)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Simulated response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(160,175,195,0.1)",
              color: "#ffffff",
              fontFamily: "Inter, sans-serif",
            }}
          >
            <div className="mb-1 flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                style={{ background: "var(--color-primary)" }}
              >
                S
              </div>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Scout</span>
              {isTyping && (
                <span className="inline-flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1 w-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.45)" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
            {response}
            {isTyping && (
              <motion.span
                className="ml-0.5 inline-block h-3.5 w-[2px] align-text-bottom"
                style={{ background: "var(--color-primary)" }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

