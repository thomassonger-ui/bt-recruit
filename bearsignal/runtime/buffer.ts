/**
 * BearSignal — Buffer Poster
 *
 * Posts text content + a rotating Bear Team image to the
 * Join Bear Team LinkedIn showcase page via Buffer.
 *
 * Uses Buffer GraphQL API (api.buffer.com/graphql) — more stable than v1.
 * Falls back to Buffer v1 REST if GraphQL fails.
 *
 * Images served from Vercel CDN at joinbearteam.com/images/
 * for fast, clean URLs with no third-party domain exposure.
 *
 * Image rotation: deterministic by week-of-year (week % 16 + 1)
 *
 * Env vars required:
 *   BUFFER_ACCESS_TOKEN  — from publish.buffer.com/settings/api
 *   BUFFER_PROFILE_ID    — LinkedIn page channel ID in Buffer
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

// ── Buffer GraphQL API ────────────────────────────────────────────────────────

const GRAPHQL_URL = "https://api.buffer.com/graphql";

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post {
          id
          status
        }
      }
      ... on UnexpectedError {
        message
      }
      ... on InvalidInputError {
        message
      }
      ... on UnauthorizedError {
        message
      }
      ... on LimitReachedError {
        message
      }
    }
  }
`;

async function postViaGraphQL(
  accessToken: string,
  channelId: string,
  content: string,
  imageUrl: string
): Promise<BufferPostResult> {
  const variables = {
    input: {
      channelId,
      text: content,
      mode: "shareNow",
      schedulingType: "automatic",
      assets: {
        images: [{ url: imageUrl }],
      },
    },
  };

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: CREATE_POST_MUTATION, variables }),
  });

  const data = await res.json() as {
    data?: { createPost?: { post?: { id: string }; message?: string } };
    errors?: Array<{ message: string }>;
  };

  if (!res.ok) {
    return { success: false, error: "GraphQL HTTP " + res.status };
  }

  if (data?.errors?.length) {
    return { success: false, error: "GraphQL error: " + data.errors[0].message };
  }

  const result = data?.data?.createPost;
  if (!result) {
    return { success: false, error: "GraphQL: empty createPost response" };
  }

  // Success case
  if ("post" in result && result.post?.id) {
    return { success: true, postId: result.post.id };
  }

  // Error from mutation (InvalidInputError, UnexpectedError, etc.)
  const errMsg = result.message || "Unknown GraphQL mutation error";
  return { success: false, error: errMsg };
}

// ── Buffer v1 REST fallback ───────────────────────────────────────────────────

async function postViaV1(
  accessToken: string,
  profileId: string,
  content: string,
  imageUrl: string
): Promise<BufferPostResult> {
  const params = new URLSearchParams();
  params.append("access_token", accessToken);
  params.append("profile_ids[]", profileId);
  params.append("text", content);
  params.append("now", "true");
  params.append("media[photo]", imageUrl);
  params.append("media[description]", "Bear Team Real Estate — Orlando, FL");
  params.append("media[title]", "Join Bear Team");

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
    return { success: false, error: "Buffer v1 " + res.status + ": " + errMsg };
  }

  const updates = data?.updates as Array<{ id?: string }> | undefined;
  const postId = updates?.[0]?.id || "";
  return { success: true, postId };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function postToBuffer(content: string): Promise<BufferPostResult> {
  const accessToken = process.env.BUFFER_ACCESS_TOKEN;
  const profileId = process.env.BUFFER_PROFILE_ID;

  if (!accessToken) return { success: false, error: "BUFFER_ACCESS_TOKEN not set" };
  if (!profileId) return { success: false, error: "BUFFER_PROFILE_ID not set" };

  const imageUrl = getCurrentImageUrl();
  console.log("[buffer] Posting to channel:", profileId);
  console.log("[buffer] Image:", imageUrl);

  // ── Try GraphQL first ──
  console.log("[buffer] Attempting via GraphQL API...");
  try {
    const gqlResult = await postViaGraphQL(accessToken, profileId, content, imageUrl);
    if (gqlResult.success) {
      console.log("[buffer] GraphQL post succeeded. ID:", gqlResult.postId);
      return gqlResult;
    }
    console.warn("[buffer] GraphQL failed:", gqlResult.error, "— falling back to v1");
  } catch (err) {
    console.warn("[buffer] GraphQL threw:", err, "— falling back to v1");
  }

  // ── Fallback: Buffer v1 REST ──
  console.log("[buffer] Attempting via v1 REST API...");
  try {
    const v1Result = await postViaV1(accessToken, profileId, content, imageUrl);
    if (v1Result.success) {
      console.log("[buffer] v1 post succeeded. ID:", v1Result.postId);
      return v1Result;
    }
    console.error("[buffer] v1 also failed:", v1Result.error);
    return v1Result;
  } catch (err) {
    return { success: false, error: "Buffer v1 error: " + String(err) };
  }
}
