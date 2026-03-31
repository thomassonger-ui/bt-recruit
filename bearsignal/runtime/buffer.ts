/**
 * BearSignal — Buffer Poster
 *
 * Posts text content + a rotating Bear Team image to the
 * Join Bear Team LinkedIn showcase page via Buffer API v1.
 *
 * Buffer handles LinkedIn organization posting through their
 * approved partnership — no direct LinkedIn org scope needed.
 *
 * Image rotation: deterministic by week-of-year (week % 16 + 1)
 * Images hosted in Supabase Storage: bucket "bearsignal-images"
 *
 * Env vars required:
 *   BUFFER_ACCESS_TOKEN  — from publish.buffer.com/settings/api
 *   BUFFER_PROFILE_ID    — LinkedIn page profile ID in Buffer (69cb4be8af47dacb69712437)
 */

export interface BufferPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// ── Image rotation ────────────────────────────────────────────────────────────
const IMAGE_COUNT = 16;

function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function getImageFilename(index: number): string {
  if (index === 5) return "Bear Team Recruit 5..png";
  return `Bear Team Recruit ${index}.png`;
}

function getCurrentImageUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const week = getWeekOfYear();
  const imageIndex = (week % IMAGE_COUNT) + 1;
  const filename = encodeURIComponent(getImageFilename(imageIndex));
  return `${supabaseUrl}/storage/v1/object/public/bearsignal-images/${filename}`;
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

  // Buffer v1 API — media[link] posts image as a LinkedIn image card
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  params.append("profile_ids[]", profileId);
  params.append("text", content);
  params.append("now", "true");
  params.append("media[link]", imageUrl);
  params.append("media[description]", "Bear Team Real Estate — Orlando, FL");
  params.append("media[title]", "Join Bear Team");

  try {
    const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    // Buffer sometimes returns empty body on success — handle gracefully
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      // Empty or non-JSON response — check status
      if (res.ok) {
        console.log("[buffer] Posted (non-JSON response). Status:", res.status);
        return { success: true };
      }
    }

    if (!res.ok || data?.success === false) {
      const errMsg = String(data?.message || data?.error || text || res.status);
      console.error("[buffer] Post failed:", errMsg);
      return { success: false, error: "Buffer " + res.status + ": " + errMsg };
    }

    const updates = data?.updates as Array<{id?: string}> | undefined;
    const postId = updates?.[0]?.id || String(data?.update && (data.update as {id?: string})?.id || "");
    console.log("[buffer] Posted successfully. ID:", postId);
    return { success: true, postId };

  } catch (err) {
    return { success: false, error: "Buffer post error: " + String(err) };
  }
}
