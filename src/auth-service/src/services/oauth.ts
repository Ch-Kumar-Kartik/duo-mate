import crypto from "node:crypto";
import axios from "axios";
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

  const response = await axios.post<OAuthTokens>(
    googleConfig.tokenUrl,
    body.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      validateStatus: null, // don't throw on non-2xx; we handle it below
    },
  );

  if (response.status < 200 || response.status >= 300) {
    const errorData = response.data as any;
    throw new Error(
      `Token exchange failed: ${errorData?.error_description ?? errorData?.error ?? response.status}`,
    );
  }

  return response.data;
}

export async function getUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const response = await axios.get<any>(googleConfig.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    validateStatus: null,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to fetch user info: HTTP ${response.status}`);
  }

  const userInfo = response.data;

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

  const response = await axios.post<OAuthTokens>(
    googleConfig.tokenUrl,
    body.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      validateStatus: null,
    },
  );

  if (response.status < 200 || response.status >= 300) {
    const errorData = response.data as any;
    throw new Error(
      `Token refresh failed: ${errorData?.error_description ?? errorData?.error ?? response.status}`,
    );
  }

  return response.data;
}
