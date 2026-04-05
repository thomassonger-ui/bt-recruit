export const maxDuration = 60

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Orlando metro counties
const TARGET_COUNTIES = new Set(["orange", "seminole", "osceola", "lake", "volusia"])

// DBPR Region 5 CSV (Brevard, Lake, Osceola, Seminole, Volusia)
// Orange County has its own file — we fetch both
const CSV_URLS = [
  "https://www2.myfloridalicense.com/sto/file_download/extracts/RE_rgn5.csv",
  "https://www2.myfloridalicense.com/sto/file_download/extracts/RE_Orange.csv",
]

/*
  COLUMN MAPPING (Region/County files):
  [0]  Board Code
  [1]  Board Description
  [2]  Name (LAST, FIRST MIDDLE)
  [4]  License Type ("SL Sales Associate")
  [5]  Address Line 1
  [8]  City
  [9]  State
  [10] Zip
  [12] County Name
  [14] Status ("Current", "Invol Inactive", etc.)
  [15] Status Detail ("Active", "Inactive")
  [16] Initial License Date (MM/DD/YYYY)
  [19] License Number
  [21] Employer/Brokerage
*/

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
    const last = parts[0]
    const first = parts[1].split(" ")[0]
    return { full_name: clean, first_name: first, last_name: last }
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

function isWithin90Days(dateStr: string): boolean {
  const d = parseDate(dateStr)
  if (!d) return false
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  return diff >= 0 && diff <= 90 * 24 * 60 * 60 * 1000
}

async function fetchCSV(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    })
    if (!res.ok) return ""
    const text = await res.text()
    // Verify it's CSV, not HTML
    if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) return ""
    return text
  } catch {
    return ""
  }
}

export async function GET() {
  const startTime = Date.now()
  let totalParsed = 0
  let totalFiltered = 0
  let inserted = 0
  let skipped = 0
  let errors = 0

  for (const url of CSV_URLS) {
    const csv = await fetchCSV(url)
    if (!csv) { errors++; continue }

    const lines = csv.split("\n").filter(l => l.trim())

    for (const line of lines) {
      const cols = parseCSVLine(line)
      if (cols.length < 20) continue
      totalParsed++

      const licenseType = (cols[4] || "").trim()
      const county = (cols[12] || "").trim()
      const status = (cols[14] || "").trim()
      const statusDetail = (cols[15] || "").trim()
      const licenseDateStr = (cols[16] || "").trim()
      const licenseNumber = (cols[19] || "").trim()

      // Filter: Sales Associate only
      if (!licenseType.toLowerCase().includes("sales associate")) { totalFiltered++; continue }

      // Filter: Inactive status (pre-activation = licensed but not yet active)
      if (!status.toLowerCase().includes("inactive") && statusDetail.toLowerCase() !== "inactive") { totalFiltered++; continue }

      // Filter: Orlando metro counties
      if (!TARGET_COUNTIES.has(county.toLowerCase())) { totalFiltered++; continue }

      // Filter: Initial license within last 90 days
      if (!isWithin90Days(licenseDateStr)) { totalFiltered++; continue }

      // Skip if no license number
      if (!licenseNumber) { skipped++; continue }

      const name = parseName(cols[2] || "")
      const licenseDate = parseDate(licenseDateStr)

      // Upsert — skip if exists
      const { error } = await supabase
        .from("agent_prospects")
        .upsert({
          full_name: name.full_name,
          first_name: name.first_name,
          last_name: name.last_name,
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
          stage: "pre_activation",
          updated_at: new Date().toISOString(),
        }, { onConflict: "license_number", ignoreDuplicates: true })

      if (!error) inserted++
      else skipped++
    }
  }

  const duration = Date.now() - startTime

  return NextResponse.json({
    ok: true,
    duration: `${duration}ms`,
    totalParsed,
    totalFiltered,
    inserted,
    skipped,
    errors,
    csvUrls: CSV_URLS.length,
  })
}
