"use client"

import { createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect, useCallback } from "react"

const chat = createAgentChat({
  agent: "my-agent",
  tokenUrl: "/api/an-token",
})

function getMessageText(msg: { parts: Array<{ type: string; text?: string }> }): string {
  return msg.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("")
}

const suggestedPrompts = [
  "Write a listing description for a 3-bedroom home in Winter Park.",
  "What pricing strategy would you recommend?",
  "Create a social media post for the listing.",
  "Analyze comparable sales in my neighborhood.",
]

export default function ChatPage() {
  const { messages, sendMessage, status, stop, error } = useChat({ chat })
  const [input, setInput] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, status, scrollToBottom])

  const handleSend = (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return
    sendMessage({ text: msg })
    setInput("")
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }
  }

  const isLoading = status === "streaming" || status === "submitted"

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: "#F2F2F2" }}
    >
      <div className="w-full max-w-2xl">
        {/* Back link */}
        <div className="mb-4">
          <a
            href="/recruiting"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1E293B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M13 7H1M6 2L1 7l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to BearTeam
          </a>
        </div>

        {/* Chat card */}
        <div
          className="overflow-hidden"
          style={{
            background: "var(--color-card, #FFFFFF)",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid #F1F5F9" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  background: "#3B5A82",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                S
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "#1E293B",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Scout
                </p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  BearTeam AI Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: "#34D399" }}
              />
              <span className="text-xs" style={{ color: "#6B7280" }}>
                Online
              </span>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={chatContainerRef}
            className="flex flex-col gap-4 overflow-y-auto p-6"
            style={{ minHeight: "380px", maxHeight: "520px" }}
          >
            {/* Empty state with suggested prompts */}
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center py-8">
                <p
                  className="mb-6 text-center text-sm"
                  style={{ color: "#9CA3AF" }}
                >
                  Ask Scout about listings, pricing, market data, or marketing.
                </p>
                <div className="grid w-full gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="rounded-xl px-4 py-3 text-left text-sm leading-relaxed transition-colors"
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #F1F5F9",
                        color: "#6B7280",
                        fontFamily: "Inter, sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F1F5F9"
                        e.currentTarget.style.borderColor = "#E2E8F0"
                        e.currentTarget.style.color = "#1E293B"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#F8FAFC"
                        e.currentTarget.style.borderColor = "#F1F5F9"
                        e.currentTarget.style.color = "#6B7280"
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: "#3B5A82",
                        color: "#FFFFFF",
                      }}
                    >
                      {getMessageText(msg)}
                    </div>
                  </div>
                )
              }
              return (
                <div key={msg.id} className="flex justify-start">
                  <div
                    className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #F1F5F9",
                      color: "#1E293B",
                    }}
                  >
                    {getMessageText(msg)}
                  </div>
                </div>
              )
            })}

            {/* Thinking indicator */}
            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && (
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{
                      background: "#3B5A82",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    S
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: "#6B7280",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Scout is thinking
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: "#6B7280",
                            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}

            {/* Error */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                }}
              >
                Something went wrong. Please try again.
              </div>
            )}
          </div>

          {/* Input bar */}
          <div
            className="flex items-end gap-3 px-6 py-4"
            style={{ borderTop: "1px solid #F1F5F9" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask Scout anything..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none text-sm leading-relaxed outline-none"
              style={{
                background: "#F8FAFC",
                border: "1px solid #F1F5F9",
                borderRadius: "12px",
                padding: "10px 16px",
                color: "#1E293B",
                fontFamily: "Inter, sans-serif",
                maxHeight: "120px",
              }}
            />
            {isLoading ? (
              <button
                onClick={() => stop()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors"
                style={{ background: "#EF4444" }}
                aria-label="Stop generating"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect width="12" height="12" rx="2" fill="white" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-opacity"
                style={{
                  background: input.trim() ? "#3B5A82" : "#CBD5E1",
                  cursor: input.trim() ? "pointer" : "default",
                }}
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pulsing dots animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
