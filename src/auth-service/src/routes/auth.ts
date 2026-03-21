import { Router } from "express";
import { User } from "../models/user.model.js";
import {
  generateAuthUrl,
  exchangeCodeForTokens,
  getUserInfo,
} from "../services/oauth.js";
import { createToken } from "../services/jwt.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const STATE_COOKIE_NAME = "oauth_state";
const TOKEN_COOKIE_NAME = "token";
const LEGACY_TOKEN_COOKIE_NAMES = [
  "auth_token",
  "access_token",
  "jwt",
] as const;

router.get("/google/login", (req, res) => {
  const { url, state } = generateAuthUrl();

  res.cookie(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
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

    res.clearCookie(STATE_COOKIE_NAME);

    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);

    const updateData: Record<string, unknown> = {
      googleId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };

    if (tokens.refresh_token) {
      updateData.refreshToken = tokens.refresh_token;
    }

    const user = await User.findOneAndUpdate(
      { googleId: userInfo.id },
      { $set: updateData },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const jwt = createToken(user.googleId, user.email);

    res.cookie(TOKEN_COOKIE_NAME, jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour — matches JWT_EXPIRES_IN
    });

    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set("token", jwt);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
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
  res.clearCookie(TOKEN_COOKIE_NAME);

  for (const cookieName of LEGACY_TOKEN_COOKIE_NAMES) {
    res.clearCookie(cookieName);
  }

  res.clearCookie(STATE_COOKIE_NAME);

  return res.json({ success: true });
});

export default router;
