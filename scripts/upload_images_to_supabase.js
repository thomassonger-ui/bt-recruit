#!/usr/bin/env node
/**
 * One-time script: Upload Bear Team Recruit 1-16.png to Supabase Storage
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node upload_images_to_supabase.js /path/to/BearSignal-LinkedIn/
 *
 * Or place a .env.local in the bt-recruit root and run from there:
 *   node scripts/upload_images_to_supabase.js
 *
 * Creates bucket "bearsignal-images" (public) if it doesn't exist,
 * then uploads all 16 PNGs.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ── Load env ──────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "bearsignal-images";

// ── Image folder ──────────────────────────────────────────────────────────────
const imageDir = process.argv[2] || path.join(process.cwd(), "BearSignal-LinkedIn");

const IMAGE_FILES = [
  "Bear Team Recruit 1.png",
  "Bear Team Recruit 2.png",
  "Bear Team Recruit 3.png",
  "Bear Team Recruit 4.png",
  "Bear Team Recruit 5..png",   // note: double dot
  "Bear Team Recruit 6.png",
  "Bear Team Recruit 7.png",
  "Bear Team Recruit 8.png",
  "Bear Team Recruit 9.png",
  "Bear Team Recruit 10.png",
  "Bear Team Recruit 11.png",
  "Bear Team Recruit 12.png",
  "Bear Team Recruit 13.png",
  "Bear Team Recruit 14.png",
  "Bear Team Recruit 15.png",
  "Bear Team Recruit 16.png",
];

// ── Supabase REST helpers ─────────────────────────────────────────────────────
function supabaseRequest(method, urlPath, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(SUPABASE_URL + urlPath);
    const lib = fullUrl.protocol === "https:" ? https : http;
    const bodyBuf = body
      ? Buffer.isBuffer(body)
        ? body
        : Buffer.from(typeof body === "string" ? body : JSON.stringify(body))
      : null;

    const headers = {
      apikey: SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SERVICE_ROLE_KEY,
      ...extraHeaders,
    };
    if (bodyBuf && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (bodyBuf) {
      headers["Content-Length"] = bodyBuf.length;
    }

    const req = lib.request(
      {
        hostname: fullUrl.hostname,
        path: fullUrl.pathname + fullUrl.search,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString();
          resolve({ status: res.statusCode, body: text });
        });
      }
    );
    req.on("error", reject);
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

async function ensureBucket() {
  // Try to get bucket info
  const check = await supabaseRequest("GET", `/storage/v1/bucket/${BUCKET}`);
  if (check.status === 200) {
    console.log(`✓ Bucket "${BUCKET}" already exists`);
    return;
  }
  // Create bucket as public
  const create = await supabaseRequest(
    "POST",
    "/storage/v1/bucket",
    { id: BUCKET, name: BUCKET, public: true }
  );
  if (create.status === 200 || create.status === 201) {
    console.log(`✓ Created public bucket "${BUCKET}"`);
  } else {
    throw new Error(`Failed to create bucket: ${create.status} ${create.body}`);
  }
}

async function uploadFile(filename) {
  const filePath = path.join(imageDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ File not found, skipping: ${filePath}`);
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const encodedName = encodeURIComponent(filename);
  const uploadPath = `/storage/v1/object/${BUCKET}/${encodedName}`;

  // Check if already exists (upsert)
  const res = await supabaseRequest("POST", uploadPath, fileBuffer, {
    "Content-Type": "image/png",
    "x-upsert": "true",
  });

  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ Uploaded: ${filename}`);
  } else {
    console.error(`  ✗ Failed (${res.status}): ${filename} — ${res.body}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌  Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    console.error(
      "    Set them in .env.local or pass as environment variables."
    );
    process.exit(1);
  }

  console.log("🐻 BearSignal Image Uploader");
  console.log("   Supabase URL:", SUPABASE_URL);
  console.log("   Image folder:", imageDir);
  console.log("");

  await ensureBucket();
  console.log(`\nUploading ${IMAGE_FILES.length} images...\n`);

  for (const filename of IMAGE_FILES) {
    await uploadFile(filename);
  }

  console.log("\n✅ Done. Images are now live at:");
  const example = encodeURIComponent("Bear Team Recruit 1.png");
  console.log(
    `   ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${example}`
  );
})();
