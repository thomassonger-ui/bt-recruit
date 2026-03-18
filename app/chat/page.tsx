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
  context: string
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      context,
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

      try {
        const reply = await callScoutAPI(updatedMessages, context)
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
      ? "I'm Scout. I'm here to guide you through BearTeam Academy. Tell me where you're stuck and I'll point you to the right course."
      : context === "operations"
      ? "I'm Scout. I'm in ops mode — tell me where you are in the transaction and I'll give you the next step."
      : "I'm Scout. I can tell you how Bear Team works, what the commission model looks like, and what joining actually means for your business."

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: "#F2F2F2" }}
    >
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <a
            href="/scout"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#6B7280" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Scout
          </a>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB",
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
                  ? "Bear Team Academy Assistant"
                  : context === "operations"
                  ? "Bear Team Operations Assistant"
                  : "Bear Team AI Assistant"}
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
              <div className="py-8 text-center">
                <div className="text-sm mb-1 font-medium" style={{ color: "#0B1D3A" }}>
                  Hi, I&apos;m Scout.
                </div>
                <div className="text-sm max-w-md mx-auto" style={{ color: "#6B7280" }}>
                  {greeting}
                </div>
              </div>
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

          {isEmpty && (
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
