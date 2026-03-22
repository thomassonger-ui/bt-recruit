"use client"

import { useState } from "react"

const categories = [
  "Listing Marketing",
  "Client Communication",
  "Market Insights",
  "Transaction Support",
  "Agent Growth",
] as const

type Category = (typeof categories)[number]

const prompts: Record<Category, string[]> = {
  "Listing Marketing": [
    "Scout, write an MLS listing description for a 3-bedroom home in Winter Park with an updated kitchen and large backyard.",
    "Scout, create a social media post announcing a new listing in Baldwin Park with a call to action.",
    "Scout, summarize the key selling points of this property so I can present it to buyers quickly.",
    "Scout, write an email introducing this listing to potential buyers.",
    "Scout, generate three marketing angles I can use to promote this listing online.",
  ],
  "Client Communication": [
    "Scout, write a follow-up message to a buyer after today's showing asking for feedback.",
    "Scout, draft a professional response to a client who believes the listing price is too high.",
    "Scout, create a text message confirming a showing appointment tomorrow at 3 PM.",
    "Scout, write a thank-you email to a seller after signing a listing agreement.",
    "Scout, draft a short update message to a client explaining the next steps in the transaction.",
  ],
  "Market Insights": [
    "Scout, summarize the current market conditions in Winter Park for homes between $350K and $500K.",
    "Scout, explain how I should price a home when inventory is increasing but demand remains strong.",
    "Scout, what pricing strategy would you recommend if comparable homes are selling within 10 days?",
    "Scout, explain how rising interest rates affect buyer demand in this market.",
    "Scout, summarize recent sales trends I should discuss with a seller.",
  ],
  "Transaction Support": [
    "Scout, create a checklist of everything I need to prepare before listing a property.",
    "Scout, summarize the key deadlines in a typical Florida real estate contract.",
    "Scout, explain the steps between contract and closing for a buyer.",
    "Scout, what documents should I review before submitting an offer?",
    "Scout, outline the responsibilities of the listing agent during escrow.",
  ],
  "Agent Growth": [
    "Scout, how does BearTeam help agents generate more listings?",
    "Scout, what systems does BearTeam provide that traditional brokerages do not?",
    "Scout, explain how BearTeam helps agents use AI in their business.",
    "Scout, what would my first 30 days at BearTeam look like?",
    "Scout, suggest three ways I could increase my listing pipeline this month.",
  ],
}

interface ScoutPromptTabsProps {
  onSelectPrompt: (prompt: string) => void
}

export default function ScoutPromptTabs({ onSelectPrompt }: ScoutPromptTabsProps) {
  const [activeTab, setActiveTab] = useState<Category>("Listing Marketing")

  return (
    <div className="w-full">
      {/* Tab bar — horizontal scroll, hide scrollbar */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: activeTab === cat ? "#3B5A82" : "#F1F5F9",
              color: activeTab === cat ? "#FFFFFF" : "#6B7280",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== cat) {
                e.currentTarget.style.background = "#E2E8F0"
                e.currentTarget.style.color = "#1E293B"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== cat) {
                e.currentTarget.style.background = "#F1F5F9"
                e.currentTarget.style.color = "#6B7280"
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prompt cards — single column on mobile, 2-col on sm+ */}
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {prompts[activeTab].map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-xl px-3 py-2.5 text-left text-xs leading-relaxed transition-colors sm:px-4 sm:py-3 sm:text-sm active:scale-[0.98]"
            style={{
              background: "#F8FAFC",
              border: "1px solid #F1F5F9",
              color: "#6B7280",
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
  )
}
