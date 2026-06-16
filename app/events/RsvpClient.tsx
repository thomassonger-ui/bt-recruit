"use client";

import { useState, type ChangeEvent, type FormEvent, type CSSProperties } from "react";

const NAVY = "#0B1D3A";
const FIELD = "#0A1730";
const FBORDER = "#2B3F63";

const WORKSHOPS = [
  "From 6 Deals to 60 — 2nd Thursdays",
  "The REO Playbook — 4th Thursdays",
  "Both",
];

export default function RsvpClient() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    workshop: WORKSHOPS[0],
    brokerage: "",
  });

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const utm = typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, utm }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const label: CSSProperties = { display: "block", fontSize: 13, color: "#AEBDD1", marginBottom: 6 };
  const field: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${FBORDER}`,
    background: FIELD,
    color: "#fff",
    fontSize: 15,
    fontFamily: "inherit",
  };

  if (status === "done") {
    return (
      <div style={{ marginTop: 24, background: FIELD, border: `1px solid ${FBORDER}`, borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>You&apos;re on the list.</div>
        <div style={{ color: "#C3CDDA", fontSize: 15 }}>We&apos;ll text and email you the workshop details. See you at the Bear Team office.</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <div><label style={label}>First name</label><input style={field} required value={form.firstName} onChange={set("firstName")} /></div>
        <div><label style={label}>Last name</label><input style={field} required value={form.lastName} onChange={set("lastName")} /></div>
        <div><label style={label}>Email</label><input style={field} type="email" required value={form.email} onChange={set("email")} /></div>
        <div><label style={label}>Mobile</label><input style={field} type="tel" required value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={label}>Which workshop?</label>
        <select style={field} value={form.workshop} onChange={set("workshop")}>
          {WORKSHOPS.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={label}>Current brokerage (optional)</label>
        <input style={field} value={form.brokerage} onChange={set("brokerage")} />
      </div>
      <button type="submit" disabled={status === "sending"} style={{ marginTop: 20, width: "100%", background: "#fff", color: NAVY, border: 0, padding: 14, borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: "pointer", opacity: status === "sending" ? 0.7 : 1 }}>
        {status === "sending" ? "Saving…" : "Save my seat →"}
      </button>
      {status === "error" && (
        <div style={{ color: "#FFB4B4", fontSize: 14, marginTop: 10, textAlign: "center" }}>Something went wrong — please call 407-228-1112 or try again.</div>
      )}
      <div style={{ color: "#8EA0BB", fontSize: 13, marginTop: 10, textAlign: "center" }}>No spam, no pressure. Just the workshop details.</div>
    </form>
  );
}
