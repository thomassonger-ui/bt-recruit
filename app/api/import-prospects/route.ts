import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TARGET_COUNTIES = new Set(["orange", "seminole", "osceola", "lake", "volusia"])

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === "," && !inQuotes) {
      result.push(current); current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function parseName(raw: string): { full_name: string; first_name: string; last_name: string } {
  const clean = raw.trim()
  const parts = clean.split(",").map(s => s.trim())
  if (parts.length >= 2) {
    return { full_name: clean, first_name: parts[1].split(" ")[0], last_name: parts[0] }
  }
  return { full_name: clean, first_name: "", last_name: clean }
}

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.trim().split("/")
  if (parts.length !== 3) return null
  const [m, d, y] = parts.map(Number)
  if (!m || !d || !y) return null
  return new Date(y, m - 1, d)
}

export async function POST(req: Request) {
  try {
    const { csvText, pw, minYears, maxYears, statusFilter } = await req.json()
    if (pw !== process.env.DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!csvText) {
      return NextResponse.json({ error: "No CSV data" }, { status: 400 })
    }

    const lines = csvText.split("\n").filter((l: string) => l.trim())
    const now = new Date()
    const currentYear = now.getFullYear()
    const minY = minYears ?? 0
    const maxY = maxYears ?? 5
    const targetStatus = statusFilter || "inactive"

    let imported = 0
    let skipped = 0
    let filtered = 0

    for (const line of lines) {
      const cols = parseCSVLine(line)
      if (cols.length < 20) { skipped++; continue }

      const licenseType = (cols[4] || "").trim()
      const county = (cols[12] || "").trim()
      const status = (cols[14] || "").trim()
      const statusDetail = (cols[15] || "").trim()
      const licenseDateStr = (cols[16] || "").trim()
      const licenseNumber = (cols[19] || "").trim()

      // Filter: Sales Associate only
      if (!licenseType.toLowerCase().includes("sales associate")) { filtered++; continue }

      // Filter: status
      if (targetStatus === "inactive") {
        if (!status.toLowerCase().includes("inactive") && statusDetail.toLowerCase() !== "inactive") { filtered++; continue }
      } else if (targetStatus === "active") {
        if (statusDetail.toLowerCase() !== "active") { filtered++; continue }
      }

      // Filter: Orlando metro counties
      if (!TARGET_COUNTIES.has(county.toLowerCase())) { filtered++; continue }

      // Filter: years of experience
      const licenseDate = parseDate(licenseDateStr)
      let yearsExp = 0
      if (licenseDate) {
        yearsExp = Math.floor((now.getTime() - licenseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      }
      if (yearsExp < minY || yearsExp > maxY) { filtered++; continue }

      const nameData = parseName(cols[2] || "")
      if (!nameData.full_name || !licenseNumber) { skipped++; continue }

      const { error } = await supabase
        .from("agent_prospects")
        .upsert({
          full_name: nameData.full_name,
          first_name: nameData.first_name,
          last_name: nameData.last_name,
          license_number: licenseNumber,
          license_type: licenseType,
          license_status: `${status} / ${statusDetail}`,
          license_date: licenseDate ? licenseDate.toISOString().split("T")[0] : null,
          city: (cols[8] || "").trim() || null,
          state: (cols[9] || "").trim() || "FL",
          zip: (cols[10] || "").trim() || null,
          county: county || null,
          address: (cols[5] || "").trim() || null,
          brokerage: (cols[21] || "").trim() || null,
          source: "DBPR",
          stage: targetStatus === "inactive" ? "pre_activation" : "active_agent",
          updated_at: now.toISOString(),
        }, { onConflict: "license_number", ignoreDuplicates: true })

      if (!error) imported++
      else skipped++
    }

    return NextResponse.json({ ok: true, imported, skipped, filtered, total: lines.length })
  } catch (err) {
    console.error("[import-prospects]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
