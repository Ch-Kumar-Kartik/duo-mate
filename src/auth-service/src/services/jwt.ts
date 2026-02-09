// src/auth-service/src/services/jwt.ts
// TODO: Implement JWT service

// import jwt from 'jsonwebtoken';
// import type { JwtPayload } from '../types/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

/**
 * Create a signed JWT token
 * 
 * Steps:
 * 1. Build payload with: sub (userId), email, iat (issued at)
 * 2. Sign with JWT_SECRET and set expiration
 * 3. Return the signed token
 * 
 * Docs: https://www.npmjs.com/package/jsonwebtoken
 */
export function createToken(userId: string, email: string): string {
    // TODO: Implement using jsonwebtoken.sign()
    throw new Error('Not implemented');
}

/**
 * Verify and decode a JWT token
 * 
 * Steps:
 * 1. Verify the token signature with JWT_SECRET
 * 2. Check expiration
 * 3. Return the decoded payload or throw error
 */
export function verifyToken(token: string): any {
    // TODO: Implement using jsonwebtoken.verify()
    throw new Error('Not implemented');
}

/**
 * Decode a JWT without verification (for expired tokens)
 * 
 * Use case: When token is expired but you need to read the userId
 * to fetch refresh_token from session storage
 */
export function decodeToken(token: string): any {
    // TODO: Implement using jsonwebtoken.decode()
    throw new Error('Not implemented');
}
