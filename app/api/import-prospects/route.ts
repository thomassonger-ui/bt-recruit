import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Orlando metro counties
const TARGET_COUNTIES = ["orange", "seminole", "osceola", "lake", "volusia"]

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

export async function POST(req: Request) {
  try {
    const { csvText, pw } = await req.json()
    if (pw !== process.env.DASH_PW) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!csvText) {
      return NextResponse.json({ error: "No CSV data" }, { status: 400 })
    }

    const lines = csvText.split("\n").filter((l: string) => l.trim())
    const now = new Date()
    const currentYear = now.getFullYear()

    let imported = 0
    let skipped = 0
    let filtered = 0

    for (const line of lines) {
      const cols = parseCSVLine(line)
      if (cols.length < 20) { skipped++; continue }

      const licenseType = (cols[4] || "").trim()
      const name = (cols[2] || "").trim()
      const address = [cols[5], cols[6], cols[7]].map(s => (s || "").trim()).filter(Boolean).join(", ")
      const city = (cols[8] || "").trim()
      const state = (cols[9] || "").trim()
      const zip = (cols[10] || "").trim()
      const county = (cols[12] || "").trim()
      const licenseNumber = (cols[19] || "").trim()
      const statusCurrent = (cols[14] || "").trim()
      const statusActive = (cols[15] || "").trim()
      const licenseDateStr = (cols[16] || "").trim()
      const brokerage = (cols[21] || "").trim()

      // Filter: Sales Associate only
      if (!licenseType.toLowerCase().includes("sales associate")) { filtered++; continue }

      // Filter: Active only
      if (statusActive.toLowerCase() !== "active") { filtered++; continue }

      // Filter: Orlando metro counties
      if (!TARGET_COUNTIES.includes(county.toLowerCase())) { filtered++; continue }

      // Filter: 1-5 years experience
      let yearsExp = 0
      if (licenseDateStr) {
        const parts = licenseDateStr.split("/")
        if (parts.length === 3) {
          const licenseYear = parseInt(parts[2])
          yearsExp = currentYear - licenseYear
        }
      }
      if (yearsExp < 1 || yearsExp > 5) { filtered++; continue }

      // Skip if no name
      if (!name) { skipped++; continue }

      // Upsert by license number
      const { error } = await supabase
        .from("agent_prospects")
        .upsert({
          name,
          license_number: licenseNumber || null,
          brokerage: brokerage || null,
          address: address || null,
          city: city || null,
          state: state || "FL",
          zip: zip || null,
          county: county || null,
          license_type: licenseType || null,
          license_date: licenseDateStr ? new Date(licenseDateStr).toISOString() : null,
          years_experience: yearsExp,
          updated_at: now.toISOString(),
        }, { onConflict: "license_number" })

      if (!error) imported++
      else skipped++
    }

    return NextResponse.json({
      ok: true,
      imported,
      skipped,
      filtered,
      total: lines.length,
    })
  } catch (err) {
    console.error("[import-prospects]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
