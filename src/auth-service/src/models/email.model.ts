import mongoose, { Schema, Document } from "mongoose";
import type { IEmail } from "../types/email.ts";

export interface IEmailDocument extends IEmail, Document {}

const emailSchema = new Schema<IEmailDocument>(
  {
    messageId: { type: String, required: true },
    threadId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    subject: { type: String, default: "(no subject)" },
    from: { type: String, required: true },
    to: { type: [String], default: [] },
    cc: { type: [String], default: [] },
    bcc: { type: [String], default: [] },
    date: { type: Date, required: true },
    bodyPlain: { type: String, default: null },
    bodyHtml: { type: String, default: null },
    snippet: { type: String, default: "" },
    labels: { type: [String], default: [] },
    isRead: { type: Boolean, default: true },
    hasAttachments: { type: Boolean, default: false },
    attachmentCount: { type: Number, default: 0 },
    fetchedAt: { type: Date, default: Date.now },
    processed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

emailSchema.index({ userId: 1, messageId: 1 }, { unique: true });

emailSchema.index({ userId: 1, date: -1 }); // fetch emails sorted by date
emailSchema.index({ userId: 1, threadId: 1 }); // fetch thread conversations
emailSchema.index({ userId: 1, processed: 1 }); // find unprocessed emails

export const Email = mongoose.model<IEmailDocument>("Email", emailSchema);
