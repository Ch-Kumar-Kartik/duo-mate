/**
 * IMPORTANT: Storing tokens in MongoDB means you can ditch Redis for session storage
 * during development. The User document itself becomes your "session" — the auth
 * callback creates/updates the User with fresh tokens, and the JWT references the
 * user's googleId. When the ETL pipeline needs tokens, it reads from the User model.
 *
 * Security note: In production, encrypt accessToken and refreshToken at rest.
 * For development, plain storage is fine.
 */
import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  lastSyncAt?: Date;
  syncStatus: "idle" | "syncing" | "error";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    lastSyncAt: { type: Date, default: null },
    syncStatus: {
      type: String,
      enum: ["idle", "syncing", "error"],
      default: "idle",
    },
  },
  {
    timestamps: true, // auto createdAt + updatedAt
  },
);

export const User = mongoose.model<IUserDocument>("User", userSchema);
