import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Missing LINKEDIN_CLIENT_ID or LINKEDIN_REDIRECT_URI env vars" }, { status: 500 });
  }

  // w_member_social   — post as personal profile
  // w_organization_social — post as organization / showcase page (requires Marketing Developer Platform product)
  const scope = "w_member_social w_organization_social";
  const state = "bearsignal_" + Date.now();

  const authUrl = "https://www.linkedin.com/oauth/v2/authorization" +
    "?response_type=code" +
    "&client_id=" + clientId +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&scope=" + encodeURIComponent(scope) +
    "&state=" + state;

  return NextResponse.redirect(authUrl);
}
