"use client"

import { AgentChat, createAgentChat } from "@21st-sdk/nextjs"
import { useChat } from "@ai-sdk/react"
import theme from "../theme.json"

const chat = createAgentChat({
  agent: "my-agent",
  tokenUrl: "/api/an-token",
})

export default function ChatPage() {
  const { messages, sendMessage, status, stop, error } =
    useChat({ chat })

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "#F2F2F2" }}
    >
      {/* Scout header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/recruiting"
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg text-sm"
            style={{
              color: "#6B7280",
              border: "1px solid #E2E8F0",
              fontFamily: "Inter, sans-serif",
            }}
            aria-label="Back to recruiting"
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
          </a>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
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
              style={{ color: "#1E293B", fontFamily: "Inter, sans-serif" }}
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
      </header>

      {/* Chat area */}
      <div className="flex flex-1 justify-center">
        <AgentChat
          messages={messages}
          onSend={() => sendMessage({ text: "" })}
          status={status}
          onStop={stop}
          error={error ?? undefined}
          theme={theme}
        />
      </div>
    </div>
  )
}
