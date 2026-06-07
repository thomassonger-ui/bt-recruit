"use client"

import React, { useState, useEffect, useCallback } from "react"

interface Msg { role: string; content: string }
interface Prospect {
  id: string
  created_at?: string
  updated_at?: string
  name?: string | null
  email?: string | null
  phone?: string | null
  brokerage?: string | null
  deal_count?: number | null
  stage?: string | null
  status?: string | null
  notes?: string | null
  source?: string | null
  transcript?: Msg[] | null
}

const NAVY = "#0B1D3A"
const ACCENT = "#1b365d"

export default function ConversationsPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const load = useCallback(async (pw: string) => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/conversations?pw=${encodeURIComponent(pw)}`)
      if (!res.ok) { setError(res.status === 401 ? "Wrong password." : "Failed to load."); setLoading(false); return }
      const data = await res.json()
      setProspects(data.prospects || [])
      setAuthed(true)
    } catch {
      setError("Failed to load.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const pw = new URLSearchParams(window.location.search).get("pw")
    if (pw) { setPassword(pw); load(pw) }
  }, [load])

  const fmt = (d?: string) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"

  const filtered = prospects.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [p.name, p.email, p.phone, p.brokerage].some(v => (v || "").toLowerCase().includes(q))
  })

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <form onSubmit={(e) => { e.preventDefault(); load(password) }} style={{ background: "#fff", padding: 32, borderRadius: 14, width: 320, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 20, color: NAVY }}>Prospect Conversations</h1>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6B7280" }}>Bear Team Real Estate</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dashboard password"
            style={{ width: "100%", padding: "11px 12px", borderRadius: 9, border: "1px solid #D1D5DB", fontSize: 14, boxSizing: "border-box" }} autoFocus />
          {error && <p style={{ color: "#DC2626", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: "100%", marginTop: 14, padding: "11px", borderRadius: 9, border: "none", background: ACCENT, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Loading…" : "Enter"}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "Inter, system-ui, sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, color: NAVY }}>Prospect Conversations</h1>
          <span style={{ fontSize: 13, color: "#6B7280" }}>{filtered.length} prospect{filtered.length === 1 ? "" : "s"}</span>
        </div>
        <p style={{ margin: "4px 0 16px", fontSize: 13, color: "#6B7280" }}>Everyone who gave Scout their contact info, newest first. Click a card to read the full conversation.</p>

        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone, brokerage…"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #D1D5DB", fontSize: 14, marginBottom: 16, boxSizing: "border-box" }} />

        {filtered.length === 0 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            No prospects yet. They&apos;ll appear here as soon as someone gives Scout their email.
          </div>
        )}

        {filtered.map(p => {
          const open = openId === p.id
          return (
            <div key={p.id} style={{ background: "#fff", borderRadius: 12, marginBottom: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <button onClick={() => setOpenId(open ? null : p.id)}
                style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: NAVY, fontSize: 15 }}>{p.name || "Unknown name"}</div>
                  <div style={{ fontSize: 13, color: "#374151", marginTop: 3 }}>
                    {p.email || "no email"}{p.phone ? ` · ${p.phone}` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                    {p.brokerage ? `${p.brokerage}` : "brokerage —"}{typeof p.deal_count === "number" ? ` · ${p.deal_count} deals/yr` : ""}{p.stage ? ` · ${p.stage}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{fmt(p.created_at)}</div>
                  <div style={{ fontSize: 12, color: ACCENT, marginTop: 6, fontWeight: 600 }}>{open ? "Hide" : "View chat"}</div>
                </div>
              </button>
              {open && (
                <div style={{ borderTop: "1px solid #F3F4F6", padding: "14px 16px", background: "#FAFAFA" }}>
                  {(!p.transcript || p.transcript.length === 0) ? (
                    <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>No transcript saved for this prospect (captured before conversation logging was enabled).</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {p.transcript.map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                            background: m.role === "user" ? ACCENT : "#fff",
                            color: m.role === "user" ? "#fff" : "#111827",
                            border: m.role === "user" ? "none" : "1px solid #E5E7EB" }}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {p.notes && <p style={{ fontSize: 12, color: "#6B7280", marginTop: 12, marginBottom: 0 }}><strong>Notes:</strong> {p.notes}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
