import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt.js";
import type { JwtPayload } from "../types/auth.js";

function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) return null;
  if (!authorizationHeader.startsWith("Bearer ")) return null;

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function extractTokenFromRequest(req: Request): string | null {
  const bearerToken = extractBearerToken(req.headers.authorization);
  if (bearerToken) return bearerToken;

  const cookieToken =
    req.cookies?.token ?? req.cookies?.access_token ?? req.cookies?.jwt ?? null;

  return typeof cookieToken === "string" && cookieToken.length > 0
    ? cookieToken
    : null;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractTokenFromRequest(req);

  if (!token) {
    res.status(401).json({ error: "Not authenticated: token missing" });
    return;
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Not authenticated: invalid token" });
  }
}
