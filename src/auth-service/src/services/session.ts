import crypto from "node:crypto";
import type { OAuthTokens, SessionData } from "../types/auth.js";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

type SessionRecord = SessionData & { expiresAt: number };

const sessions = new Map<string, SessionRecord>();
const oauthTokensByUserId = new Map<string, OAuthTokens>();

function isExpired(record: SessionRecord): boolean {
  return Date.now() >= record.expiresAt;
}

function cleanupExpiredSessions(): void {
  for (const [sessionId, record] of sessions) {
    if (isExpired(record)) {
      sessions.delete(sessionId);
    }
  }
}

// Periodic background cleanup to avoid unbounded memory growth
const cleanupTimer = setInterval(cleanupExpiredSessions, CLEANUP_INTERVAL_MS);
// Allow process to exit naturally in dev/tests when this is the only pending handle
cleanupTimer.unref();

/**
 * Redis equivalent:
 * - key: session:{sessionId}
 * - value: JSON(SessionData)
 * - TTL: 7 days
 */
export async function createSession(
  userId: string,
  email: string,
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const now = Date.now();

  sessions.set(sessionId, {
    userId,
    email,
    createdAt: new Date(now),
    expiresAt: now + SESSION_TTL_MS,
  });

  return sessionId;
}

export async function getSession(
  sessionId: string,
): Promise<SessionData | null> {
  const record = sessions.get(sessionId);
  if (!record) return null;

  if (isExpired(record)) {
    sessions.delete(sessionId);
    return null;
  }

  const { expiresAt: _expiresAt, ...session } = record;
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  sessions.delete(sessionId);
}

/**
 * Redis equivalent:
 * - key: oauth_tokens:{userId}
 * - value: JSON(OAuthTokens)
 */
export async function storeOAuthTokens(
  userId: string,
  tokens: OAuthTokens,
): Promise<void> {
  oauthTokensByUserId.set(userId, tokens);
}

export async function getOAuthTokens(
  userId: string,
): Promise<OAuthTokens | null> {
  return oauthTokensByUserId.get(userId) ?? null;
}
