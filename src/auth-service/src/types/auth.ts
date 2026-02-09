// src/auth-service/src/types/auth.ts
// TODO: Implement TypeScript interfaces for auth

/**
 * User info returned from Google OAuth
 */
export interface GoogleUserInfo {
    // TODO: Add fields - id, email, name, picture
}

/**
 * OAuth tokens from Google
 */
export interface OAuthTokens {
    // TODO: Add fields - access_token, refresh_token, expires_in, token_type
}

/**
 * Session data stored in Redis
 */
export interface SessionData {
    // TODO: Add fields - userId, email, tokens, createdAt
}

/**
 * JWT payload for internal auth
 */
export interface JwtPayload {
    // TODO: Add fields - sub (userId), email, iat, exp
}
