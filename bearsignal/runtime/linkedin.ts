/**
 * BearSignal — LinkedIn Poster
 *
 * Posts text content + a rotating Bear Team image to the
 * "Join Bear Team" LinkedIn Showcase page (org 112582896).
 *
 * Image rotation: deterministic by week-of-year so every post in
 * the same week shares the same image, and it advances each week.
 *
 * Images are hosted in Supabase Storage:
 *   {SUPABASE_URL}/storage/v1/object/public/bearsignal-images/Bear Team Recruit {N}.png
 *
 * LinkedIn image upload flow (UGC Posts with inline image):
 *   1. Register upload → get uploadUrl + asset URN
 *   2. PUT binary to uploadUrl
 *   3. Create ugcPost with media[].media = asset URN
 */

export interface LinkedInPostResult {
  success: boolean;
  postId?: string;
  imageAsset?: string;
  error?: string;
}

// ── Image rotation ────────────────────────────────────────────────────────────
// 16 images named "Bear Team Recruit 1.png" through "Bear Team Recruit 16.png"
// Exception: image 5 has a trailing dot: "Bear Team Recruit 5..png"
const IMAGE_COUNT = 16;

function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function getImageFilename(index: number): string {
  // index is 1-based (1–16)
  // Image 5 has an extra dot in the filename
  if (index === 5) return "Bear Team Recruit 5..png";
  return `Bear Team Recruit ${index}.png`;
}

function getCurrentImageUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const week = getWeekOfYear();
  const imageIndex = (week % IMAGE_COUNT) + 1; // 1–16
  const filename = encodeURIComponent(getImageFilename(imageIndex));
  return `${supabaseUrl}/storage/v1/object/public/bearsignal-images/${filename}`;
}

// ── LinkedIn API helpers ──────────────────────────────────────────────────────

async function getMemberUrn(accessToken: string): Promise<string> {
  const res = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: "Bearer " + accessToken },
  });
  if (!res.ok) {
    throw new Error("LinkedIn /v2/me failed: " + res.status);
  }
  const data = await res.json();
  return "urn:li:person:" + data.id;
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
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent",
        },
      ],
    },
  };

  const res = await fetch(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("LinkedIn registerUpload failed " + res.status + ": " + errText);
  }

  const data = await res.json();
  const uploadUrl =
    data?.value?.uploadMechanism?.[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ]?.uploadUrl;
  const asset = data?.value?.asset;

  if (!uploadUrl || !asset) {
    throw new Error(
      "LinkedIn registerUpload: missing uploadUrl or asset in response"
    );
  }

  return { uploadUrl, asset };
}

async function uploadImageBinary(
  uploadUrl: string,
  accessToken: string,
  imageUrl: string
): Promise<void> {
  // Fetch the image from Supabase Storage
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(
      "Failed to fetch image from storage: " + imgRes.status + " " + imageUrl
    );
  }
  const imageBuffer = await imgRes.arrayBuffer();

  // Upload to LinkedIn
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "image/png",
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(
      "LinkedIn image binary upload failed " + uploadRes.status + ": " + errText
    );
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function postToLinkedIn(
  content: string
): Promise<LinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) {
    return { success: false, error: "LINKEDIN_ACCESS_TOKEN not set" };
  }

  let authorUrn: string;
  const orgId = process.env.LINKEDIN_ORG_ID;
  if (orgId) {
    authorUrn = "urn:li:organization:" + orgId;
  } else {
    try {
      authorUrn = await getMemberUrn(accessToken);
    } catch (err) {
      return {
        success: false,
        error: "Could not resolve author URN: " + String(err),
      };
    }
  }

  // ── Step 1: Upload rotating image ─────────────────────────────────────────
  let imageAsset: string | undefined;

  try {
    const imageUrl = getCurrentImageUrl();
    console.log("[linkedin] Uploading image:", imageUrl);

    const { uploadUrl, asset } = await registerImageUpload(
      accessToken,
      authorUrn
    );
    await uploadImageBinary(uploadUrl, accessToken, imageUrl);
    imageAsset = asset;
    console.log("[linkedin] Image asset registered:", imageAsset);
  } catch (err) {
    // Non-fatal: post text-only if image upload fails
    console.error("[linkedin] Image upload failed (posting text-only):", err);
  }

  // ── Step 2: Create UGC post ────────────────────────────────────────────────
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

  const ugcPost: Record<string, unknown> = {
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

  try {
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
      return {
        success: false,
        error: "LinkedIn ugcPosts failed " + res.status + ": " + errText,
      };
    }

    const postId = res.headers.get("x-restli-id") || undefined;
    console.log("[linkedin] Posted successfully. ID:", postId);
    return { success: true, postId, imageAsset };
  } catch (err) {
    return { success: false, error: "LinkedIn post error: " + String(err) };
  }
}
