"use client"

import { useState, useEffect, useCallback } from "react"

interface StageData { count: number; value: number; weighted: number }
interface FunnelStage { name: string; count: number; dropoff: number; dropoffRate: number; lostValue: number }
interface StalledLead { id: string; name: string; email: string; phone: string; stage: string; brokerage: string; deal_count: number; last_activity: string; days_stalled: number; estimated_value: number; drip_step: number }
interface SourceData { leads: number; booked: number; joined: number; gciValue: number }
interface RTBucket { bucket: string; label: string; total: number; booked: number; bookRate: number; joinRate: number }

interface DashboardData {
  summary: { totalLeads: number; weekLeads: number; monthLeads: number; uniqueSessions: number; convCount: number }
  funnel: { visitors: number; leads: number; booked: number; noShows: number; showed: number; joined: number; bookRate: number; showRate: number; joinRate: number }
  statusCounts: Record<string, number>
  recentLeads: { id: string; created_at: string; name: string; email: string; phone: string; status: string; notes: string; event_start: string | null }[]
  pipeline: { totalValue: number; weightedValue: number; closedWonValue: number; byStage: Record<string, StageData>; activeCount: number }
  forecast: { d30: { agents: number; gci: number }; d60: { agents: number; gci: number }; d90: { agents: number; gci: number }; monthlyLeadRate: number; zeroRecruitingNote: string }
  funnelLeaks: { stages: FunnelStage[]; biggestLeak: string; biggestLeakDropoff: number; biggestLeakValue: number }
  responseTime: { avgDisplay: string; avgMinutes: number; correlation: RTBucket[]; speedMultiplier: number | null; sampleSize: number }
  sourceAttribution: { breakdown: Record<string, SourceData>; bestSource: string; bestSourceConvRate: number; bestSourceByValue: string; bestSourceGCI: number }
  stalledLeads: { leads: StalledLead[]; totalCount: number; totalValue: number }
  weeklyTrend: { week: string; leads: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  scout_captured: "#E6A817", booked: "#1B8C3A", no_show: "#C62828",
  completed: "#0B1D3A", joined: "#7C3AED", unknown: "#9CA3AF",
}
const STATUS_LABELS: Record<string, string> = {
  scout_captured: "Captured", booked: "Booked", no_show: "No Show",
  completed: "Completed", joined: "Joined", unknown: "Unknown",
}

const fmt$ = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`

export default function DashboardPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "leads" | "stalled">("overview")

  const markJoined = async (leadId: string) => {
    if (!confirm("Mark this agent as joined? This will send them a welcome email and alert Tom.")) return
    setJoiningId(leadId)
    try {
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, pw: password }),
      })
      if (res.ok) {
        alert("Done — welcome email sent, Tom alerted.")
        fetchData(password)
      } else {
        alert("Something went wrong. Try again.")
      }
    } catch { alert("Failed to send.") }
    finally { setJoiningId(null) }
  }

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/dashboard?pw=${encodeURIComponent(pw)}`)
      if (res.status === 401) { setError("Wrong password."); setAuthed(false); return }
      const json = await res.json()
      setData(json); setAuthed(true)
    } catch { setError("Failed to load data.") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authed || !password) return
    const interval = setInterval(() => fetchData(password), 60000)
    return () => clearInterval(interval)
  }, [authed, password, fetchData])

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B1D3A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "40px 48px", width: 360, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>BearTeamOS</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>Scout Analytics Dashboard</div>
          <input type="password" placeholder="Enter password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchData(password)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 15, boxSizing: "border-box", marginBottom: 12, outline: "none" }}
          />
          {error && <div style={{ color: "#C62828", fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <button onClick={() => fetchData(password)} disabled={loading}
            style={{ width: "100%", padding: "10px 0", background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Loading..." : "Enter"}
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null
  const { summary, funnel, statusCounts, recentLeads, pipeline, forecast, funnelLeaks, responseTime, sourceAttribution, stalledLeads, weeklyTrend } = data
  const maxWeeklyLeads = Math.max(...(weeklyTrend || []).map(w => w.leads), 1)

  const tabStyle = (tab: string) => ({
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer" as const, fontSize: 13, fontWeight: 600,
    background: activeTab === tab ? "#fff" : "transparent",
    color: activeTab === tab ? "#0B1D3A" : "rgba(255,255,255,0.6)",
  })

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0B1D3A", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>BearTeamOS — Scout Dashboard</div>
          <div style={{ color: "#93C5FD", fontSize: 12, marginTop: 2 }}>Live recruiting funnel · Auto-refreshes every 60s</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(["overview", "pipeline", "leads", "stalled"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
              {tab === "overview" ? "Overview" : tab === "pipeline" ? `Pipeline ${fmt$(pipeline?.weightedValue || 0)}` : tab === "leads" ? "All Leads" : `Stalled (${stalledLeads?.totalCount || 0})`}
            </button>
          ))}
          <button onClick={() => fetchData(password)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer", marginLeft: 8 }}>↺</button>
        </div>
      </div>

      <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Leads", value: summary.totalLeads, color: "#0B1D3A" },
                { label: "This Week", value: summary.weekLeads, color: "#1B8C3A" },
                { label: "This Month", value: summary.monthLeads, color: "#1B8C3A" },
                { label: "Scout Sessions", value: summary.uniqueSessions, color: "#E6A817" },
                { label: "Agents Joined", value: funnel.joined, color: "#7C3AED" },
              ].map(card => (
                <div key={card.label} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Funnel leaks */}
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A" }}>Conversion Funnel</div>
                  {funnelLeaks?.biggestLeak && (
                    <div style={{ background: "#FEF2F2", color: "#C62828", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>
                      Biggest leak: {funnelLeaks.biggestLeak}
                    </div>
                  )}
                </div>
                {funnelLeaks?.stages?.map((stage, i) => (
                  <div key={stage.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#374151" }}>{stage.name}</span>
                      <span style={{ fontWeight: 600, color: "#0B1D3A" }}>
                        {stage.count}
                        {i > 0 && stage.dropoff > 0 && <span style={{ color: "#C62828", fontWeight: 400 }}> (−{stage.dropoff})</span>}
                      </span>
                    </div>
                    <div style={{ height: 7, background: "#F3F4F6", borderRadius: 4 }}>
                      <div style={{
                        height: 7, borderRadius: 4, transition: "width 0.6s ease",
                        width: `${Math.min(funnelLeaks.stages[0].count > 0 ? (stage.count / funnelLeaks.stages[0].count) * 100 : 0, 100)}%`,
                        background: ["#93C5FD", "#E6A817", "#1B8C3A", "#0B1D3A", "#7C3AED"][i] || "#9CA3AF"
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly trend */}
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 18 }}>Weekly Lead Trend</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, paddingBottom: 4 }}>
                  {(weeklyTrend || []).map((w, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>{w.leads > 0 ? w.leads : ""}</div>
                      <div style={{ width: "100%", background: i === (weeklyTrend.length - 1) ? "#0B1D3A" : "#BFDBFE", borderRadius: "3px 3px 0 0", height: `${Math.max((w.leads / maxWeeklyLeads) * 90, w.leads > 0 ? 4 : 2)}px`, transition: "height 0.4s ease" }} />
                      <div style={{ fontSize: 9, color: "#9CA3AF", textAlign: "center", lineHeight: 1.2 }}>{w.week}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {/* Response time + correlation */}
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Speed-to-Lead Correlation</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>Faster response = higher booking rate</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: (responseTime?.avgMinutes || 999) < 240 ? "#1B8C3A" : "#C62828" }}>
                    {responseTime?.avgDisplay || "—"}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>avg response</div>
                </div>
                {responseTime?.speedMultiplier && (
                  <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                    Leads booked in &lt;1hr convert {responseTime.speedMultiplier}x more than &gt;24hr leads
                  </div>
                )}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["Response", "Leads", "Booked", "Rate"].map(h => (
                        <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(responseTime?.correlation || []).filter(r => r.total > 0).map(r => (
                      <tr key={r.bucket} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "6px 8px", color: "#374151" }}>{r.label}</td>
                        <td style={{ padding: "6px 8px", color: "#374151" }}>{r.total}</td>
                        <td style={{ padding: "6px 8px", color: "#374151" }}>{r.booked}</td>
                        <td style={{ padding: "6px 8px", fontWeight: 700, color: r.bookRate >= 50 ? "#1B8C3A" : r.bookRate >= 25 ? "#E6A817" : "#C62828" }}>{r.bookRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Source attribution + GCI value */}
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Source Attribution</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 16 }}>Booking rate + GCI value by source</div>
                {sourceAttribution?.bestSourceGCI > 0 && (
                  <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#1e40af", fontWeight: 600 }}>
                    Best ROI source: {sourceAttribution.bestSourceByValue} ({fmt$(sourceAttribution.bestSourceGCI)} GCI produced)
                  </div>
                )}
                {Object.entries(sourceAttribution?.breakdown || {}).map(([source, d]) => {
                  const src = d as SourceData
                  const convRate = src.leads > 0 ? Math.round((src.booked / src.leads) * 100) : 0
                  return (
                    <div key={source} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: "#374151", fontWeight: 500 }}>{source}</span>
                        <span style={{ color: "#6B7280" }}>{src.leads} leads · {convRate}% booked{src.gciValue > 0 ? ` · ${fmt$(src.gciValue)} GCI` : ""}</span>
                      </div>
                      <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3 }}>
                        <div style={{ height: 5, background: "#0B1D3A", borderRadius: 3, width: `${Math.min(convRate, 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Status breakdown */}
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 16 }}>Lead Status</div>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 6, marginBottom: 6, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[status] || "#9CA3AF" }} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{STATUS_LABELS[status] || status}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: STATUS_COLORS[status] || "#374151" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PIPELINE TAB ── */}
        {activeTab === "pipeline" && (
          <>
            {/* 90-day forecast */}
            <div style={{ background: "#0B1D3A", borderRadius: 10, padding: "20px 24px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>90-Day Recruiting Forecast</div>
                  <div style={{ color: "#93C5FD", fontSize: 11, marginTop: 2 }}>{forecast?.zeroRecruitingNote || "Based on current pipeline"} · {forecast?.monthlyLeadRate || 0} leads/mo current rate</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { label: "30-Day Projection", agents: forecast?.d30?.agents || 0, gci: forecast?.d30?.gci || 0 },
                  { label: "60-Day Projection", agents: forecast?.d60?.agents || 0, gci: forecast?.d60?.gci || 0 },
                  { label: "90-Day Projection", agents: forecast?.d90?.agents || 0, gci: forecast?.d90?.gci || 0 },
                ].map(f => (
                  <div key={f.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "16px 18px" }}>
                    <div style={{ color: "#93C5FD", fontSize: 11, marginBottom: 6 }}>{f.label}</div>
                    <div style={{ color: "#c9a84c", fontSize: 28, fontWeight: 700 }}>{f.agents}</div>
                    <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>projected agents</div>
                    <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginTop: 8 }}>{fmt$(f.gci)}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>projected GCI</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Weighted Pipeline Value", value: fmt$(pipeline?.weightedValue || 0), sub: "Probability-adjusted forecast", color: "#0B1D3A" },
                { label: "Total Pipeline (Unweighted)", value: fmt$(pipeline?.totalValue || 0), sub: `${pipeline?.activeCount || 0} active leads`, color: "#1B8C3A" },
                { label: "Closed Won Revenue", value: fmt$(pipeline?.closedWonValue || 0), sub: "Annual broker revenue locked in", color: "#7C3AED" },
              ].map(card => (
                <div key={card.label} style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{card.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Pipeline by Stage</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>Avg 6 deals/yr · $415K avg price · 40% Bear Team share at Tier 1</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F3F4F6" }}>
                    {["Stage", "Leads", "Total Value", "Weighted Value", "Probability"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(pipeline?.byStage || {}).map(([stage, d]) => {
                    const sd = d as StageData
                    const prob = sd.value > 0 ? Math.round((sd.weighted / sd.value) * 100) : 0
                    return (
                      <tr key={stage} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 500, color: "#0B1D3A" }}>{stage}</td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{sd.count}</td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{fmt$(sd.value)}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1B8C3A" }}>{fmt$(sd.weighted)}</td>
                        <td style={{ padding: "10px 14px", color: "#6B7280" }}>{prob}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── ALL LEADS TAB ── */}
        {activeTab === "leads" && (
          <div style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 20 }}>All Recent Leads</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F3F4F6" }}>
                    {["Date", "Name", "Email", "Phone", "Status", "Notes", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length === 0 && <tr><td colSpan={7} style={{ padding: 20, color: "#9CA3AF", textAlign: "center" }}>No leads yet.</td></tr>}
                  {recentLeads.map((lead, i) => (
                    <tr key={lead.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                      <td style={{ padding: "10px 14px", color: "#6B7280", whiteSpace: "nowrap" }}>{new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0B1D3A" }}>{lead.name || "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{lead.email || "—"}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{lead.phone || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: (STATUS_COLORS[lead.status] || "#9CA3AF") + "18", color: STATUS_COLORS[lead.status] || "#374151" }}>
                          {STATUS_LABELS[lead.status] || lead.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#6B7280", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.notes || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {lead.status !== "joined" && lead.email ? (
                          <button onClick={() => markJoined(lead.id)} disabled={joiningId === lead.id}
                            style={{ background: joiningId === lead.id ? "#E5E7EB" : "#0B1D3A", color: joiningId === lead.id ? "#9CA3AF" : "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: joiningId === lead.id ? "default" : "pointer", whiteSpace: "nowrap" }}>
                            {joiningId === lead.id ? "Sending..." : "Mark Joined"}
                          </button>
                        ) : lead.status === "joined" ? (
                          <span style={{ fontSize: 12, color: "#1B8C3A", fontWeight: 600 }}>✓ Joined</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STALLED LEADS TAB ── */}
        {activeTab === "stalled" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 24 }}>
              <div style={{ background: "#fff", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#C62828" }}>{stalledLeads?.totalCount || 0}</div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginTop: 4 }}>Stalled Leads</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>No activity in 14+ days</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#E6A817" }}>{fmt$(stalledLeads?.totalValue || 0)}</div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginTop: 4 }}>At-Risk Pipeline Value</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Estimated annual broker revenue</div>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Stalled Leads — Priority Order</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>Sorted by estimated value. These leads need a personal touch from Tom.</div>
              {(!stalledLeads?.leads || stalledLeads.leads.length === 0) && <div style={{ color: "#9CA3AF", textAlign: "center", padding: 32 }}>No stalled leads. Pipeline is healthy.</div>}
              {stalledLeads?.leads?.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F3F4F6" }}>
                      {["Name", "Brokerage", "Stage", "Days Stalled", "Est. Value", "Drip Step", "Action"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stalledLeads.leads.map((lead, i) => (
                      <tr key={lead.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600, color: "#0B1D3A" }}>{lead.name || "—"}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{lead.email}</div>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{lead.brokerage || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ background: "#FEF2F2", color: "#C62828", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{lead.stage || "—"}</span>
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: lead.days_stalled > 30 ? "#C62828" : "#E6A817" }}>{lead.days_stalled}d</td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1B8C3A" }}>{fmt$(lead.estimated_value)}</td>
                        <td style={{ padding: "10px 14px", color: "#6B7280" }}>{lead.drip_step > 0 ? `Email ${lead.drip_step} sent` : "Not started"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <button onClick={() => markJoined(lead.id)} disabled={joiningId === lead.id}
                            style={{ background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            Mark Joined
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
