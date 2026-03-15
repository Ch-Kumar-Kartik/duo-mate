import crypto from "node:crypto";
import { googleConfig } from "../config/google.js";
import type { GoogleUserInfo, OAuthTokens } from "../types/auth.js";
import "dotenv/config";

export function generateAuthUrl(): { url: string; state: string } {
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: googleConfig.clientId,
    redirect_uri: googleConfig.redirectUri,
    response_type: "code",
    scope: googleConfig.scopes.join(" "),
    state: state,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `${googleConfig.authorizationUrl}?${params.toString()}`;
  return { url, state };
}

export async function exchangeCodeForTokens(
  code: string,
): Promise<OAuthTokens> {
  const body = new URLSearchParams({
    code,
    client_id: googleConfig.clientId,
    client_secret: googleConfig.clientSecret,
    redirect_uri: googleConfig.redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(googleConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description}`);
  }

  const tokens = await response.json();
  return tokens as OAuthTokens;
}

export async function getUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const response = await fetch(googleConfig.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user info");
  }

  const userInfo = await response.json();
  // Google v3 userinfo returns 'sub' as the subject identifier
  return {
    ...userInfo,
    id: userInfo.sub || userInfo.id,
  } as GoogleUserInfo;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<OAuthTokens> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: googleConfig.clientId,
    client_secret: googleConfig.clientSecret,
    grant_type: "refresh_token",
  });

  const response = await fetch(googleConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description}`);
  }

  const tokens = await response.json();
  return tokens as OAuthTokens;
}
