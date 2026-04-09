"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"password" | "magic">("password")
  const [magicSent, setMagicSent] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) {
        setError(authError.message)
      } else {
        router.push("/dashboard")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (authError) {
        setError(authError.message)
      } else {
        setMagicSent(true)
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#111",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#888",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }}>
              Bear <span style={{ color: "#c9a84c" }}>Team</span>
            </span>
          </div>
          <p style={{ color: "#666", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
            Agent Operating System
          </p>
        </div>

        <div style={{ background: "#1a1a1a", borderRadius: "12px", padding: "36px", border: "1px solid #2a2a2a" }}>
          <h2 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "600", margin: "0 0 6px" }}>Sign in</h2>
          <p style={{ color: "#666", fontSize: "14px", margin: "0 0 28px" }}>Access your Bear Team dashboard</p>

          {magicSent ? (
            <div style={{ background: "#0f2a1a", border: "1px solid #1a6b3c", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📬</div>
              <p style={{ color: "#4ade80", fontWeight: "600", margin: "0 0 8px" }}>Check your email</p>
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                We sent a login link to <strong style={{ color: "#fff" }}>{email}</strong>
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail("") }}
                style={{ background: "transparent", border: "none", color: "#c9a84c", fontSize: "13px", cursor: "pointer", marginTop: "16px", textDecoration: "underline" }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", background: "#111", borderRadius: "8px", padding: "4px", marginBottom: "24px", gap: "4px" }}>
                {(["password", "magic"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError("") }}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "6px", border: "none",
                      background: mode === m ? "#2a2a2a" : "transparent",
                      color: mode === m ? "#ffffff" : "#666",
                      fontSize: "13px", fontWeight: mode === m ? "600" : "400",
                      cursor: "pointer",
                    }}
                  >
                    {m === "password" ? "Password" : "Magic Link"}
                  </button>
                ))}
              </div>

              <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com" required autoComplete="email" style={inputStyle} />
                </div>

                {mode === "password" && (
                  <div style={{ marginBottom: "24px" }}>
                    <label style={labelStyle}>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="current-password" style={inputStyle} />
                  </div>
                )}

                {mode === "magic" && (
                  <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
                    {"We'll send a one-click login link to your email. No password needed."}
                  </p>
                )}

                {error && (
                  <div style={{ background: "#2a0f0f", border: "1px solid #6b1a1a", borderRadius: "6px",
                    padding: "12px 14px", color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", background: loading ? "#555" : "#c9a84c",
                    color: loading ? "#888" : "#1a1a1a", border: "none",
                    borderRadius: "8px", padding: "14px", fontSize: "15px",
                    fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Please wait..." : mode === "password" ? "Sign In" : "Send Magic Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#444", fontSize: "13px", marginTop: "24px" }}>
          Bear Team Real Estate · Orlando, FL
        </p>
      </div>
    </div>
  )
}
