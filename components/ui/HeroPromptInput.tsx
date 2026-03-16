"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const quickPrompts = [
  "Write a listing description for a 3-bedroom home in Winter Park",
  "Create a social media post for a new listing",
  "Draft a follow-up message to a buyer",
]

const simulatedResponses: Record<string, string> = {
  "Write a listing description for a 3-bedroom home in Winter Park":
    "Elegant 3-bedroom residence in the heart of Winter Park featuring updated interiors, natural light throughout, and a spacious backyard ideal for entertaining. Move-in ready with modern finishes and a prime location near shops and dining.",
  "Create a social media post for a new listing":
    "Just listed! Beautiful home with modern finishes and a private backyard perfect for entertaining. Priced to move. Message me for details or to schedule a private showing.",
  "Draft a follow-up message to a buyer":
    "Hi [Name], thank you for visiting the property yesterday. I wanted to follow up and see if you had any questions. The seller is motivated and I'd love to help you put together a competitive offer. Let me know when you're free to discuss.",
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
      "Scout can help with that. Try the full experience to get a real-time AI response tailored to your needs."

    // Simulate typing
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
    <div className="w-full max-w-xl">
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
          placeholder="Ask Scout anything about real estate..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/50 outline-none"
          style={{ fontFamily: "Inter, sans-serif" }}
        />
        <button
          onClick={() => handleSubmit("")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
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

      {/* Quick prompts */}
      <div className="mt-3 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSubmit(prompt)}
            className="rounded-lg px-3 py-1.5 text-xs transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(160,175,195,0.1)",
              color: "var(--color-muted)",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(59,90,130,0.3)"
              e.currentTarget.style.color = "var(--color-foreground)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(160,175,195,0.1)"
              e.currentTarget.style.color = "var(--color-muted)"
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
              color: "var(--color-foreground)",
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
              <span className="text-xs font-medium text-muted">Scout</span>
              {isTyping && (
                <span className="inline-flex items-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1 w-1 rounded-full"
                      style={{ background: "var(--color-muted)" }}
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
