// src/auth-service/src/config/google.ts
// TODO: Implement Google OAuth configuration

/**
 * Load these from environment variables (.env file)
 * 
 * Required env vars:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 */

export const googleConfig = {
    clientId: '', // TODO: process.env.GOOGLE_CLIENT_ID
    clientSecret: '', // TODO: process.env.GOOGLE_CLIENT_SECRET
    redirectUri: '', // TODO: process.env.GOOGLE_REDIRECT_URI

    // OAuth URLs
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',

    // Scopes you configured in Google Cloud
    scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
    ],
};
