/**
 * BearSignal — LinkedIn Publisher
 * Posts generated content directly to the Join Bear Team showcase page.
 *
 * Uses LinkedIn UGC Posts API v2.
 * Requires LINKEDIN_ACCESS_TOKEN and LINKEDIN_ORG_ID env vars.
 *
 * Token expires every 60 days — re-authorize at /api/auth/linkedin
 */

const LINKEDIN_API = "https://api.linkedin.com/v2";

export interface LinkedInPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Get the authenticated member's URN (needed to post on behalf of org)
 */
async function getMemberUrn(accessToken: string): Promise<string> {
  const res = await fetch(LINKEDIN_API + "/userinfo", {
    headers: {
      "Authorization": "Bearer " + accessToken,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to get member info: " + res.status);
  }
  const data = await res.json();
  // sub is the member ID, format as urn:li:person:{id}
  return "urn:li:person:" + data.sub;
}

/**
 * Post text content to LinkedIn.
 * If LINKEDIN_ORG_ID is set, posts as the organization (showcase page).
 * Otherwise posts as the authenticated member (personal profile).
 */
export async function postToLinkedIn(content: string): Promise<LinkedInPostResult> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) {
    return { success: false, error: "LINKEDIN_ACCESS_TOKEN not set" };
  }

  try {
    let authorUrn: string;
    const orgId = process.env.LINKEDIN_ORG_ID;

    if (orgId) {
      // Post as organization / showcase page
      authorUrn = "urn:li:organization:" + orgId;
    } else {
      // Post as personal profile
      authorUrn = await getMemberUrn(accessToken);
    }

    const body = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const res = await fetch(LINKEDIN_API + "/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: "LinkedIn API " + res.status + ": " + errText };
    }

    const postId = res.headers.get("x-restli-id") || "unknown";
    console.log("[linkedin] Posted successfully — id: " + postId + " author: " + authorUrn);
    return { success: true, postId };

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}
