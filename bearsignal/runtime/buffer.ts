/**
 * BearSignal — Buffer Poster
 *
 * Posts text content + a rotating Bear Team image to the
 * Join Bear Team LinkedIn showcase page via Buffer API v1.
 *
 * Buffer handles the LinkedIn organization posting (Community Management API)
 * through their approved partnership — no direct LinkedIn org scope needed.
 *
 * Image rotation: deterministic by week-of-year (week % 16 + 1)
 * Images hosted in Supabase Storage: bucket "bearsignal-images"
 *
 * Env vars required:
 *   BUFFER_ACCESS_TOKEN   — from buffer.com/settings/api
 *   BUFFER_PROFILE_ID     — LinkedIn page profile ID in Buffer
 */

export interface BufferPostResult {
  success: boolean;
  postId?: string;
  imageMediaId?: string;
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

// ── Buffer API helpers ────────────────────────────────────────────────────────
const BUFFER_API = "https://api.bufferapp.com/1";

async function uploadImageToBuffer(
  accessToken: string,
  profileId: string,
  imageUrl: string
): Promise<string | undefined> {
  try {
    // Fetch image from Supabase
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Image fetch failed: " + imgRes.status);
    const imageBuffer = await imgRes.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);

    // Build multipart form data
    const boundary = "----BearSignalBoundary" + Date.now();
    const CRLF = "\r\n";

    // Encode image as base64 for the Buffer media upload endpoint
    // Buffer v1 media upload accepts image URL directly
    const uploadBody = new URLSearchParams({
      access_token: accessToken,
      profile_id: profileId,
      photo: imageUrl,
    });

    const uploadRes = await fetch(BUFFER_API + "/media/upload.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: uploadBody.toString(),
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.warn("[buffer] Media upload failed " + uploadRes.status + ": " + err);
      return undefined;
    }

    const uploadData = await uploadRes.json();
    return uploadData?.id || uploadData?.media_id || undefined;
  } catch (err) {
    console.warn("[buffer] Image upload error (text-only fallback):", err);
    return undefined;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function postToBuffer(content: string): Promise<BufferPostResult> {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN;
  const profileId = process.env.BUFFER_PROFILE_ID;

  if (!accessToken) return { success: false, error: "BUFFER_ACCESS_TOKEN not set" };
  if (!profileId) return { success: false, error: "BUFFER_PROFILE_ID not set" };

  const imageUrl = getCurrentImageUrl();
  console.log("[buffer] Image URL:", imageUrl);
  console.log("[buffer] Profile ID:", profileId);

  // Build post body — include image as media photo URL
  // Buffer v1 /updates/create supports photo[] array with URL + description
  const params = new URLSearchParams({
    access_token: accessToken,
    "profile_ids[]": profileId,
    text: content,
    now: "true",  // post immediately (not queued)
    "media[photo]": imageUrl,
    "media[description]": "Bear Team Real Estate — Orlando, FL",
    "media[title]": "Join Bear Team",
  });

  try {
    const res = await fetch(BUFFER_API + "/updates/create.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok || !data?.success) {
      const errMsg = data?.message || data?.error || JSON.stringify(data);
      console.error("[buffer] Post failed " + res.status + ": " + errMsg);
      return { success: false, error: "Buffer API " + res.status + ": " + errMsg };
    }

    const postId = data?.updates?.[0]?.id || data?.update?.id || undefined;
    console.log("[buffer] Posted successfully. ID:", postId);
    return { success: true, postId };

  } catch (err) {
    return { success: false, error: "Buffer post error: " + String(err) };
  }
}
