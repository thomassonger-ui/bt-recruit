import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return new NextResponse(
      "<h2>LinkedIn Auth Error</h2><p>" + (error || "No code returned") + "</p>",
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const clientId     = process.env.LINKEDIN_CLIENT_ID     || "";
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || "";
  const redirectUri  = process.env.LINKEDIN_REDIRECT_URI  || "";

  // Exchange code for access token
  const params = new URLSearchParams({
    grant_type:    "authorization_code",
    code,
    redirect_uri:  redirectUri,
    client_id:     clientId,
    client_secret: clientSecret,
  });

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    params.toString(),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || !tokenData.access_token) {
    return new NextResponse(
      "<h2>Token Exchange Failed</h2><pre>" + JSON.stringify(tokenData, null, 2) + "</pre>",
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const accessToken  = tokenData.access_token;
  const expiresIn    = tokenData.expires_in;
  const refreshToken = tokenData.refresh_token || "N/A (not provided)";

  const html = "<!DOCTYPE html><html><head><title>BearSignal — LinkedIn Auth</title>" +
    "<style>body{font-family:sans-serif;max-width:700px;margin:60px auto;padding:24px;}" +
    "h2{color:#0a66c2;}pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow:auto;word-break:break-all;}" +
    ".token{background:#e8f4e8;border:1px solid #4caf50;padding:16px;border-radius:8px;font-family:monospace;font-size:13px;word-break:break-all;}" +
    ".warn{color:#e65100;font-size:13px;margin-top:8px;}</style></head><body>" +
    "<h2>BearSignal — LinkedIn Authorization Complete</h2>" +
    "<p><strong>Access Token</strong> (copy this into Vercel as <code>LINKEDIN_ACCESS_TOKEN</code>):</p>" +
    "<div class='token'>" + accessToken + "</div>" +
    "<p class='warn'>This token expires in " + Math.round(expiresIn / 86400) + " days. You will need to re-authorize after it expires.</p>" +
    "<hr/>" +
    "<p><strong>Refresh Token:</strong> <code>" + refreshToken + "</code></p>" +
    "<p>Add <code>LINKEDIN_ACCESS_TOKEN</code> to your Vercel environment variables, then redeploy.</p>" +
    "</body></html>";

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
