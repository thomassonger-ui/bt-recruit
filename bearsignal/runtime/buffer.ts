/**
 * BearSignal — Buffer Poster
 *
 * Posts text content + a rotating Bear Team image to the
 * Join Bear Team LinkedIn showcase page via Buffer API v1.
 *
 * Images served from Vercel CDN at joinbearteam.com/images/
 * for fast, clean URLs with no third-party domain exposure.
 *
 * Image rotation: deterministic by week-of-year (week % 16 + 1)
 *
 * Env vars required:
 *   BUFFER_ACCESS_TOKEN  — from publish.buffer.com/settings/api
 *   BUFFER_PROFILE_ID    — LinkedIn page profile ID in Buffer
 */

export interface BufferPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ── Image rotation ────────────────────────────────────────────────────────────
const IMAGE_COUNT = 16;
const BASE_URL = "https://www.joinbearteam.com";

function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function getCurrentImageUrl(): string {
  const week = getWeekOfYear();
  const imageIndex = (week % IMAGE_COUNT) + 1;
  const padded = String(imageIndex).padStart(2, "0");
  return `${BASE_URL}/images/bear-team-recruit-${padded}.png`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function postToBuffer(content: string): Promise<BufferPostResult> {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN;
  const profileId = process.env.BUFFER_PROFILE_ID;

  if (!accessToken) return { success: false, error: "BUFFER_ACCESS_TOKEN not set" };
  if (!profileId) return { success: false, error: "BUFFER_PROFILE_ID not set" };

  const imageUrl = getCurrentImageUrl();
  console.log("[buffer] Posting to profile:", profileId);
  console.log("[buffer] Image:", imageUrl);

  // Buffer v1 — media[photo] with a URL causes Buffer to fetch and upload
  // the image as a native inline LinkedIn image (not a link preview card)
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  params.append("profile_ids[]", profileId);
  params.append("text", content);
  params.append("now", "true");
  params.append("media[photo]", imageUrl);
  params.append("media[description]", "Bear Team Real Estate — Orlando, FL");
  params.append("media[title]", "Join Bear Team");

  try {
    const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text); } catch { /* empty body */ }

    if (!res.ok || data?.success === false) {
      const errMsg = String(data?.message || data?.error || text || res.status);
      console.error("[buffer] Post failed:", errMsg);
      return { success: false, error: "Buffer " + res.status + ": " + errMsg };
    }

    const updates = data?.updates as Array<{id?: string}> | undefined;
    const postId = updates?.[0]?.id || "";
    console.log("[buffer] Posted successfully. ID:", postId);
    return { success: true, postId };

  } catch (err) {
    return { success: false, error: "Buffer post error: " + String(err) };
  }
}
