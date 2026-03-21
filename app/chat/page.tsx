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
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight
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
    [input, messages, isLoading, context, sendNotification]
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
      ? "Scout (Train) — I’m here to help you build skill, reinforce systems, and improve consistency. Tell me where you’re stuck and I’ll point you to the right place."
      : context === "operations"
      ? "Scout (Execute) — I guide what to do next, step-by-step, so nothing falls through the cracks. Tell me where you are in the transaction."
      : null // public greeting handled inline with buttons

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
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{
        paddingTop: "88px",
        position: "relative",
      }}
    >
      {/* Blueprint photo — <img> tag fixed as background */}
      <img
        src="/blueprint.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", pointerEvents: "none", zIndex: 0 }}
      />
      {/* Dark overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(11,22,42,0.80)", zIndex: 1, pointerEvents: "none" }} />
      {/* Blueprint grid overlay */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: "linear-gradient(rgba(100,180,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,0.04) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }} />
      {/* ── TOP NAV — matches homepage ── */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: "0 clamp(16px, 4vw, 40px)",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(11,22,42,0.88)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="32" height="32" rx="1" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
            <rect x="4" y="4" width="26" height="26" rx="0.5" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <text x="17" y="22.5" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontWeight="800" fontSize="12" fill="#1a1a1a" letterSpacing="0.5">BT</text>
          </svg>
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.01em" }}>
            Bear Real Estate Team
          </span>
        </a>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          <a href="/#why-scout" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Why Scout</a>
          <a href="/#see-scout" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>See Scout</a>
          <a href="/#try-it" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Try It</a>
          <a href="sms:+14077588102" style={{
            background: "#3b6ea8",
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            padding: "9px 20px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
          }}>Text Me Scout</a>
        </div>
      </nav>

      <div className="w-full max-w-2xl" style={{ position: "relative", zIndex: 10 }}>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            boxShadow: "0 8px 48px rgba(0,0,0,0.32)",
            border: "1px solid rgba(255,255,255,0.15)",
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(-4px) scale(1.008)";
            el.style.boxShadow = "0 24px 72px rgba(0,0,0,0.45)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(0) scale(1)";
            el.style.boxShadow = "0 8px 48px rgba(0,0,0,0.32)";
          }}
        >
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: "1px solid #F3F4F6" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: "#0B1D3A" }}
            >
              S
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: "#0B1D3A" }}>
                Scout
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>
                {context === "academy"
                  ? "Scout (Train)"
                  : context === "operations"
                  ? "Scout (Execute)"
                  : "Scout (Find What’s Missing)"}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs" style={{ color: "#6B7280" }}>Online</span>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="px-6 py-4 overflow-y-auto"
            style={{ height: isEmpty ? "auto" : "420px", minHeight: "120px" }}
          >
            {isEmpty ? (
              context === "public" ? (
                <div className="py-6">
                  <div className="text-center mb-5">
                    <div className="text-base font-semibold mb-1" style={{ color: "#0B1D3A" }}>
                      Most agents overpay their brokerage by $4,000–$12,000 a year.
                    </div>
                    <div className="text-sm max-w-sm mx-auto" style={{ color: "#6B7280" }}>
                      I&apos;m Scout. Tell me where you are — I&apos;ll show you what you&apos;d actually make here.
                    </div>
                  </div>
                  <div className="space-y-2">
                    {publicEntryButtons.map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handlePromptSelect(btn.prompt)}
                        className="w-full text-left rounded-xl px-4 py-3 transition-all"
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
                        <div className="text-sm font-medium" style={{ color: "#0B1D3A" }}>
                          {btn.label}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                          {btn.subtext}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-sm mb-1 font-medium" style={{ color: "#0B1D3A" }}>
                    Hi, I&apos;m Scout.
                  </div>
                  <div className="text-sm max-w-md mx-auto" style={{ color: "#6B7280" }}>
                    {greeting}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] rounded-2xl px-4 py-3 text-sm"
                      style={
                        msg.role === "user"
                          ? { background: "#0B1D3A", color: "#FFFFFF", borderBottomRightRadius: "4px" }
                          : { background: "#F9FAFB", color: "#1A1A1A", borderBottomLeftRadius: "4px", border: "1px solid #E5E7EB" }
                      }
                    >
                      {msg.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
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
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#9CA3AF", animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#9CA3AF", animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#9CA3AF", animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isEmpty && context !== "public" && (
            <div className="px-6 pb-4">
              <ScoutPromptTabs onSelectPrompt={handlePromptSelect} />
            </div>
          )}

          <div className="px-4 pb-4">
            <div
              className="flex items-end gap-2 rounded-xl px-4 py-3"
              style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Scout anything..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm outline-none"
                style={{ color: "#1A1A1A", maxHeight: "120px", lineHeight: "1.5" }}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!canSend}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: canSend ? "#0B1D3A" : "#E5E7EB", cursor: canSend ? "pointer" : "not-allowed" }}
                aria-label="Send message"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={canSend ? "#FFFFFF" : "#9CA3AF"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-center text-xs" style={{ color: "#9CA3AF" }}>
              Scout is an AI assistant. For complex questions, contact{" "}
              <a href="mailto:thomas.songer@gmail.com" style={{ color: "#6B7280" }}>Tom Songer</a>
            </div>
          </div>
        </div>
      </div>
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
