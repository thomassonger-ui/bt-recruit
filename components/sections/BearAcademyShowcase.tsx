"use client"

import { ContainerScroll } from "@/components/ui/container-scroll-animation"

export default function BearAcademyShowcase() {
  return (
    <section
      className="relative overflow-hidden px-4 py-24"
      style={{ background: "#F2F2F2" }}
    >
      <ContainerScroll
        titleComponent={
          <div>
            <p
              className="text-sm font-medium uppercase tracking-widest mb-3"
              style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
            >
              Bear Academy
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "#222222", fontFamily: "Inter, sans-serif" }}
            >
              Training & Systems
            </h2>
            <p
              className="text-base md:text-lg max-w-2xl mx-auto"
              style={{ color: "#6B7280", fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
            >
              Structured programs that scale with your organization. Bear Academy provides
              operational training, systems, and leadership frameworks designed to help real
              estate teams operate with clarity, alignment, and accountability.
            </p>
          </div>
        }
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(59,90,130,0.15)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1), 0 0 0 1px rgba(59,90,130,0.05)",
          }}
        >
          <div className="grid md:grid-cols-2">
            {/* Left Panel — Team Alignment Program */}
            <div
              className="p-8 md:p-10"
              style={{ borderRight: "1px solid rgba(59,90,130,0.12)" }}
            >
              <div
                className="inline-block rounded-lg px-3 py-1 text-xs font-medium mb-5"
                style={{
                  background: "rgba(59,90,130,0.08)",
                  color: "#3B5A82",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                6-Week Program
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "#222222", fontFamily: "Inter, sans-serif" }}
              >
                Team Alignment Program
              </h3>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
              >
                A 6-week intensive that aligns your team around shared goals,
                clear roles, and effective communication patterns.
              </p>
              <ul className="space-y-2 mb-8">
                {["Goal alignment workshops", "Role clarity framework", "Communication cadences", "Progress tracking"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#374151", fontFamily: "Inter, sans-serif" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: "#3B5A82" }}
                      />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <a
                href="/academy"
                className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
                style={{
                  background: "#3B5A82",
                  color: "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#2F4768")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#3B5A82")}
              >
                Learn More
              </a>
            </div>

            {/* Right Panel — Operations Toolkit */}
            <div className="p-8 md:p-10">
              <div
                className="inline-block rounded-lg px-3 py-1 text-xs font-medium mb-5"
                style={{
                  background: "rgba(59,90,130,0.08)",
                  color: "#3B5A82",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Ready to Deploy
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: "#222222", fontFamily: "Inter, sans-serif" }}
              >
                Operations Toolkit
              </h3>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "#6B7280", fontFamily: "Inter, sans-serif" }}
              >
                Ready-to-deploy systems for standups, retrospectives,
                decision-making, and asynchronous team workflows.
              </p>
              <ul className="space-y-2 mb-8">
                {["Daily standup templates", "Retrospective frameworks", "Decision-making protocols", "Async workflow guides"].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#374151", fontFamily: "Inter, sans-serif" }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: "#3B5A82" }}
                      />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <a
                href="/academy"
                className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
                style={{
                  background: "transparent",
                  color: "#6B7280",
                  border: "1px solid rgba(59,90,130,0.3)",
                  fontFamily: "Inter, sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3B5A82"
                  e.currentTarget.style.color = "#222222"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,90,130,0.3)"
                  e.currentTarget.style.color = "#6B7280"
                }}
              >
                Explore Tools
              </a>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  )
}
