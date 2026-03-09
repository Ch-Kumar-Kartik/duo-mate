// src/auth-service/src/models/user.model.ts
// TODO: Implement Mongoose schema and model for users

/**
 * User Mongoose Model
 *
 * Stores user data from Google OAuth. Created/updated when a user
 * logs in via Google SSO. The googleId links to the Google user account
 * and is used as the key to associate emails with users.
 *
 * Steps to implement:
 *
 * 1. Import mongoose:
 *    - import mongoose, { Schema, Document } from 'mongoose';
 *
 * 2. Define the User interface:
 *    export interface IUser {
 *        googleId: string;           // Google's unique user ID (from userinfo.id)
 *        email: string;              // User's Gmail address
 *        name: string;               // Display name
 *        picture?: string;           // Profile picture URL
 *        accessToken?: string;       // Google OAuth access token (for Gmail API)
 *        refreshToken?: string;      // Google OAuth refresh token (for refreshing access)
 *        tokenExpiresAt?: Date;      // When the access token expires
 *        lastSyncAt?: Date;          // Last time emails were synced
 *        syncStatus: 'idle' | 'syncing' | 'error';  // Current sync state
 *        createdAt: Date;
 *        updatedAt: Date;
 *    }
 *
 * 3. Create the combined document type:
 *    export interface IUserDocument extends IUser, Document {}
 *
 * 4. Define the schema:
 *    const userSchema = new Schema<IUserDocument>({
 *        googleId:       { type: String, required: true, unique: true },
 *        email:          { type: String, required: true, unique: true },
 *        name:           { type: String, required: true },
 *        picture:        { type: String },
 *        accessToken:    { type: String },
 *        refreshToken:   { type: String },
 *        tokenExpiresAt: { type: Date },
 *        lastSyncAt:     { type: Date, default: null },
 *        syncStatus:     { type: String, enum: ['idle', 'syncing', 'error'], default: 'idle' },
 *    }, {
 *        timestamps: true,   // auto createdAt + updatedAt
 *    });
 *
 * 5. Export the model:
 *    export const User = mongoose.model<IUserDocument>('User', userSchema);
 *
 * IMPORTANT: Storing tokens in MongoDB means you can ditch Redis for session storage
 * during development. The User document itself becomes your "session" — the auth
 * callback creates/updates the User with fresh tokens, and the JWT references the
 * user's googleId. When the ETL pipeline needs tokens, it reads from the User model.
 *
 * Security note: In production, encrypt accessToken and refreshToken at rest.
 * For development, plain storage is fine.
 */
