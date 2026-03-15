import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types/auth.js';

const JWT_SECRET_RAW = process.env.JWT_SECRET || process.env.DEFAULT_JWT_SECRET;
if (!JWT_SECRET_RAW) {
    throw new Error('JWT_SECRET or DEFAULT_JWT_SECRET must be set in environment variables');
}
const JWT_SECRET: string = JWT_SECRET_RAW;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

export function createToken(userId: string, email: string): string {
    if (userId && email) {
        const payload: JwtPayload = {
            sub: userId,
            email,
            iat: Math.floor(Date.now() / 1000),
        };
        const token: string = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN as any,
        });
        return token;
    } else {
        throw new Error('Not implemented');
    }
}

export function verifyToken(token: string): any {
    if (token) {
        return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    } else {
        throw new Error('Not implemented');
    }
}

export function decodeToken(token: string): JwtPayload | null {
    if (token) {
        const decoded = jwt.decode(token);
        return decoded ? (decoded as unknown as JwtPayload) : null;
    } else {
        return null;
    }
}
