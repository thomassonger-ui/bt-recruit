"use client"

import { useState, useRef, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ScoutPromptTabs from "@/components/ui/ScoutPromptTabs"
import ReactMarkdown from "react-markdown"

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// ─── API CALL ─────────────────────────────────────────────────────────────────

async function callScoutAPI(
  messages: Message[],
  context: string,
  sessionId: string,
  agentEmail?: string
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      context,
      sessionId,
      agentEmail: agentEmail || null,
    }),
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}`)
  }

  const data = await res.json()
  return data.reply || "Something went wrong. Try again."
}

// ─── MOBILE NAV ───────────────────────────────────────────────────────────────

function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: "rgba(255,255,255,0.08)" }}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M14 4L4 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full flex flex-col gap-1 px-4 pb-4 pt-2 md:hidden"
          style={{ background: "rgba(11,22,42,0.97)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          onClick={() => setOpen(false)}
        >
          <a href="/scout" className="block py-3 text-sm font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>Why Scout</a>
          <a href="/chat" className="block py-3 text-sm font-medium" style={{ color: "rgba(255,255,255,0.80)" }}>Try Scout</a>
          <a
            href="sms:+14077588102"
            className="mt-1 block rounded-lg px-4 py-3 text-center text-sm font-semibold text-white"
            style={{ background: "#3b6ea8" }}
          >
            Text Me Scout
          </a>
        </div>
      )}
    </>
  )
}

// ─── INNER COMPONENT (uses useSearchParams) ───────────────────────────────────

function ChatPageInner() {
  const searchParams = useSearchParams()
  const context = searchParams.get("context") || "public"

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agentEmail, setAgentEmail] = useState<string | undefined>(undefined)

  // Stable session ID for this browser session
  const sessionId = useRef<string>(
    typeof window !== "undefined"
      ? (sessionStorage.getItem("scout_session_id") || (() => {
          const id = crypto.randomUUID();
          sessionStorage.setItem("scout_session_id", id);
          return id;
        })())
      : crypto.randomUUID()
  ).current

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const notifiedRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendNotification = useCallback(
    async (userMessage: string) => {
      if (notifiedRef.current) return
      notifiedRef.current = true
      try {
        await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, context }),
        })
      } catch {
        // Non-blocking
      }
    },
    [context]
  )

  const handleSubmit = useCallback(
    async (messageText?: string) => {
      const text = (messageText ?? input).trim()
      if (!text || isLoading) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      }

      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInput("")
      setIsLoading(true)

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto"
      }

      sendNotification(text)

      // Detect email from conversation for memory
      const allText = updatedMessages.map((m) => m.content).join(" ");
      const emailMatch = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch && !agentEmail) setAgentEmail(emailMatch[0].toLowerCase());

      try {
        const reply = await callScoutAPI(updatedMessages, context, sessionId, agentEmail || emailMatch?.[0]?.toLowerCase())
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: reply,
          },
        ])
      } catch (err) {
        console.error("Scout error:", err)
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Something went wrong. Try again.",
          },
        ])
      } finally {
        setIsLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    },
    [input, messages, isLoading, context, sendNotification, agentEmail, sessionId]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handlePromptSelect = useCallback(
    (prompt: string) => {
      handleSubmit(prompt)
    },
    [handleSubmit]
  )

  const isEmpty = messages.length === 0
  const canSend = input.trim().length > 0 && !isLoading

  const greeting =
    context === "academy"
      ? "Scout (Train) — I'm here to help you build skill, reinforce systems, and improve consistency. Tell me where you're stuck and I'll point you to the right place."
      : context === "operations"
      ? "Scout (Execute) — I guide what to do next, step-by-step, so nothing falls through the cracks. Tell me where you are in the transaction."
      : null

  const publicEntryButtons = [
    {
      label: "I'm a new agent",
      subtext: "Just licensed or exploring your first brokerage",
      prompt: "I just got my license and I'm exploring where to hang it. What should I know about Bear Team?",
    },
    {
      label: "I'm stuck at my current brokerage",
      subtext: "Fees too high, production stalled, or not feeling supported",
      prompt: "I'm not happy at my current brokerage. Fees are eating into my commissions and I'm not getting real support. Tell me about Bear Team.",
    },
    {
      label: "I'm a producing agent",
      subtext: "Closing deals — want to know if the numbers work better here",
      prompt: "I close deals regularly and I want to see how Bear Team's commission model compares to what I'm making now. Run the math.",
    },
  ]

  return (
    /*
     * Full-screen layout with fixed background layers.
     * On mobile: single column, full height, scroll within chat area.
     * On desktop: centered card, max-w-2xl, elevated above background.
     */
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">

      {/* ── FIXED BACKGROUND LAYERS ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: "url('/blueprint.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          filter: "saturate(0.5) brightness(0.85)",
        }}
      />
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 1, background: "rgba(11,22,42,0.82)", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(100,180,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,0.04) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }} />

      {/* ── STICKY NAV ── */}
      <nav
        className="sticky top-0 z-50 w-full"
        style={{
          height: "60px",
          background: "rgba(11,22,42,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <svg width="32" height="32" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="32" height="32" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6"/>
              <text x="17" y="22.5" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,sans-serif" fontWeight="800" fontSize="12" fill="white" letterSpacing="0.5">BT</text>
            </svg>
            <span className="hidden text-sm font-bold text-white sm:block" style={{ letterSpacing: "0.01em" }}>
              Bear Real Estate Team
            </span>
            <span className="text-sm font-bold text-white sm:hidden">Bear Team</span>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <a href="/scout" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.70)", textDecoration: "none" }}>Why Scout</a>
            <a href="/chat" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.70)", textDecoration: "none" }}>Try Scout</a>
            <a
              href="sms:+14077588102"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#3b6ea8", textDecoration: "none" }}
            >
              Text Me Scout
            </a>
          </div>

          {/* Mobile hamburger */}
          <MobileNav />
        </div>
      </nav>

      {/* ── MAIN CONTENT — centers the card on desktop, full-width on mobile ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-0 py-0 sm:px-4 sm:py-3 md:py-4">
        {/*
         * Chat card:
         * - Mobile: fills viewport edge-to-edge, no border-radius, no shadow
         * - Desktop: max-w-2xl, rounded, elevated
         */}
        <div
          className="flex w-full flex-col sm:max-w-2xl sm:rounded-2xl"
          style={{
            background: "#FFFFFF",
            boxShadow: "0 8px 48px rgba(0,0,0,0.30)",
            border: "1px solid rgba(255,255,255,0.12)",
            /* Full height only when conversation is active */
            minHeight: isEmpty ? "auto" : "calc(100vh - 60px)",
          }}
        >
          {/* ── CHAT HEADER ── */}
          <div
            className="flex shrink-0 items-center gap-3 px-4 py-3 sm:px-6 sm:py-4"
            style={{ borderBottom: "1px solid #F3F4F6" }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: "#0B1D3A" }}
            >
              S
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold" style={{ color: "#0B1D3A" }}>Scout</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {context === "academy"
                  ? "Scout (Train)"
                  : context === "operations"
                  ? "Scout (Execute)"
                  : "Scout — Find What's Missing"}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs" style={{ color: "#6B7280" }}>Online</span>
            </div>
          </div>

          {/* ── MESSAGES AREA ──
              flex-1 so it stretches to fill, overflow-y-auto for independent scroll */}
          <div
            ref={chatContainerRef}
            className={`${isEmpty ? "" : "flex-1"} overflow-x-hidden overflow-y-auto px-4 pt-2 pb-2 sm:px-6`}
            style={{
              /* On mobile fill remaining space; on desktop cap at comfortable reading height */
              minHeight: isEmpty ? "auto" : "0",
              maxHeight: isEmpty ? "none" : "clamp(300px, 60vh, 600px)",
            }}
          >
            {isEmpty ? (
              context === "public" ? (
                <div className="py-2">
                  <div className="mb-4 text-center sm:mb-5">
                    <div className="text-sm font-semibold sm:text-base" style={{ color: "#0B1D3A" }}>
                      Most agents overpay their brokerage by $4,000–$12,000 a year.
                    </div>
                    <div className="mt-1 text-xs leading-relaxed sm:text-sm" style={{ color: "#6B7280", maxWidth: "360px", margin: "4px auto 0" }}>
                      I&apos;m Scout. Tell me where you are — I&apos;ll show you what you&apos;d actually make here.
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {publicEntryButtons.map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handlePromptSelect(btn.prompt)}
                        className="w-full rounded-xl px-4 py-3 text-left transition-colors active:scale-[0.99]"
                        style={{
                          background: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#0B1D3A"
                          e.currentTarget.style.background = "#F0F3F8"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#E5E7EB"
                          e.currentTarget.style.background = "#F9FAFB"
                        }}
                      >
                        <div className="text-sm font-medium" style={{ color: "#0B1D3A" }}>{btn.label}</div>
                        <div className="mt-0.5 text-xs leading-snug" style={{ color: "#6B7280" }}>{btn.subtext}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-1 text-sm font-medium" style={{ color: "#0B1D3A" }}>Hi, I&apos;m Scout.</div>
                  <div className="mx-auto max-w-xs text-sm leading-relaxed sm:max-w-md" style={{ color: "#6B7280" }}>{greeting}</div>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="rounded-2xl px-4 py-3 text-sm leading-relaxed break-words"
                      style={{
                        /* Desktop: 70% max. Mobile handled via inline calc below */
                        maxWidth: "min(85%, 520px)",
                        ...(msg.role === "user"
                          ? { background: "#0B1D3A", color: "#FFFFFF", borderBottomRightRadius: "4px" }
                          : { background: "#F9FAFB", color: "#1A1A1A", borderBottomLeftRadius: "4px", border: "1px solid #E5E7EB" })
                      }}
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            a: ({ href, children }) => (
                              <a href={href} className="underline" target="_blank" rel="noopener noreferrer">{children}</a>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderBottomLeftRadius: "4px" }}
                    >
                      <div className="flex h-4 items-center gap-1">
                        {[0, 150, 300].map((delay) => (
                          <div
                            key={delay}
                            className="h-1.5 w-1.5 animate-bounce rounded-full"
                            style={{ background: "#9CA3AF", animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── PROMPT TABS (academy/operations empty state only) ── */}
          {isEmpty && context !== "public" && (
            <div className="shrink-0 px-4 pb-3 sm:px-6">
              <ScoutPromptTabs onSelectPrompt={handlePromptSelect} />
            </div>
          )}

          {/* ── INPUT BAR — sticky at bottom inside card ── */}
          <div
            className="shrink-0 px-3 pb-3 pt-2 sm:px-4 sm:pb-4"
            style={{ borderTop: "1px solid #F3F4F6" }}
          >
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3"
              style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Scout anything..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{
                  color: "#1A1A1A",
                  maxHeight: "100px",
                  lineHeight: "1.5",
                  /* Prevent iOS zoom on focus (font-size must be ≥16px) */
                  fontSize: "16px",
                }}
              />
              {/* 44×44 tap target on mobile */}
              <button
                onClick={() => handleSubmit()}
                disabled={!canSend}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-9 sm:w-9"
                style={{
                  background: canSend ? "#0B1D3A" : "#E5E7EB",
                  cursor: canSend ? "pointer" : "not-allowed",
                }}
                aria-label="Send message"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={canSend ? "#FFFFFF" : "#9CA3AF"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div className="mt-1.5 text-center text-xs" style={{ color: "#9CA3AF" }}>
              Scout is an AI assistant.{" "}
              <a href="mailto:thomas.songer@gmail.com" style={{ color: "#6B7280" }}>Contact Tom</a>{" "}
              for complex questions.
            </div>
          </div>
        </div>
      </main>
      {/* ── FOOTER ── */}
      <footer style={{ background: "#060e1c", padding: "clamp(32px,6vw,48px) clamp(16px,5vw,40px)", textAlign: "center", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "0.04em" }}>Bear Team Real Estate</div>
        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginBottom: "24px", lineHeight: 1.6 }}>Orlando, FL · Independent Licensed Brokerage · Bethanne Baer, Broker</div>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          <a href="/chat" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Talk to Scout</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
          <a href="/scout" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>The System</a>
          <span style={{ color: "rgba(255,255,255,0.15)" }} aria-hidden="true">·</span>
          <a href="/academy" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "4px 0" }}>Academy</a>
        </div>
        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>Copyright WorldTeachPathways 2026</div>
      </footer>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div />}>
      <ChatPageInner />
    </Suspense>
  )
}
