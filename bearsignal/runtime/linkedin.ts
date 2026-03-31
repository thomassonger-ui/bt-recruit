/**
 * BearSignal — LinkedIn Poster
 *
 * Posts text content + a rotating Bear Team image directly to the
 * Join Bear Team showcase page (org 112582896).
 *
 * Requires LINKEDIN_ACCESS_TOKEN with w_organization_social scope.
 * Re-authorize at /api/auth/linkedin when token expires (~60 days).
 *
 * Image rotation: deterministic by week-of-year (week % 16 + 1)
 * Images hosted in Supabase Storage: bucket "bearsignal-images"
 */

export interface LinkedInPostResult {
  success: boolean;
  postId?: string;
  imageAsset?: string;
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

// ── Main export ───────────────────────────────────────────────────────────────

export async function postToLinkedIn(content: string): Promise<LinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) return { success: false, error: "LINKEDIN_ACCESS_TOKEN not set" };

  const orgId = process.env.LINKEDIN_ORG_ID;
  if (!orgId) return { success: false, error: "LINKEDIN_ORG_ID not set — showcase page posting requires org scope" };

  const authorUrn = "urn:li:organization:" + orgId;

  // ── Upload rotating image ──────────────────────────────────────────────────
  let imageAsset: string | undefined;
  try {
    const imageUrl = getCurrentImageUrl();
    console.log("[linkedin] Uploading image:", imageUrl);
    const { uploadUrl, asset } = await registerImageUpload(accessToken, authorUrn);
    await uploadImageBinary(uploadUrl, accessToken, imageUrl);
    imageAsset = asset;
    console.log("[linkedin] Image asset:", imageAsset);
  } catch (err) {
    console.error("[linkedin] Image upload failed (text-only fallback):", err);
  }

  // ── Post to showcase page ──────────────────────────────────────────────────
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

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: "LinkedIn ugcPosts " + res.status + ": " + errText };
  }

  const postId = res.headers.get("x-restli-id") || undefined;
  console.log("[linkedin] Posted to showcase — id:", postId);
  return { success: true, postId, imageAsset };
}
