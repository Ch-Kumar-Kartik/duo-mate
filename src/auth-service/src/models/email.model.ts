// src/auth-service/src/models/email.model.ts
// TODO: Implement Mongoose schema and model for emails

/**
 * Email Mongoose Model
 *
 * This defines the MongoDB schema for storing emails.
 * Mongoose gives us schema validation, indexes, and query helpers.
 *
 * Steps to implement:
 *
 * 1. Import mongoose and your IEmail interface:
 *    - import mongoose, { Schema, Document } from 'mongoose';
 *    - import type { IEmail } from '../types/email.js';
 *
 * 2. Create a combined type for Mongoose documents:
 *    - export interface IEmailDocument extends IEmail, Document {}
 *
 * 3. Define the schema:
 *    const emailSchema = new Schema<IEmailDocument>({
 *        messageId:   { type: String, required: true },
 *        threadId:    { type: String, required: true },
 *        userId:      { type: String, required: true, index: true },
 *        subject:     { type: String, default: '(no subject)' },
 *        from:        { type: String, required: true },
 *        to:          { type: [String], default: [] },
 *        cc:          { type: [String], default: [] },
 *        bcc:         { type: [String], default: [] },
 *        date:        { type: Date, required: true },
 *        bodyPlain:   { type: String, default: null },
 *        bodyHtml:    { type: String, default: null },
 *        snippet:     { type: String, default: '' },
 *        labels:      { type: [String], default: [] },
 *        isRead:      { type: Boolean, default: true },
 *        hasAttachments:  { type: Boolean, default: false },
 *        attachmentCount: { type: Number, default: 0 },
 *        fetchedAt:   { type: Date, default: Date.now },
 *        processed:   { type: Boolean, default: false },
 *    }, {
 *        timestamps: true,  // adds createdAt and updatedAt automatically
 *    });
 *
 * 4. Add a compound unique index to prevent duplicate emails:
 *    emailSchema.index({ userId: 1, messageId: 1 }, { unique: true });
 *
 * 5. Add useful indexes for common queries:
 *    emailSchema.index({ userId: 1, date: -1 });         // fetch emails sorted by date
 *    emailSchema.index({ userId: 1, threadId: 1 });      // fetch thread conversations
 *    emailSchema.index({ userId: 1, processed: 1 });     // find unprocessed emails
 *
 * 6. Export the model:
 *    export const Email = mongoose.model<IEmailDocument>('Email', emailSchema);
 *
 * Docs:
 * - Mongoose schemas: https://mongoosejs.com/docs/guide.html
 * - Mongoose indexes: https://mongoosejs.com/docs/guide.html#indexes
 */
