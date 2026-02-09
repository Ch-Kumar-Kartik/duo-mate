// src/auth-service/src/middleware/auth.ts
// TODO: Implement auth middleware

import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../services/jwt.js';

/**
 * Auth middleware - protects routes that require authentication
 * 
 * Steps:
 * 1. Get token from Authorization header (Bearer token) or cookie
 * 2. Verify the JWT
 * 3. Attach user info to req.user
 * 4. Call next() or return 401
 * 
 * Usage: router.get('/protected', authMiddleware, handler)
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement

    // Example:
    // const authHeader = req.headers.authorization;
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({ error: 'No token provided' });
    // }
    // const token = authHeader.split(' ')[1];
    // try {
    //   const payload = verifyToken(token);
    //   (req as any).user = payload;
    //   next();
    // } catch (error) {
    //   return res.status(401).json({ error: 'Invalid token' });
    // }

    res.status(501).json({ error: 'Auth middleware not implemented' });
}
