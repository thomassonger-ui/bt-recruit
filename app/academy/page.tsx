"use client";

import { useEffect, useRef, useState } from "react";

export const dynamic = "force-dynamic";

interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AcademyPage() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Disable browser scroll restoration — prevents mid-page landing on back-nav
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Coach chat state
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([
    { role: "assistant", content: "I'm Coach — Bear Team's training assistant. Ask me anything about real estate practice, the Academy courses, or how to improve your production." },
  ]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const coachEndRef = useRef<HTMLDivElement>(null);

  // Only auto-scroll coach panel after user interaction — never on initial load
  const coachHasInteracted = useRef(false);
  useEffect(() => {
    if (!coachHasInteracted.current) return;
    coachEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages, coachLoading]);

  async function sendCoach() {
    const text = coachInput.trim();
    if (!text || coachLoading) return;
    coachHasInteracted.current = true;
    const next: CoachMessage[] = [...coachMessages, { role: "user", content: text }];
    setCoachMessages(next);
    setCoachInput("");
    setCoachLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setCoachMessages([...next, { role: "assistant", content: data.reply || "Something went wrong. Try again." }]);
    } catch {
      setCoachMessages([...next, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setCoachLoading(false);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = timelineRef.current.offsetHeight;
      const start = rect.top - windowHeight;
      const end = rect.bottom;
      const total = elementHeight + windowHeight;
      const progress = Math.min(1, Math.max(0, -start / total));
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const courses = [
    {
      number: "01",
      title: "Orientation: Culture & Expectations",
      tag: "Required · Start Here",
      duration: "~45 min",
      color: "#1a6b3c",
      lightColor: "#dcfce7",
      textColor: "#14532d",
      description: "Start here. Learn how Bear Team operates, what we expect from every agent, and what you can expect from us. Covers our culture, communication standards, and the BearTeamOS framework that runs everything.",
      topics: ["Bear Team culture and operating principles", "Agent expectations and accountability standards", "How BearTeamOS supports your business", "Your first 30 days roadmap"],
    },
    {
      number: "02",
      title: "Brokerage Structure: How We Function",
      tag: "Required",
      duration: "~60 min",
      color: "#1e5a8a",
      lightColor: "#dbeafe",
      textColor: "#1e3a5f",
      description: "Understand exactly how your money works here. Commission tiers, the $16K cap model, fee structure, and how you advance from 60/40 to 90/10 automatically as you produce.",
      topics: ["Progressive splits: 60/40 to 70/30 to 80/20 to 90/10", "$16,000 company dollar cap explained", "Zero monthly, desk, and tech fees", "$150 flat transaction fee only", "E&O insurance fully covered"],
    },
    {
      number: "03",
      title: "Compliance & Risk: How We Protect",
      tag: "Required",
      duration: "~50 min",
      color: "#2d4a6b",
      lightColor: "#e0e7ff",
      textColor: "#1e3a5f",
      description: "Know what keeps your license clean and your clients protected. Florida license law, Fair Housing requirements, contract obligations, and how Bear Team handles E&O.",
      topics: ["Florida real estate license law", "Fair Housing: what it means in practice", "Contract execution and disclosures", "E&O coverage and claims handling", "Compliance escalation procedures"],
    },
    {
      number: "04",
      title: "Operational Systems: How We Execute",
      tag: "Required",
      duration: "~60 min",
      color: "#1b365d",
      lightColor: "#e8edf5",
      textColor: "#1b2d4a",
      description: "The full transaction workflow from contract to close. Checklists, CRM discipline, submission procedures, and how to run a clean deal every time using Bear Team systems.",
      topics: ["Transaction workflow: contract to close", "CRM usage and follow-up standards", "Checklist-based execution", "File submission and document management", "Coordination with Bethanne and the team"],
    },
    {
      number: "05",
      title: "Agent Development: How We Grow",
      tag: "Development Track",
      duration: "~90 min",
      color: "#5b3fa6",
      lightColor: "#ede9fe",
      textColor: "#3b2578",
      description: "Build a business that runs without grinding. Lead generation systems, buyer and listing mastery, personal brand strategy, and the habits that separate top producers.",
      topics: ["Lead generation: digital, referral, community", "Buyer representation: first call to closing", "Listing strategy: pricing, staging, negotiation", "Personal brand and marketing toolkit", "90-day business plan framework"],
    },
    {
      number: "06",
      title: "Leadership Development: How We Lead",
      tag: "Advanced Track",
      duration: "~60 min",
      color: "#7c3a1e",
      lightColor: "#fef3c7",
      textColor: "#6b3a1e",
      description: "For agents building toward team leadership. Scaling your production, mentoring others, and contributing to the Bear Team culture that attracted you here.",
      topics: ["Scaling production to 20+ deals/year", "Mentoring and accountability partnerships", "Building your personal brand at Bear Team", "Leadership within BearTeamOS", "Pathways to team lead and beyond"],
    },
  ];

  const outcomes = [
    { title: "Commission clarity", body: "Exact splits, cap model, and take-home math — no surprises ever" },
    { title: "Transaction mastery", body: "Full command of the process from contract to close, no gaps" },
    { title: "Compliance confidence", body: "Fair Housing, E&O, contracts, license law — fully covered" },
    { title: "Lead system", body: "A built-out lead generation system for the Orlando market" },
    { title: "90-day plan", body: "A business plan for your first quarter at Bear Team" },
    { title: "BearTeamOS access", body: "The operating system behind every top producer here" },
  ];

  const timeline = [
    {
      day: "Day 1–7",
      phase: "Week 1",
      color: "#1a6b3c",
      milestones: [
        { label: "Complete Course 01", sub: "Orientation — culture, expectations, 30-day roadmap" },
        { label: "First team meeting", sub: "Meet Bethanne and the Bear Team" },
        { label: "BearTeamOS access", sub: "Get into the operating system" },
      ],
    },
    {
      day: "Day 8–30",
      phase: "First Month",
      color: "#1e5a8a",
      milestones: [
        { label: "Courses 02–04 complete", sub: "Structure, compliance, operations — fully trained" },
        { label: "First listing appointment", sub: "Using Bear Team pricing and staging systems" },
        { label: "CRM set up and live", sub: "Pipeline organized and follow-up running" },
      ],
    },
    {
      day: "Day 31–60",
      phase: "Month 2",
      color: "#2d4a6b",
      milestones: [
        { label: "First contract executed", sub: "Clean deal using Bear Team checklists" },
        { label: "Course 05 started", sub: "Agent development — lead gen and buyer mastery" },
        { label: "Personal brand active", sub: "Marketing toolkit deployed, content live" },
      ],
    },
    {
      day: "Day 61–90",
      phase: "Month 3",
      color: "#5b3fa6",
      milestones: [
        { label: "First closing", sub: "Deal closed, commission in hand" },
        { label: "Course 06 unlocked", sub: "Leadership track begins" },
        { label: "Tier advancement on track", sub: "Projecting when you hit next split tier" },
      ],
    },
    {
      day: "Year 1",
      phase: "Full Year",
      color: "#7c3a1e",
      milestones: [
        { label: "6+ closings", sub: "Auto-advance to Tier 2 — 70/30 split" },
        { label: "Academy graduate", sub: "All 6 courses complete, certificate earned" },
        { label: "Business running on systems", sub: "Not grinding — operating" },
      ],
    },
  ];

  const activeNodes = Math.floor(scrollProgress * (timeline.length + 1));

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#f8f9fa", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* Global hover styles */}
      <style>{`
        .course-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: default;
        }
        .course-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.13) !important;
        }
        .outcome-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          cursor: default;
        }
        .outcome-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0,0,0,0.18) !important;
          background: rgba(255,255,255,0.15) !important;
        }
        .timeline-node {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .timeline-node.active {
          transform: scale(1.05);
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeSlideIn 0.4s ease forwards;
        }
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 clamp(16px,4vw,40px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="32" height="32" rx="1" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
            <rect x="4" y="4" width="26" height="26" rx="0.5" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <text x="17" y="22.5" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontWeight="800" fontSize="12" fill="#1a1a1a" letterSpacing="0.5">BT</text>
          </svg>
          <span style={{ color: "#1a1a1a", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.01em" }}>Bear Real Estate Team</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/#why-scout" style={{ color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Why Scout</a>
          <a href="/#see-scout" style={{ color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>See Scout</a>
          <a href="/#try-it" style={{ color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Try It</a>
          <a href="sms:+14077588102" style={{ background: "#2d4a6b", color: "#ffffff", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, padding: "9px 20px", borderRadius: "8px", whiteSpace: "nowrap" }}>Text Me Scout</a>
        </div>
      </nav>

      {/* Hero — full viewport height, matches homepage */}
      <div
        className="blueprint-hero"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
        }}
      >
        {/* Blueprint photo — fills full hero height */}
        <img
          src="/blueprint.jpg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            pointerEvents: "none",
          }}
        />
        {/* Dark base overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(11,22,42,0.72)", pointerEvents: "none" }} />
        {/* Bottom fade — matches homepage gradient fade */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(11,22,42,0.3) 0%, rgba(11,22,42,0.55) 60%, rgba(15,25,50,0.9) 100%)",
        }} />
        {/* Subtle blueprint grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(100,180,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
        {/* Frosted glass card */}
        <div
          className="hero-glass-card"
          style={{
            position: "relative", zIndex: 1,
            maxWidth: 720,
            margin: "0 auto",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.32), 0 1px 0 rgba(255,255,255,0.12) inset",
            padding: "48px 40px",
            transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s cubic-bezier(0.22,1,0.36,1)",
            cursor: "default",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(-6px) scale(1.012)";
            el.style.boxShadow = "0 24px 64px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.18) inset";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(0) scale(1)";
            el.style.boxShadow = "0 8px 48px rgba(0,0,0,0.32), 0 1px 0 rgba(255,255,255,0.12) inset";
          }}
        >
          <h1 style={{ color: "#ffffff", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Training Built for<br /><span style={{ color: "#7eb8f7" }}>Bear Team Agents</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.65 }}>
            6 courses. Free for every agent. Covers everything from your first day to your first 20-deal year. Every lesson is built around how Bear Team actually operates.
          </p>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7eb8f7", margin: "0 0 8px" }}>
            Scout (Train)
          </p>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", margin: "0 auto 28px", lineHeight: 1.6, maxWidth: 460 }}>
            Scout helps you build skill, reinforce systems, and improve consistency through daily execution.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://calendly.com/thomas-songer/bear-team-meet" target="_blank" rel="noopener noreferrer"
              className="hero-btn-primary"
              style={{ background: "#ffffff", color: "#1b365d", textDecoration: "none", fontWeight: 700, padding: "13px 30px", borderRadius: 9, fontSize: "0.95rem", transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform="translateY(-2px)"; el.style.boxShadow="0 8px 24px rgba(0,0,0,0.25)"; el.style.background="#f0f4ff"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform="translateY(0)"; el.style.boxShadow="none"; el.style.background="#ffffff"; }}
            >Book a Call with Tom</a>
            <a href="/chat?context=academy"
              className="hero-btn-secondary"
              style={{ background: "rgba(255,255,255,0.12)", color: "#ffffff", textDecoration: "none", fontWeight: 600, padding: "13px 30px", borderRadius: 9, fontSize: "0.95rem", border: "1px solid rgba(255,255,255,0.35)", transition: "transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform="translateY(-2px)"; el.style.background="rgba(255,255,255,0.22)"; el.style.boxShadow="0 8px 24px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.transform="translateY(0)"; el.style.background="rgba(255,255,255,0.12)"; el.style.boxShadow="none"; }}
            >Ask Scout</a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "24px", display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
        {[["6", "Courses"], ["Free", "For All Agents"], ["~6 hrs", "Total Training"], ["100%", "Online & Self-Paced"]].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1b365d" }}>{val}</div>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>Bear Academy</h2>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 48, fontSize: "0.95rem" }}>Complete the courses in order — from orientation and onboarding through compliance, operations, agent development, and leadership. Each course builds on the last.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {courses.map((course) => (
            <div key={course.number} className="course-card" style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
              {/* Color bar top */}
              <div style={{ height: 5, background: course.color }} />
              <div style={{ padding: "24px" }}>
                {/* Number badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: course.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem" }}>{course.number}</span>
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", background: course.color, padding: "3px 10px", borderRadius: 20 }}>{course.tag}</span>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 10px", lineHeight: 1.35 }}>{course.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 16px" }}>{course.description}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {course.topics.map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: course.color, flexShrink: 0, marginTop: 6 }} />
                      <span style={{ fontSize: "0.78rem", color: "#374151" }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, fontSize: "0.75rem", color: "#9ca3af", fontWeight: 500 }}>{course.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30/60/90 Timeline */}
      <div ref={timelineRef} style={{ background: "#1b365d", padding: "72px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>30 / 60 / 90 Day Progression</h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", marginBottom: 56, fontSize: "0.95rem" }}>From day one to first closing to first tier increase — here is exactly what the path looks like.</p>

          {/* Timeline */}
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, background: "rgba(255,255,255,0.1)", transform: "translateX(-50%)" }} />
            {/* Progress line that grows with scroll */}
            <div style={{ position: "absolute", left: "50%", top: 0, width: 3, background: "rgba(255,255,255,0.7)", transform: "translateX(-50%)", height: `${scrollProgress * 100}%`, transition: "height 0.1s linear" }} />

            {timeline.map((item, idx) => {
              const isActive = idx < activeNodes;
              const isLeft = idx % 2 === 0;
              return (
                <div key={idx} className={`timeline-node ${isActive ? "active" : ""}`} style={{ display: "flex", justifyContent: isLeft ? "flex-end" : "flex-start", alignItems: "flex-start", marginBottom: 48, position: "relative" }}>
                  {/* Center dot */}
                  <div style={{ position: "absolute", left: "50%", top: 20, transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "50%", background: isActive ? item.color : "rgba(255,255,255,0.2)", border: `3px solid ${isActive ? "#fff" : "rgba(255,255,255,0.2)"}`, transition: "background 0.4s ease, border 0.4s ease", zIndex: 2 }} />

                  {/* Card */}
                  <div style={{ width: "44%", background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)", borderRadius: 12, border: `1px solid ${isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`, padding: "20px 22px", marginLeft: isLeft ? 0 : "6%", marginRight: isLeft ? "6%" : 0, transition: "background 0.4s ease, border 0.4s ease, opacity 0.4s ease", opacity: isActive ? 1 : 0.4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.7rem" }}>{item.day.split(" ")[0]}</span>
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{item.day}</div>
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>{item.phase}</div>
                      </div>
                    </div>
                    {item.milestones.map((m, mi) => (
                      <div key={mi} style={{ marginBottom: 10, paddingLeft: 12, borderLeft: `2px solid ${item.color}` }}>
                        <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.82rem" }}>{m.label}</div>
                        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem", marginTop: 2 }}>{m.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div style={{ background: "#2d4a6b", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 800, marginBottom: 12 }}>What You Walk Away With</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 40, fontSize: "0.95rem" }}>Every agent who completes BearTeam Academy is fully operational — no gaps, no guessing.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {outcomes.map((o, i) => (
              <div key={i} className="outcome-card" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 20px", textAlign: "left", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", marginBottom: 6 }}>{o.title}</div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: 1.5 }}>{o.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#fff", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 12 }}>Ready to See If Bear Team Is the Right Fit?</h2>
        <p style={{ color: "#6b7280", maxWidth: 500, margin: "0 auto 36px", fontSize: "0.95rem", lineHeight: 1.6 }}>Academy access is free for all Bear Team agents. The first step is a 15-minute call with Tom Songer, Team Lead.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/thomas-songer/bear-team-meet" target="_blank" rel="noopener noreferrer" style={{ background: "#1b365d", color: "#fff", textDecoration: "none", fontWeight: 700, padding: "14px 32px", borderRadius: 10, fontSize: "0.95rem" }}>Book 15 Min with Tom</a>
          <a href="/chat" style={{ background: "#f3f4f6", color: "#1a1a1a", textDecoration: "none", fontWeight: 600, padding: "14px 32px", borderRadius: 10, fontSize: "0.95rem" }}>Talk to Scout First</a>
        </div>
        <p style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: 20 }}>Tom Songer · Team Lead · Bear Team Real Estate · Orlando, FL</p>
      </div>

      {/* Coach — AI Training Assistant */}
      <div id="coach" style={{ background: "#f8f9fa", padding: "72px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a", margin: "0 0 0" }}>Ask Coach</h2>
          </div>

          {/* Chat window */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>

            {/* Messages */}
            <div style={{ height: 420, overflowY: "auto", padding: "24px 24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              {coachMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1b365d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 2 }}>
                      <span style={{ color: "#fff", fontSize: "0.62rem", fontWeight: 800 }}>C</span>
                    </div>
                  )}
                  <div style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? "#1b365d" : "#f3f4f6",
                    color: m.role === "user" ? "#fff" : "#1a1a1a",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {coachLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1b365d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: "0.62rem", fontWeight: 800 }}>C</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: "#f3f4f6", borderRadius: "14px 14px 14px 4px" }}>
                    {[0, 1, 2].map(d => (
                      <div key={d} style={{
                        width: 7, height: 7, borderRadius: "50%", background: "#9ca3af",
                        animation: "coachPulse 1.2s ease-in-out infinite",
                        animationDelay: `${d * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={coachEndRef} />
            </div>

            {/* Input */}
            <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px 20px", display: "flex", gap: 10, background: "#fafafa" }}>
              <input
                type="text"
                value={coachInput}
                onChange={e => setCoachInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendCoach(); } }}
                placeholder="Ask Coach about real estate, Academy courses, or your production..."
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 9,
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem",
                  outline: "none",
                  background: "#fff",
                  color: "#1a1a1a",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={sendCoach}
                disabled={coachLoading || !coachInput.trim()}
                style={{
                  padding: "11px 22px",
                  borderRadius: 9,
                  border: "none",
                  background: coachLoading || !coachInput.trim() ? "#e5e7eb" : "#1b365d",
                  color: coachLoading || !coachInput.trim() ? "#9ca3af" : "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: coachLoading || !coachInput.trim() ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  fontFamily: "inherit",
                }}
              >
                Ask
              </button>
            </div>
          </div>

          {/* Suggested questions */}
          <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              "What does Course 03 cover?",
              "How do I build a geographic farm?",
              "What is transaction broker vs single agent?",
              "How should I structure my daily schedule?",
              "What is a material defect in Florida?",
            ].map(q => (
              <button
                key={q}
                onClick={() => { setCoachInput(q); }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1b365d"; (e.currentTarget as HTMLButtonElement).style.color = "#1b365d"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#d1d5db"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coach pulse animation */}
      <style>{`
        @keyframes coachPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e7eb", background: "#f8f9fa", padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
        2026 Bear Team Real Estate · Bethanne Baer, Broker/Owner · Orlando, FL
      </footer>
    </div>
  );
}
