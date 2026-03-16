"use client"

import { useState } from "react"

const scoutFeatures = [
  {
    id: 1,
    title: "Listing Assistant",
    description: "Writes MLS descriptions, property highlights, and marketing copy from basic property details.",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Buyer Assistant",
    description: "Prepares property summaries, showing notes, and buyer guidance to support client conversations.",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Showing Assistant",
    description: "Generates talking points and property highlights before a showing so agents walk in prepared.",
    imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2096&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Communication Assistant",
    description: "Drafts follow-up emails, text messages, and responses to buyer or seller questions.",
    imageUrl: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Marketing Assistant",
    description: "Creates social media posts, listing promotions, and property announcements in seconds.",
    imageUrl: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=2070&auto=format&fit=crop",
  },
]

function AccordionPanel({
  item,
  isActive,
  onMouseEnter,
}: {
  item: (typeof scoutFeatures)[number]
  isActive: boolean
  onMouseEnter: () => void
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      style={{
        height: "420px",
        width: isActive ? "380px" : "56px",
        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
      }}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background: isActive
            ? "linear-gradient(to top, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.3) 50%, transparent 100%)"
            : "rgba(30,41,59,0.55)",
        }}
      />
      {isActive ? (
        <div
          className="absolute bottom-0 left-0 right-0 p-6"
          style={{
            opacity: 1,
            transition: "opacity 0.4s ease 0.2s",
          }}
        >
          <p
            className="text-lg font-semibold text-white mb-1"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {item.title}
          </p>
          <p
            className="text-sm text-white/80 leading-relaxed"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {item.description}
          </p>
        </div>
      ) : (
        <span
          className="absolute text-white text-sm font-medium whitespace-nowrap"
          style={{
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%) rotate(90deg)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {item.title}
        </span>
      )}
    </div>
  )
}

export default function ScoutAccordion() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="flex items-center justify-center gap-3 overflow-x-auto p-2">
      {scoutFeatures.map((item, index) => (
        <AccordionPanel
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onMouseEnter={() => setActiveIndex(index)}
        />
      ))}
    </div>
  )
}
