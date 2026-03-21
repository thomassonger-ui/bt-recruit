"use client";

export const dynamic = "force-dynamic";

export default function AcademyPage() {
  const courses = [
    {
      number: "01",
      title: "Orientation: Culture & Expectations",
      tag: "Required · Start Here",
      tagColor: "#2d4a6b",
      duration: "~45 min",
      description: "Start here. Learn how Bear Team operates, what we expect from every agent, and what you can expect from us. This course covers our culture, communication standards, and the BearTeamOS™ framework that runs everything.",
      topics: ["Bear Team culture and operating principles", "Agent expectations and accountability standards", "How BearTeamOS™ supports your business", "Your first 30 days roadmap"],
      icon: "🏠",
    },
    {
      number: "02",
      title: "Brokerage Structure: How We Function",
      tag: "Required",
      tagColor: "#2d4a6b",
      duration: "~60 min",
      description: "Understand exactly how your money works here. Commission tiers, the $16K cap model, fee structure, and how you advance from 60/40 to 90/10 automatically as you produce.",
      topics: ["Progressive split tiers: 60/40 → 70/30 → 80/20 → 90/10", "$16,000 company dollar cap — how it works", "Zero monthly fees, zero desk fees, zero tech fees", "$150 flat transaction fee — the only cost per closing", "E&O insurance: fully covered by Bear Team"],
      icon: "📊",
    },
    {
      number: "03",
      title: "Compliance & Risk: How We Protect",
      tag: "Required",
      tagColor: "#2d4a6b",
      duration: "~50 min",
      description: "Know what keeps your license clean and your clients protected. Florida license law, Fair Housing requirements, contract obligations, and how Bear Team handles E&O — so you never have to worry about coverage.",
      topics: ["Florida real estate license law essentials", "Fair Housing: what it means in practice", "Contract execution and disclosure requirements", "E&O coverage and how claims are handled", "Compliance escalation procedures"],
      icon: "🛡️",
    },
    {
      number: "04",
      title: "Operational Systems: How We Execute",
      tag: "Required",
      tagColor: "#2d4a6b",
      duration: "~60 min",
      description: "The full transaction workflow from contract to close. Checklists, CRM discipline, submission procedures, and how to run a clean deal every time using Bear Team's proven systems.",
      topics: ["Transaction workflow: contract to close", "CRM usage and follow-up standards", "Checklist-based execution for every deal", "File submission and document management", "Coordination with Bethanne and the team"],
      icon: "⚙️",
    },
    {
      number: "05",
      title: "Agent Development: How We Grow",
      tag: "Development Track",
      tagColor: "#1a6b3c",
      duration: "~90 min",
      description: "Build a business that runs without you grinding. Lead generation systems, buyer and listing mastery, personal brand strategy, and the habits that separate top producers from the rest.",
      topics: ["Lead generation: digital, referral, and community channels", "Buyer representation from first call to closing", "Listing strategy: pricing, staging, negotiation", "Personal brand and marketing toolkit", "90-day business plan framework"],
      icon: "📈",
    },
    {
      number: "06",
      title: "Leadership Development: How We Lead",
      tag: "Advanced Track",
      tagColor: "#6b4a1a",
      duration: "~60 min",
      description: "For agents building toward team leadership. Scaling your production, mentoring others, and contributing to the Bear Team culture that attracted you here in the first place.",
      topics: ["Scaling production to 20+ deals/year", "Mentoring and accountability partnerships", "Building your personal brand within Bear Team", "Leadership within BearTeamOS™", "Pathways to team lead and beyond"],
      icon: "🎯",
    },
  ];

  const outcomes = [
    "Complete understanding of your splits, cap, and what you actually take home",
    "Full command of the transaction process — no guessing, no mistakes",
    "Compliance confidence — Fair Housing, E&O, contracts, license law",
    "A built-out lead generation system for the Orlando market",
    "A 90-day business plan for your first quarter at Bear Team",
    "Access to BearTeamOS™ — the operating system behind every top producer here",
  ];

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#f8f9fa", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "#1b365d", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.75rem" }}>BT</div>
          <span style={{ color: "#1b365d", fontWeight: 700, fontSize: "0.95rem" }}>Bear Real Estate Team</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="/#why-scout" style={{ color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Why Scout</a>
          <a href="/#see-scout" style={{ color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>See Scout</a>
          <a href="/#try-it" style={{ color: "#374151", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Try It</a>
          <a href="sms:+14077588102" style={{ background: "#2d4a6b", color: "#ffffff", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600, padding: "9px 20px", borderRadius: "8px", whiteSpace: "nowrap" }}>Text Me Scout</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1b365d 0%, #2d4a6b 60%, #1a3050 100%)", padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 24, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          BearTeam Academy™
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, margin: "0 0 20px", lineHeight: 1.15 }}>
          Training Built for<br />Bear Team Agents
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.6 }}>
          6 courses. Free for every agent. Covers everything from your first day to your first 20-deal year. No generic real estate content — every lesson is built around how Bear Team actually operates.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/thomas-songer/bear-team-meet" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#1b365d", textDecoration: "none", fontWeight: 700, padding: "14px 32px", borderRadius: 10, fontSize: "0.95rem" }}>Book a Call with Tom</a>
          <a href="/chat" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none", fontWeight: 600, padding: "14px 32px", borderRadius: 10, fontSize: "0.95rem", border: "1px solid rgba(255,255,255,0.25)" }}>Ask Scout About Academy</a>
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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a", marginBottom: 8 }}>The 6 Courses</h2>
        <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 48, fontSize: "0.95rem" }}>Courses 1–4 are required for all new agents. Courses 5–6 are available immediately and built for agents ready to grow.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {courses.map((course) => (
            <div key={course.number} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "28px 32px" }}>
                {/* Number */}
                <div style={{ width: 56, height: 56, borderRadius: 12, background: "#1b365d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.4rem" }}>
                  {course.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff", background: course.tagColor, padding: "3px 10px", borderRadius: 20 }}>{course.tag}</span>
                    <span style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 500 }}>Course {course.number} · {course.duration}</span>
                  </div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a1a1a", margin: "0 0 10px" }}>{course.title}</h3>
                  <p style={{ color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 16px" }}>{course.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {course.topics.map((t) => (
                      <span key={t} style={{ fontSize: "0.75rem", background: "#f3f4f6", color: "#374151", padding: "4px 10px", borderRadius: 6, fontWeight: 500 }}>✓ {t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outcomes */}
      <div style={{ background: "#1b365d", padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "1.8rem", fontWeight: 800, marginBottom: 12 }}>What You Walk Away With</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 40, fontSize: "0.95rem" }}>Every agent who completes BearTeam Academy is fully operational — no gaps, no guessing.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            {outcomes.map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px" }}>
                <span style={{ color: "#4ade80", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem", lineHeight: 1.5 }}>{o}</span>
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

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e7eb", background: "#f8f9fa", padding: "24px", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
        © 2026 Bear Team Real Estate · Bethanne Baer, Broker/Owner · Orlando, FL
      </footer>
    </div>
  );
}
