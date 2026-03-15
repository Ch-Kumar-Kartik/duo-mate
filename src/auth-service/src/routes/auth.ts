import { Router } from "express";
import {
  generateAuthUrl,
  exchangeCodeForTokens,
  getUserInfo,
} from "../services/oauth.js";
import { createToken, verifyToken } from "../services/jwt.js";
import {
  createSession,
  deleteSession,
  storeOAuthTokens,
} from "../services/session.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const STATE_COOKIE_NAME = "oauth_state";
const SESSION_COOKIE_NAME = "session_id";
const TOKEN_COOKIE_NAME = "auth_token";

function getBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) return null;
  if (!authorizationHeader.startsWith("Bearer ")) return null;
  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

router.get("/google/login", (req, res) => {
  const { url, state } = generateAuthUrl();

  res.cookie(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000, // 10 min
  });

  return res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  try {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const state = typeof req.query.state === "string" ? req.query.state : null;
    const cookieState = req.cookies?.[STATE_COOKIE_NAME] as string | undefined;

    if (!code) {
      return res.status(400).json({ error: "Missing authorization code" });
    }

    if (!state || !cookieState || state !== cookieState) {
      return res.status(400).json({ error: "Invalid OAuth state" });
    }

    // One-time use; clear ASAP after validation
    res.clearCookie(STATE_COOKIE_NAME);

    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);

    console.log("=== OAUTH DEBUG ===");
    console.log("Tokens:", tokens);
    console.log("UserInfo:", userInfo);

    const userId = userInfo.id;
    const email = userInfo.email;

    console.log("Extracted userId:", userId, "email:", email);

    await storeOAuthTokens(userId, tokens);

    const sessionId = await createSession(userId, email);

    const jwt = createToken(userId, email);

    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie(TOKEN_COOKIE_NAME, jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set("token", jwt);
    redirectUrl.searchParams.set("session", sessionId);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("=== OAUTH CALLBACK ERROR ===", error);
    const message =
      error instanceof Error ? error.message : "OAuth callback failed";
    return res
      .status(500)
      .json({ error: "Authentication failed", details: message });
  }
});

router.get("/me", authMiddleware, (req, res) => {
  const user = (req as any).user;
  return res.json({
    authenticated: true,
    user: {
      id: user?.sub,
      email: user?.email,
    },
  });
});

router.post("/logout", async (req, res) => {
  try {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (sessionId) {
      await deleteSession(sessionId);
    }

    res.clearCookie(SESSION_COOKIE_NAME);
    res.clearCookie(TOKEN_COOKIE_NAME);
    res.clearCookie(STATE_COOKIE_NAME);

    return res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return res.status(500).json({ error: "Logout failed", details: message });
  }
});

export default router;
