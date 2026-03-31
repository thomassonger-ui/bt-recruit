/**
 * BearSignal — LinkedIn Poster
 *
 * Posts text content + a rotating Bear Team image.
 * Author priority:
 *   1. Organization (showcase page) if LINKEDIN_ORG_ID set AND org posting succeeds
 *   2. Personal profile fallback if org posting returns 403 (scope not yet granted)
 *
 * Image rotation: deterministic by week-of-year (week % 16 + 1)
 * Images hosted in Supabase Storage: bucket "bearsignal-images"
 */

export interface LinkedInPostResult {
  success: boolean;
  postId?: string;
  imageAsset?: string;
  postedAs?: "org" | "personal";
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

// ── LinkedIn API helpers ──────────────────────────────────────────────────────

async function getMemberUrn(accessToken: string): Promise<string> {
  // Try v2/userinfo first (OpenID), fall back to v2/me
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: "Bearer " + accessToken },
  });
  if (res.ok) {
    const data = await res.json();
    if (data.sub) return "urn:li:person:" + data.sub;
  }
  // Fallback: v2/me
  const res2 = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: "Bearer " + accessToken },
  });
  if (!res2.ok) throw new Error("Could not get member URN: " + res2.status);
  const data2 = await res2.json();
  return "urn:li:person:" + data2.id;
}

async function registerImageUpload(
  accessToken: string,
  authorUrn: string
): Promise<{ uploadUrl: string; asset: string }> {
  const body = {
    registerUploadRequest: {
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      owner: authorUrn,
      serviceRelationships: [
        { relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" },
      ],
    },
  };

  const res = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("registerUpload " + res.status + ": " + err);
  }

  const data = await res.json();
  const uploadUrl =
    data?.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]?.uploadUrl;
  const asset = data?.value?.asset;
  if (!uploadUrl || !asset) throw new Error("Missing uploadUrl/asset in registerUpload response");
  return { uploadUrl, asset };
}

async function uploadImageBinary(
  uploadUrl: string,
  accessToken: string,
  imageUrl: string
): Promise<void> {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Image fetch failed: " + imgRes.status + " " + imageUrl);
  const imageBuffer = await imgRes.arrayBuffer();

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "image/png",
    },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error("Image upload failed " + uploadRes.status + ": " + err);
  }
}

async function createUgcPost(
  accessToken: string,
  authorUrn: string,
  content: string,
  imageAsset?: string
): Promise<{ ok: boolean; postId?: string; status?: number; body?: string }> {
  const media = imageAsset
    ? [
        {
          status: "READY",
          description: { text: "Bear Team Real Estate — Orlando, FL" },
          media: imageAsset,
          title: { text: "Join Bear Team" },
        },
      ]
    : undefined;

  const ugcPost = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: content },
        shareMediaCategory: imageAsset ? "IMAGE" : "NONE",
        ...(media ? { media } : {}),
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(ugcPost),
  });

  const body = await res.text();
  if (!res.ok) return { ok: false, status: res.status, body };
  const postId = res.headers.get("x-restli-id") || undefined;
  return { ok: true, postId };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function postToLinkedIn(content: string): Promise<LinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) return { success: false, error: "LINKEDIN_ACCESS_TOKEN not set" };

  const orgId = process.env.LINKEDIN_ORG_ID;
  const orgUrn = orgId ? "urn:li:organization:" + orgId : null;

  // Get personal URN (needed for image upload owner regardless)
  let personalUrn: string;
  try {
    personalUrn = await getMemberUrn(accessToken);
    console.log("[linkedin] Personal URN:", personalUrn);
  } catch (err) {
    return { success: false, error: "Could not resolve member URN: " + String(err) };
  }

  // ── Upload rotating image (registered under personal URN — works with w_member_social) ──
  let imageAsset: string | undefined;
  try {
    const imageUrl = getCurrentImageUrl();
    console.log("[linkedin] Uploading image:", imageUrl);
    const { uploadUrl, asset } = await registerImageUpload(accessToken, personalUrn);
    await uploadImageBinary(uploadUrl, accessToken, imageUrl);
    imageAsset = asset;
    console.log("[linkedin] Image asset:", imageAsset);
  } catch (err) {
    console.error("[linkedin] Image upload failed (text-only fallback):", err);
  }

  // ── Try org URN first (showcase page), fall back to personal ──
  if (orgUrn) {
    console.log("[linkedin] Attempting org post as:", orgUrn);
    const orgResult = await createUgcPost(accessToken, orgUrn, content, imageAsset);
    if (orgResult.ok) {
      console.log("[linkedin] Posted as org — id:", orgResult.postId);
      return { success: true, postId: orgResult.postId, imageAsset, postedAs: "org" };
    }
    console.warn("[linkedin] Org post failed (" + orgResult.status + "), falling back to personal profile");
  }

  // ── Personal profile post ──
  console.log("[linkedin] Posting as personal:", personalUrn);
  const personalResult = await createUgcPost(accessToken, personalUrn, content, imageAsset);
  if (personalResult.ok) {
    console.log("[linkedin] Posted as personal — id:", personalResult.postId);
    return { success: true, postId: personalResult.postId, imageAsset, postedAs: "personal" };
  }

  return {
    success: false,
    error: "ugcPosts failed " + personalResult.status + ": " + personalResult.body,
  };
}
