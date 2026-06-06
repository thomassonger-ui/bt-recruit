"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getCurrentCampaign, CAMPAIGN_SIGNATURE } from "../../lib/campaigns"

interface RecruitEvent {
  id: string
  type: "broker_open" | "workshop"
  title: string
  event_date: string | null
  event_time: string | null
  location: string | null
  notes: string | null
  invited: number
  attended: number
  recruited: number
  status: string
}

interface ProspectRow {
  id: string
  full_name?: string
  brokerage?: string | null
  county?: string | null
  license_date?: string | null
  license_number?: string | null
  city?: string | null
}

interface StageData { count: number; value: number; weighted: number }
interface FunnelStage { name: string; count: number; dropoff: number; dropoffRate: number; lostValue: number }
interface StalledLead { id: string; name: string; email: string; phone: string; stage: string; brokerage: string; deal_count: number; last_activity: string; days_stalled: number; estimated_value: number; drip_step: number }
interface SourceData { leads: number; booked: number; joined: number; gciValue: number }
interface RTBucket { bucket: string; label: string; total: number; booked: number; bookRate: number; joinRate: number }
interface DripLead { id: string; name: string; email: string; brokerage: string; stage: string; drip_step: number; drip_last_sent_at: string | null; event_end: string; days_since_call: number; next_step_due: string | null; next_subject: string | null; sequence_complete: boolean }
interface DripDueLead { id: string; name: string; email: string; brokerage: string; drip_step: number; next_step: number; next_subject: string; event_end: string; drip_last_sent_at: string | null }
interface DripStepCount { step: number; label: string; count: number }

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
  drip: { activeCount: number; completedCount: number; notStartedCount: number; totalEligible: number; dueToday: DripDueLead[]; stepCounts: DripStepCount[]; leads: DripLead[] }
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
  const [pausingDripId, setPausingDripId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "campaign" | "events" | "pipeline" | "leads" | "stalled" | "drip" | "prospects">("overview")

  // Campaign (auto-rotating, computed from date)
  const campaign = getCurrentCampaign()
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 1500)
    }).catch(() => {})
  }

  // Events tracker (broker opens + workshops)
  const [events, setEvents] = useState<RecruitEvent[]>([])
  const [eventTotals, setEventTotals] = useState({ invited: 0, attended: 0, recruited: 0 })
  const [eventsLoading, setEventsLoading] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [savingEvent, setSavingEvent] = useState(false)
  const [evForm, setEvForm] = useState<{ type: "broker_open" | "workshop"; title: string; event_date: string; event_time: string; location: string; notes: string }>(
    { type: "broker_open", title: "", event_date: "", event_time: "", location: "", notes: "" }
  )

  // Prospects state
  const [prospects, setProspects] = useState<ProspectRow[]>([])
  const [prospectsLoading, setProspectsLoading] = useState(false)
  const [prospectSearch, setProspectSearch] = useState("")
  const [prospectBrokerage, setProspectBrokerage] = useState("")
  const [prospectCounty, setProspectCounty] = useState("")
  const [showImportProspects, setShowImportProspects] = useState(false)
  const [importingProspects, setImportingProspects] = useState(false)
  const [importProspectResult, setImportProspectResult] = useState("")
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [acceptPhone, setAcceptPhone] = useState("")
  const [acceptEmail, setAcceptEmail] = useState("")
  const [showAcceptForm, setShowAcceptForm] = useState<string | null>(null)

  const fetchProspects = async () => {
    setProspectsLoading(true)
    try {
      const params = new URLSearchParams({ pw: password })
      if (prospectSearch) params.set("search", prospectSearch)
      if (prospectBrokerage) params.set("brokerage", prospectBrokerage)
      if (prospectCounty) params.set("county", prospectCounty)
      const res = await fetch(`/api/prospects?${params}`)
      const d = await res.json()
      setProspects(d.prospects || [])
    } catch { setProspects([]) }
    finally { setProspectsLoading(false) }
  }

  const importDBPR = async (file: File) => {
    setImportingProspects(true)
    setImportProspectResult("")
    try {
      const csvText = await file.text()
      const res = await fetch("/api/import-prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, pw: password }),
      })
      const d = await res.json()
      setImportProspectResult(`Imported ${d.imported} agents. ${d.filtered} filtered out. ${d.skipped} skipped.`)
      fetchProspects()
    } catch { setImportProspectResult("Error importing CSV.") }
    finally { setImportingProspects(false) }
  }

  const acceptProspect = async (prospectId: string) => {
    setAcceptingId(prospectId)
    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, pw: password, phone: acceptPhone, email: acceptEmail }),
      })
      if (res.ok) {
        setShowAcceptForm(null)
        setAcceptPhone("")
        setAcceptEmail("")
        fetchProspects()
      }
    } catch {}
    finally { setAcceptingId(null) }
  }

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

  const pauseDrip = async (leadId: string, action: "pause" | "resume") => {
    setPausingDripId(leadId)
    try {
      const res = await fetch("/api/drip-pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, pw: password, action }),
      })
      if (res.ok) {
        fetchData(password)
      } else {
        alert("Something went wrong. Try again.")
      }
    } catch { alert("Failed.") }
    finally { setPausingDripId(null) }
  }

  const fetchEvents = useCallback(async (pw: string) => {
    setEventsLoading(true)
    try {
      const res = await fetch(`/api/events?pw=${encodeURIComponent(pw)}`)
      const d = await res.json()
      setEvents(d.events || [])
      setEventTotals(d.totals || { invited: 0, attended: 0, recruited: 0 })
    } catch { setEvents([]) }
    finally { setEventsLoading(false) }
  }, [])

  const saveEvent = async () => {
    if (!evForm.title.trim()) { alert("Give the event a title."); return }
    setSavingEvent(true)
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...evForm, pw: password }),
      })
      if (res.ok) {
        setShowEventForm(false)
        setEvForm({ type: "broker_open", title: "", event_date: "", event_time: "", location: "", notes: "" })
        fetchEvents(password)
      } else { alert("Could not save event.") }
    } catch { alert("Could not save event.") }
    finally { setSavingEvent(false) }
  }

  const patchEvent = async (id: string, patch: Partial<RecruitEvent>) => {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, ...patch } : e)) // optimistic
    try {
      await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw: password, ...patch }),
      })
      fetchEvents(password)
    } catch {}
  }

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try {
      await fetch(`/api/events?pw=${encodeURIComponent(password)}&id=${id}`, { method: "DELETE" })
      fetchEvents(password)
    } catch {}
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

  useEffect(() => {
    if (authed && password && activeTab === "events") fetchEvents(password)
  }, [authed, password, activeTab, fetchEvents])

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B1D3A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "40px 48px", width: 360, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Recruit Dashboard</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>Bear Team Real Estate · Orlando, FL</div>
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
  const { summary, funnel, statusCounts, recentLeads, pipeline, forecast, funnelLeaks, responseTime, sourceAttribution, stalledLeads, drip, weeklyTrend } = data
  const maxWeeklyLeads = Math.max(...(weeklyTrend || []).map(w => w.leads), 1)

  const tabStyle = (tab: string) => ({
    padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer" as const, fontSize: 13, fontWeight: 600,
    background: activeTab === tab ? "#fff" : "transparent",
    color: activeTab === tab ? "#0B1D3A" : "rgba(255,255,255,0.6)",
  })

  const copyBtnStyle: React.CSSProperties = {
    marginTop: 10, padding: "5px 12px", fontSize: 11, fontWeight: 600,
    background: "#fff", color: "#2F5C8F", border: "1px solid #E6E8EC",
    borderRadius: 6, cursor: "pointer",
  }
  const evInput: React.CSSProperties = {
    padding: "9px 12px", fontSize: 13, background: "#fff", border: "1px solid #E6E8EC",
    borderRadius: 8, color: "#0B1B33", outline: "none",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FA", fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0B1D3A", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>Recruit Dashboard</div>
          <div style={{ color: "#93C5FD", fontSize: 12, marginTop: 2 }}>Bear Team Real Estate · Live recruiting funnel · Auto-refreshes every 60s</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(["overview", "campaign", "events", "pipeline", "leads", "stalled", "drip", "prospects"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={tabStyle(tab)}>
              {tab === "overview" ? "Overview"
                : tab === "campaign" ? "Campaign"
                : tab === "events" ? `Events${events.length > 0 ? ` (${events.length})` : ""}`
                : tab === "pipeline" ? `Pipeline ${fmt$(pipeline?.weightedValue || 0)}`
                : tab === "leads" ? "All Leads"
                : tab === "stalled" ? `Stalled (${stalledLeads?.totalCount || 0})`
                : tab === "drip" ? `Drip${drip?.dueToday?.length > 0 ? ` 🔔${drip.dueToday.length}` : ""}`
                : "Prospects"}
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
                <div key={card.label} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Funnel leaks */}
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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
              <div style={{ background: "#fff", borderRadius: 10, padding: "22px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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

        {/* ── CAMPAIGN TAB (auto-rotating guerrilla campaign) ── */}
        {activeTab === "campaign" && (
          <>
            {/* Theme banner */}
            <div style={{ background: "#0B1D3A", borderRadius: 16, padding: "26px 28px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div style={{ maxWidth: 620 }}>
                  <div style={{ color: "#7FA8D4", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    This Cycle&apos;s Guerrilla Campaign · Auto-rotates every 30 days
                  </div>
                  <div style={{ color: "#fff", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{campaign.theme.name}</div>
                  <div style={{ color: "#E7ECF3", fontSize: 15, lineHeight: 1.55, marginTop: 12 }}>{campaign.theme.bigIdea}</div>
                  <div style={{ color: "#9DB4D0", fontSize: 13, marginTop: 12 }}>
                    <strong style={{ color: "#cdd9e8" }}>Target pain:</strong> {campaign.theme.targetPain}
                  </div>
                </div>
                <div style={{ minWidth: 180, textAlign: "right" }}>
                  <div style={{ color: "#7FA8D4", fontSize: 12, fontWeight: 600 }}>Day {campaign.dayInCycle} of 30</div>
                  <div style={{ color: "#c9a84c", fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{campaign.daysRemaining}</div>
                  <div style={{ color: "#9DB4D0", fontSize: 12 }}>days left in cycle</div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 99, marginTop: 12, overflow: "hidden" }}>
                    <div style={{ height: 6, background: "#c9a84c", borderRadius: 99, width: `${(campaign.dayInCycle / 30) * 100}%` }} />
                  </div>
                  <div style={{ color: "#6E89AD", fontSize: 11, marginTop: 10 }}>
                    {campaign.cycleStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {campaign.cycleEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div style={{ color: "#6E89AD", fontSize: 11, marginTop: 6 }}>Next up: {campaign.nextTheme.name}</div>
                </div>
              </div>
            </div>

            {/* Play calendar */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px", marginBottom: 20, border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1B33", marginBottom: 4 }}>30-Day Play Calendar</div>
              <div style={{ fontSize: 12, color: "#8A94A6", marginBottom: 18 }}>Run these plays in order. Broker opens and workshops are flagged — schedule them in the Events tab.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[1, 2, 3, 4].map(wk => (
                  <div key={wk} style={{ background: "#F7F8FA", borderRadius: 12, border: "1px solid #E6E8EC", padding: "14px 14px 6px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#2F5C8F", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Week {wk}</div>
                    {campaign.theme.plays.filter(p => p.week === wk).map((p, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <span style={{
                          display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, marginBottom: 5,
                          background: p.event === "broker_open" ? "#0B1D3A" : p.event === "workshop" ? "#c9a84c" : "#E6E8EC",
                          color: p.event === "broker_open" ? "#fff" : p.event === "workshop" ? "#0B1D3A" : "#5B6675",
                        }}>
                          {p.event === "broker_open" ? "BROKER OPEN" : p.event === "workshop" ? "WORKSHOP" : p.channel.toUpperCase()}
                        </span>
                        <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.45 }}>{p.action}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Content & assets */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Social posts */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1B33", marginBottom: 16 }}>Social Posts</div>
                {campaign.theme.content.socialPosts.map((post, i) => (
                  <div key={i} style={{ background: "#F7F8FA", border: "1px solid #E6E8EC", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                    <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{post}</div>
                    <button onClick={() => copy(post, `post-${i}`)} style={copyBtnStyle}>{copied === `post-${i}` ? "✓ Copied" : "Copy"}</button>
                  </div>
                ))}
              </div>

              {/* DMs */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1B33", marginBottom: 16 }}>Direct Messages</div>
                {campaign.theme.content.dms.map((dm, i) => (
                  <div key={i} style={{ background: "#F7F8FA", border: "1px solid #E6E8EC", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
                    <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{dm}</div>
                    <button onClick={() => copy(dm, `dm-${i}`)} style={copyBtnStyle}>{copied === `dm-${i}` ? "✓ Copied" : "Copy"}</button>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "#8A94A6", marginTop: 4 }}>Replace [Name] / [area] before sending. Sign-off: {CAMPAIGN_SIGNATURE}</div>
              </div>

              {/* Flyer + open house */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1B33", marginBottom: 16 }}>Flyer &amp; Open-House Angle</div>
                <div style={{ background: "#0B1D3A", borderRadius: 10, padding: "20px", marginBottom: 14, textAlign: "center" }}>
                  <div style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{campaign.theme.content.flyerHeadline}</div>
                  <div style={{ color: "#9DB4D0", fontSize: 13, marginTop: 10 }}>{campaign.theme.content.flyerSub}</div>
                </div>
                <button onClick={() => copy(`${campaign.theme.content.flyerHeadline}\n${campaign.theme.content.flyerSub}`, "flyer")} style={copyBtnStyle}>{copied === "flyer" ? "✓ Copied" : "Copy flyer text"}</button>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2F5C8F", marginTop: 18, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Open-House Angle</div>
                <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{campaign.theme.content.openHouseAngle}</div>
              </div>

              {/* Event invites */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1B33", marginBottom: 16 }}>Event Plays — Broker Open &amp; Workshop</div>
                <div style={{ background: "#F7F8FA", border: "1px solid #E6E8EC", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#0B1D3A", color: "#fff", marginBottom: 8 }}>BROKER OPEN</span>
                  <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{campaign.theme.content.brokerOpenInvite}</div>
                  <button onClick={() => copy(campaign.theme.content.brokerOpenInvite, "bo")} style={copyBtnStyle}>{copied === "bo" ? "✓ Copied" : "Copy invite"}</button>
                </div>
                <div style={{ background: "#F7F8FA", border: "1px solid #E6E8EC", borderRadius: 10, padding: "14px 16px" }}>
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#c9a84c", color: "#0B1D3A", marginBottom: 8 }}>WORKSHOP</span>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0B1B33", marginBottom: 4 }}>{campaign.theme.content.workshopTitle}</div>
                  <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{campaign.theme.content.workshopInvite}</div>
                  <button onClick={() => copy(`${campaign.theme.content.workshopTitle}\n\n${campaign.theme.content.workshopInvite}`, "ws")} style={copyBtnStyle}>{copied === "ws" ? "✓ Copied" : "Copy invite"}</button>
                </div>
                <button onClick={() => { setEvForm(f => ({ ...f, title: campaign.theme.content.workshopTitle, type: "workshop" })); setActiveTab("events"); setShowEventForm(true) }}
                  style={{ marginTop: 16, width: "100%", padding: "10px 0", background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Schedule these in Events →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── EVENTS TAB (broker opens + workshops) ── */}
        {activeTab === "events" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Events", value: events.length, sub: "Broker opens + workshops", color: "#0B1D3A" },
                { label: "Agents Invited", value: eventTotals.invited, sub: "Across all events", color: "#2F5C8F" },
                { label: "Attended", value: eventTotals.attended, sub: "Showed up", color: "#E6A817" },
                { label: "Recruited", value: eventTotals.recruited, sub: eventTotals.attended > 0 ? `${Math.round((eventTotals.recruited / eventTotals.attended) * 100)}% of attendees` : "From events", color: "#1B8C3A" },
              ].map(card => (
                <div key={card.label} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: "#8A94A6", marginTop: 2 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1B33" }}>Scheduled Events</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => fetchEvents(password)} style={{ padding: "9px 14px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#0B1B33", border: "1px solid #E6E8EC", borderRadius: 8, cursor: "pointer" }}>↺ Refresh</button>
                <button onClick={() => setShowEventForm(v => !v)} style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  {showEventForm ? "Close" : "+ New Event"}
                </button>
              </div>
            </div>

            {showEventForm && (
              <div style={{ background: "#fff", borderRadius: 14, padding: "22px", marginBottom: 20, border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 12 }}>
                  <select value={evForm.type} onChange={e => setEvForm(f => ({ ...f, type: e.target.value as "broker_open" | "workshop" }))} style={evInput}>
                    <option value="broker_open">Broker Open</option>
                    <option value="workshop">Workshop</option>
                  </select>
                  <input value={evForm.title} onChange={e => setEvForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" style={evInput} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12, marginBottom: 12 }}>
                  <input type="date" value={evForm.event_date} onChange={e => setEvForm(f => ({ ...f, event_date: e.target.value }))} style={evInput} />
                  <input value={evForm.event_time} onChange={e => setEvForm(f => ({ ...f, event_time: e.target.value }))} placeholder="Time (e.g. 11–1)" style={evInput} />
                  <input value={evForm.location} onChange={e => setEvForm(f => ({ ...f, location: e.target.value }))} placeholder="Location / address" style={evInput} />
                </div>
                <textarea value={evForm.notes} onChange={e => setEvForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (target zip, co-host, listing...)" style={{ ...evInput, width: "100%", minHeight: 60, resize: "vertical", boxSizing: "border-box" }} />
                <div style={{ marginTop: 12 }}>
                  <button onClick={saveEvent} disabled={savingEvent} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 8, cursor: savingEvent ? "default" : "pointer" }}>
                    {savingEvent ? "Saving..." : "Save Event"}
                  </button>
                </div>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
              {eventsLoading ? (
                <div style={{ color: "#8A94A6", textAlign: "center", padding: 30 }}>Loading events...</div>
              ) : events.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#8A94A6" }}>
                  <div style={{ fontSize: 14, color: "#0B1B33", marginBottom: 6 }}>No events scheduled yet.</div>
                  <div style={{ fontSize: 12 }}>Click &quot;+ New Event&quot; to add a broker open or workshop — or schedule this cycle&apos;s plays from the Campaign tab.</div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F7F8FA" }}>
                        {["Type", "Event", "Date", "Invited", "Attended", "Recruited", "Status", ""].map(h => (
                          <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#8A94A6", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev, i) => (
                        <tr key={ev.id} style={{ borderBottom: "1px solid #F1F2F4", background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: ev.type === "broker_open" ? "#0B1D3A" : "#c9a84c", color: ev.type === "broker_open" ? "#fff" : "#0B1D3A", whiteSpace: "nowrap" }}>
                              {ev.type === "broker_open" ? "BROKER OPEN" : "WORKSHOP"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: 600, color: "#0B1B33" }}>{ev.title}</div>
                            {ev.location && <div style={{ fontSize: 11, color: "#8A94A6" }}>{ev.location}{ev.event_time ? ` · ${ev.event_time}` : ""}</div>}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#374151", whiteSpace: "nowrap" }}>
                            {ev.event_date ? new Date(ev.event_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                          </td>
                          {(["invited", "attended", "recruited"] as const).map(field => (
                            <td key={field} style={{ padding: "10px 12px" }}>
                              <input
                                type="number" min={0} value={ev[field]}
                                onChange={e => patchEvent(ev.id, { [field]: Number(e.target.value) || 0 } as Partial<RecruitEvent>)}
                                style={{ width: 56, padding: "5px 8px", fontSize: 13, border: "1px solid #E6E8EC", borderRadius: 6, color: "#0B1B33", outline: "none" }}
                              />
                            </td>
                          ))}
                          <td style={{ padding: "10px 12px" }}>
                            <select value={ev.status} onChange={e => patchEvent(ev.id, { status: e.target.value })}
                              style={{ padding: "5px 8px", fontSize: 12, border: "1px solid #E6E8EC", borderRadius: 6, color: "#0B1B33", background: "#fff", outline: "none" }}>
                              <option value="planned">Planned</option>
                              <option value="done">Done</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button onClick={() => deleteEvent(ev.id)} title="Delete" style={{ background: "#FEF2F2", color: "#C62828", border: "1px solid #FECACA", borderRadius: 6, padding: "5px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <div key={card.label} style={{ background: "#fff", borderRadius: 10, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                  <div style={{ fontSize: 36, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{card.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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
          <div style={{ background: "#fff", borderRadius: 10, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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

        {/* ── DRIP CAMPAIGN TAB ── */}
        {activeTab === "drip" && (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Active in Drip", value: drip?.activeCount || 0, sub: "In sequence (steps 1–4)", color: "#0B1D3A" },
                { label: "Due Today", value: drip?.dueToday?.length || 0, sub: "Next email fires today", color: drip?.dueToday?.length > 0 ? "#C62828" : "#1B8C3A" },
                { label: "Sequence Complete", value: drip?.completedCount || 0, sub: "All 5 emails sent", color: "#7C3AED" },
                { label: "Not Started", value: drip?.notStartedCount || 0, sub: "Had call, no drip yet", color: "#E6A817" },
              ].map(card => (
                <div key={card.label} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Step distribution bar */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "22px 24px", marginBottom: 20, border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 16 }}>Sequence Step Distribution</div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 64 }}>
                {(drip?.stepCounts || []).map((s, i) => {
                  const maxCount = Math.max(...(drip?.stepCounts || []).map(x => x.count), 1)
                  const barColors = ["#E5E7EB", "#93C5FD", "#60A5FA", "#3B82F6", "#1D4ED8", "#7C3AED"]
                  return (
                    <div key={s.step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{s.count > 0 ? s.count : ""}</div>
                      <div style={{ width: "100%", background: barColors[i] || "#9CA3AF", borderRadius: "3px 3px 0 0", height: `${Math.max(s.count > 0 ? (s.count / maxCount) * 44 : 2, 2)}px`, transition: "height 0.4s" }} />
                      <div style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", lineHeight: 1.3 }}>{s.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Due today alert */}
            {drip?.dueToday?.length > 0 && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#C62828" }}>🔔 {drip.dueToday.length} Drip Email{drip.dueToday.length > 1 ? "s" : ""} Fire Today</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>Auto-sent by cron at 8 AM ET — verify in Resend if needed</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "rgba(198,40,40,0.07)" }}>
                      {["Agent", "Brokerage", "Current Step", "Sending Next", "Subject Preview"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#C62828", fontWeight: 600, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {drip.dueToday.map((lead: DripDueLead) => (
                      <tr key={lead.id} style={{ borderBottom: "1px solid rgba(198,40,40,0.1)" }}>
                        <td style={{ padding: "9px 12px" }}>
                          <div style={{ fontWeight: 600, color: "#0B1D3A" }}>{lead.name || "—"}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{lead.email}</div>
                        </td>
                        <td style={{ padding: "9px 12px", color: "#374151" }}>{lead.brokerage || "—"}</td>
                        <td style={{ padding: "9px 12px" }}>
                          <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                            {lead.drip_step === 0 ? "None sent" : `Email ${lead.drip_step} sent`}
                          </span>
                        </td>
                        <td style={{ padding: "9px 12px" }}>
                          <span style={{ background: "#FEE2E2", color: "#C62828", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                            Email {lead.next_step} → Today
                          </span>
                        </td>
                        <td style={{ padding: "9px 12px", color: "#6B7280", fontStyle: "italic", fontSize: 12 }}>{lead.next_subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Full drip sequence table */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>All Leads in Drip Sequence</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
                {drip?.totalEligible || 0} leads eligible (had a call, not closed) · Auto-sent via cron daily at 8 AM ET
              </div>
              {(!drip?.leads || drip.leads.length === 0) && (
                <div style={{ color: "#9CA3AF", textAlign: "center", padding: 40 }}>No leads in drip sequence yet. Leads appear here after a call is completed.</div>
              )}
              {drip?.leads?.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F3F4F6" }}>
                        {["Agent", "Brokerage", "Stage", "Days Since Call", "Step", "Last Sent", "Next Email Due", "Status", "Action"].map(h => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drip.leads.map((lead: DripLead, i: number) => {
                        const isOverdue = lead.next_step_due && !lead.sequence_complete && new Date(lead.next_step_due).getTime() <= Date.now()
                        const isDueToday = drip.dueToday.some((d: DripDueLead) => d.id === lead.id)
                        let rowBg = i % 2 === 0 ? "#fff" : "#F9FAFB"
                        if (isDueToday) rowBg = "#FFF7ED"
                        return (
                          <tr key={lead.id} style={{ background: rowBg, borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "10px 14px" }}>
                              <div style={{ fontWeight: 600, color: "#0B1D3A" }}>{lead.name || "—"}</div>
                              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{lead.email}</div>
                            </td>
                            <td style={{ padding: "10px 14px", color: "#374151" }}>{lead.brokerage || "—"}</td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ background: "#F3F4F6", color: "#374151", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>{lead.stage || "—"}</span>
                            </td>
                            <td style={{ padding: "10px 14px", color: lead.days_since_call > 14 ? "#C62828" : "#374151", fontWeight: lead.days_since_call > 14 ? 600 : 400 }}>
                              {lead.days_since_call}d
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              {lead.sequence_complete ? (
                                <span style={{ background: "#F3E8FF", color: "#7C3AED", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>✓ Done</span>
                              ) : lead.drip_step === 0 ? (
                                <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Not started</span>
                              ) : (
                                <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Email {lead.drip_step}/5</span>
                              )}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#6B7280", fontSize: 12 }}>
                              {lead.drip_last_sent_at ? new Date(lead.drip_last_sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                            </td>
                            <td style={{ padding: "10px 14px", fontSize: 12 }}>
                              {lead.sequence_complete ? (
                                <span style={{ color: "#7C3AED" }}>Sequence complete</span>
                              ) : lead.next_step_due ? (
                                <div>
                                  <span style={{ color: isDueToday ? "#C62828" : isOverdue ? "#E6A817" : "#374151", fontWeight: isDueToday ? 700 : 400 }}>
                                    {isDueToday ? "⚡ Today" : new Date(lead.next_step_due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </span>
                                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Email {lead.drip_step + 1}</div>
                                </div>
                              ) : "—"}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              {lead.sequence_complete ? null : lead.next_subject ? (
                                <div style={{ fontSize: 11, color: "#6B7280", fontStyle: "italic", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {lead.next_subject}
                                </div>
                              ) : null}
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              {!lead.sequence_complete && (
                                <button
                                  onClick={() => pauseDrip(lead.id, "pause")}
                                  disabled={pausingDripId === lead.id}
                                  title="Agent replied — pause drip sequence"
                                  style={{ background: pausingDripId === lead.id ? "#E5E7EB" : "#FEF2F2", color: "#C62828", border: "1px solid #FECACA", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: pausingDripId === lead.id ? "default" : "pointer", whiteSpace: "nowrap" }}>
                                  {pausingDripId === lead.id ? "..." : "⏸ Pause"}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── STALLED LEADS TAB ── */}
        {activeTab === "stalled" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 24 }}>
              <div style={{ background: "#fff", borderRadius: 10, padding: "20px 24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#C62828" }}>{stalledLeads?.totalCount || 0}</div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginTop: 4 }}>Stalled Leads</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>No activity in 14+ days</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 10, padding: "20px 24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#E6A817" }}>{fmt$(stalledLeads?.totalValue || 0)}</div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginTop: 4 }}>At-Risk Pipeline Value</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Estimated annual broker revenue</div>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "24px", border: "1px solid #E6E8EC", boxShadow: "0 1px 2px rgba(11,27,51,0.04)" }}>
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

        {activeTab === "prospects" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0B1D3A" }}>DBPR Agent Prospects</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowImportProspects(v => !v)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, background: showImportProspects ? "#1B8C3A" : "#0B1D3A", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  {showImportProspects ? "Close Import" : "Import DBPR CSV"}
                </button>
                <button onClick={fetchProspects} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                  Load Prospects
                </button>
              </div>
            </div>

            {showImportProspects && (
              <div style={{ marginBottom: 16, padding: 16, background: "#f0f9f1", border: "1px solid #1B8C3A", borderRadius: 8 }}>
                <p style={{ fontSize: 13, marginBottom: 8, color: "#1a1a1a" }}>
                  <strong>How to import:</strong><br />
                  1. Go to <a href="https://www2.myfloridalicense.com/real-estate-commission/public-records/" target="_blank" style={{ color: "#1B8C3A" }}>DBPR Public Records</a><br />
                  2. Under &quot;Licensee Files&quot;, download the CSV for your region (Region 5 = Seminole, Osceola, Lake, Brevard, Volusia) or the Orange County file<br />
                  3. Upload the CSV here — system auto-filters for active Sales Associates with 1-5 years experience in Orlando metro
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, background: "#E6A817", color: "#0B1D3A", borderRadius: 6, cursor: "pointer" }}>
                    Choose DBPR CSV
                    <input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) importDBPR(f); e.target.value = "" }} style={{ display: "none" }} />
                  </label>
                  {importingProspects && <span style={{ fontSize: 12, color: "#666" }}>Importing...</span>}
                  {importProspectResult && <span style={{ fontSize: 12, color: importProspectResult.includes("Error") ? "#C62828" : "#1B8C3A", fontWeight: 600 }}>{importProspectResult}</span>}
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                value={prospectSearch}
                onChange={e => setProspectSearch(e.target.value)}
                placeholder="Search by name..."
                style={{ flex: 1, minWidth: 150, padding: "8px 12px", fontSize: 12, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, color: "#1a1a1a", outline: "none" }}
              />
              <input
                value={prospectBrokerage}
                onChange={e => setProspectBrokerage(e.target.value)}
                placeholder="Filter by brokerage (KW, eXp, Compass...)"
                style={{ flex: 1, minWidth: 150, padding: "8px 12px", fontSize: 12, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, color: "#1a1a1a", outline: "none" }}
              />
              <select
                value={prospectCounty}
                onChange={e => setProspectCounty(e.target.value)}
                style={{ padding: "8px 12px", fontSize: 12, background: "#fff", border: "1px solid #d1d5db", borderRadius: 6, color: "#1a1a1a", outline: "none" }}
              >
                <option value="">All Counties</option>
                <option value="Orange">Orange</option>
                <option value="Seminole">Seminole</option>
                <option value="Osceola">Osceola</option>
                <option value="Lake">Lake</option>
                <option value="Volusia">Volusia</option>
              </select>
              <button onClick={fetchProspects} style={{ padding: "8px 14px", fontSize: 12, fontWeight: 600, background: "#0B1D3A", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                Search
              </button>
            </div>

            {/* Disclaimer */}
            <p style={{ fontSize: 10, color: "#999", marginBottom: 12 }}>
              Agent data from Florida DBPR public records. Filtered: active Sales Associates, 1-5 years experience, Orlando metro counties. No email/phone from DBPR — add contact info when accepting.
            </p>

            {/* Prospects Table */}
            {prospectsLoading ? (
              <p style={{ color: "#999", textAlign: "center", padding: 30 }}>Loading...</p>
            ) : prospects.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                <p style={{ fontSize: 14, marginBottom: 8, color: "#1a1a1a" }}>No prospects loaded</p>
                <p style={{ fontSize: 12 }}>Click &quot;Import DBPR CSV&quot; to upload agent data, then &quot;Load Prospects&quot; to view.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                      {["Name", "Brokerage", "County", "Years", "License #", "City", "Actions"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 8px", fontSize: 10, fontWeight: 600, color: "#666", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map((p: ProspectRow) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 8px", fontWeight: 500, color: "#1a1a1a" }}>{p.full_name}</td>
                        <td style={{ padding: "10px 8px", color: "#444" }}>{p.brokerage || "—"}</td>
                        <td style={{ padding: "10px 8px", color: "#444" }}>{p.county || "—"}</td>
                        <td style={{ padding: "10px 8px", color: "#1a1a1a" }}>{(p.license_date ? Math.floor((Date.now() - new Date(p.license_date).getTime()) / (365.25*24*60*60*1000)) : "—") || "—"}</td>
                        <td style={{ padding: "10px 8px", color: "#888", fontSize: 11 }}>{p.license_number || "—"}</td>
                        <td style={{ padding: "10px 8px", color: "#888" }}>{p.city || "—"}</td>
                        <td style={{ padding: "10px 8px" }}>
                          {showAcceptForm === p.id ? (
                            <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                              <input value={acceptPhone} onChange={e => setAcceptPhone(e.target.value)} placeholder="Phone" style={{ width: 100, padding: "4px 6px", fontSize: 11, background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, color: "#1a1a1a", outline: "none" }} />
                              <input value={acceptEmail} onChange={e => setAcceptEmail(e.target.value)} placeholder="Email" style={{ width: 140, padding: "4px 6px", fontSize: 11, background: "#fff", border: "1px solid #d1d5db", borderRadius: 4, color: "#1a1a1a", outline: "none" }} />
                              <button onClick={() => acceptProspect(p.id)} disabled={acceptingId === p.id} style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, background: "#1B8C3A", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
                                {acceptingId === p.id ? "..." : "Confirm"}
                              </button>
                              <button onClick={() => { setShowAcceptForm(null); setAcceptPhone(""); setAcceptEmail("") }} style={{ padding: "4px 8px", fontSize: 10, background: "#fff", border: "1px solid #d1d5db", color: "#666", borderRadius: 4, cursor: "pointer" }}>✕</button>
                            </div>
                          ) : (
                            <><button onClick={() => window.open(`https://app.apollo.io/#/people?qKeywords=${encodeURIComponent((p.full_name || "").replace(/,/g, " ") + " " + (p.brokerage || ""))}`, "_blank")} style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, background: "#4A90D9", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", marginRight: 4 }}>
                              Enrich
                            </button><button onClick={() => setShowAcceptForm(p.id)} style={{ padding: "4px 10px", fontSize: 10, fontWeight: 600, background: "#E6A817", color: "#0B1D3A", border: "none", borderRadius: 4, cursor: "pointer" }}>
                              Accept
                            </button></>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>Showing {prospects.length} prospects</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
