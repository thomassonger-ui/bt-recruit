"use client"

export default function Footer() {
  return (
    <footer
      className="px-6 py-10 text-center text-sm"
      style={{
        background: "#F2F2F2",
        borderTop: "1px solid var(--color-border-light)",
        color: "#6B7280",
      }}
    >
      <a
        href="sms:4077588102?body=Hello%20Tom,%20I%20would%20like%20to%20learn%20more%20about%20BearTeam."
        className="inline-block mb-3 text-sm font-medium transition-colors"
        style={{ color: "#3B5A82" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#2F4768")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#3B5A82")}
      >
        Text Tom at 407-758-8102
      </a>
      <p>&copy; 2026 BearTeam. All rights reserved.</p>
    </footer>
  )
}
