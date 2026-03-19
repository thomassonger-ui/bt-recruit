"use client"

import { useState, useEffect, useCallback } from "react"

interface DashboardData {
  summary: {
    totalLeads: number
    weekLeads: number
    monthLeads: number
    uniqueSessions: number
    convCount: number
  }
  funnel: {
    visitors: number
    leads: number
    booked: number
    noShows: number
    showed: number
    bookRate: number
    showRate: number
  }
  statusCounts: Record<string, number>
  recentLeads: {
    id: string
    created_at: string
    name: string
    email: string
    phone: string
    status: string
    notes: string
    event_start: string | null
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  scout_captured: "#E6A817",
  booked: "#1B8C3A",
  no_show: "#C62828",
  completed: "#0B1D3A",
  unknown: "#9CA3AF",
}

const STATUS_LABELS: Record<string, string> = {
  scout_captured: "Captured",
  booked: "Booked",
  no_show: "No Show",
  completed: "Completed",
  unknown: "Unknown",
}

export default function DashboardPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/dashboard?pw=${encodeURIComponent(pw)}`)
      if (res.status === 401) {
        setError("Wrong password.")
        setAuthed(false)
        return
      }
      const json = await res.json()
      setData(json)
      setAuthed(true)
    } catch {
      setError("Failed to load data.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!authed || !password) return
    const interval = setInterval(() => fetchData(password), 60000)
    return () => clearInterval(interval)
  }, [authed, password, fetchData])

  if (!authed) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0B1D3A", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "sans-serif"
      }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "40px 48px", width: 360, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>BearTeam</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 28 }}>Scout Analytics Dashboard</div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchData(password)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 6,
              border: "1px solid #D1D5DB", fontSize: 15, boxSizing: "border-box",
              marginBottom: 12, outline: "none"
            }}
          />
          {error && <div style={{ color: "#C62828", fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <button
            onClick={() => fetchData(password)}
            disabled={loading}
            style={{
              width: "100%", padding: "10px 0", background: "#0B1D3A", color: "#fff",
              border: "none", borderRadius: 6, fontSize: 15, fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {loading ? "Loading..." : "Enter"}
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { summary, funnel, statusCounts, recentLeads } = data

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0B1D3A", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>BearTeamOS — Scout Dashboard</div>
          <div style={{ color: "#93C5FD", fontSize: 13, marginTop: 2 }}>Live recruiting funnel · Auto-refreshes every 60s</div>
        </div>
        <button onClick={() => fetchData(password)} style={{
          background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer"
        }}>Refresh</button>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1200 }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Leads", value: summary.totalLeads, color: "#0B1D3A" },
            { label: "This Week", value: summary.weekLeads, color: "#1B8C3A" },
            { label: "This Month", value: summary.monthLeads, color: "#1B8C3A" },
            { label: "Scout Sessions", value: summary.uniqueSessions, color: "#E6A817" },
            { label: "Total Messages", value: summary.convCount ?? 0, color: "#6B7280" },
          ].map(card => (
            <div key={card.label} style={{
              background: "#fff", borderRadius: 10, padding: "20px 22px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          {/* Conversion funnel */}
          <div style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1D3A", marginBottom: 20 }}>Conversion Funnel</div>
            {[
              { label: "Scout Sessions", value: funnel.visitors, pct: 100, color: "#93C5FD" },
              { label: "Leads Captured", value: funnel.leads, pct: funnel.visitors > 0 ? Math.round((funnel.leads / funnel.visitors) * 100) : 0, color: "#E6A817" },
              { label: "Calls Booked", value: funnel.booked, pct: funnel.bookRate, color: "#1B8C3A" },
              { label: "No Shows", value: funnel.noShows, pct: funnel.booked > 0 ? Math.round((funnel.noShows / funnel.booked) * 100) : 0, color: "#C62828" },
              { label: "Showed Up", value: funnel.showed, pct: funnel.showRate, color: "#0B1D3A" },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: "#374151" }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: "#0B1D3A" }}>{row.value} <span style={{ color: "#9CA3AF", fontWeight: 400 }}>({row.pct}%)</span></span>
                </div>
                <div style={{ height: 8, background: "#F3F4F6", borderRadius: 4 }}>
                  <div style={{ height: 8, background: row.color, borderRadius: 4, width: `${Math.min(row.pct, 100)}%`, transition: "width 0.6s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1D3A", marginBottom: 20 }}>Lead Status Breakdown</div>
            {Object.entries(statusCounts).length === 0 && (
              <div style={{ color: "#9CA3AF", fontSize: 14 }}>No leads yet.</div>
            )}
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 7, marginBottom: 8,
                background: "#F9FAFB", border: "1px solid #E5E7EB"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLORS[status] || "#9CA3AF" }} />
                  <span style={{ fontSize: 14, color: "#374151" }}>{STATUS_LABELS[status] || status}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: STATUS_COLORS[status] || "#374151" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads table */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1D3A", marginBottom: 20 }}>Recent Leads</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F3F4F6" }}>
                  {["Date", "Name", "Email", "Phone", "Status", "Notes"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6B7280", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 20, color: "#9CA3AF", textAlign: "center" }}>No leads yet.</td></tr>
                )}
                {recentLeads.map((lead, i) => (
                  <tr key={lead.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}>
                    <td style={{ padding: "10px 14px", color: "#6B7280", whiteSpace: "nowrap" }}>
                      {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0B1D3A" }}>{lead.name || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#374151" }}>{lead.email || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#374151" }}>{lead.phone || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600,
                        background: STATUS_COLORS[lead.status] + "18" || "#F3F4F6",
                        color: STATUS_COLORS[lead.status] || "#374151",
                      }}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#6B7280", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lead.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
