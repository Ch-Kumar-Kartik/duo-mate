import { GmailClient } from "./gmail.js";
import { Email } from "../models/email.model.js";
import { User } from "../models/user.model.js";
import { refreshAccessToken } from "./oauth.js";
import type {
  IEmail,
  IGmailMessage,
  IGmailMessagePart,
} from "../types/email.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseAddresses(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0);
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

/**
 * Recursively walks the Gmail MIME part tree and extracts:
 * - text/plain body
 * - text/html body
 * - attachment count
 */
function extractBody(part: IGmailMessagePart): {
  plain: string | null;
  html: string | null;
  attachmentCount: number;
} {
  let plain: string | null = null;
  let html: string | null = null;
  let attachmentCount = 0;

  // Count as attachment if it has a non-empty filename
  if (part.filename && part.filename.trim().length > 0) {
    attachmentCount += 1;
  }

  if (part.mimeType === "text/plain" && part.body?.data) {
    plain = decodeBase64Url(part.body.data);
  } else if (part.mimeType === "text/html" && part.body?.data) {
    html = decodeBase64Url(part.body.data);
  }

  // Recursively process nested parts
  if (part.parts && part.parts.length > 0) {
    for (const child of part.parts) {
      const childResult = extractBody(child);

      if (plain === null && childResult.plain !== null) {
        plain = childResult.plain;
      }

      if (html === null && childResult.html !== null) {
        html = childResult.html;
      }

      attachmentCount += childResult.attachmentCount;
    }
  }

  return { plain, html, attachmentCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// Transform
// ─────────────────────────────────────────────────────────────────────────────

export function transformGmailMessage(
  raw: IGmailMessage,
  userId: string,
): IEmail {
  const { payload } = raw;

  // ── Header extraction ─────────────────────────────────────────────────────
  const getHeader = (name: string): string =>
    payload.headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
      ?.value ?? "";

  const subject = getHeader("Subject");
  const from = getHeader("From");
  const to = parseAddresses(getHeader("To"));
  const cc = parseAddresses(getHeader("Cc"));
  const bcc = parseAddresses(getHeader("Bcc"));

  // Prefer the Date header; fall back to internal date if malformed
  const dateRaw = getHeader("Date");
  const date = dateRaw ? new Date(dateRaw) : new Date();

  // ── Body extraction ───────────────────────────────────────────────────────
  let bodyPlain: string | null = null;
  let bodyHtml: string | null = null;
  let attachmentCount = 0;

  if (payload.parts && payload.parts.length > 0) {
    // Multipart message — walk the part tree
    for (const part of payload.parts) {
      const result = extractBody(part);

      if (bodyPlain === null && result.plain !== null) {
        bodyPlain = result.plain;
      }

      if (bodyHtml === null && result.html !== null) {
        bodyHtml = result.html;
      }

      attachmentCount += result.attachmentCount;
    }
  } else if (payload.body?.data) {
    // Simple single-part message
    if (payload.mimeType === "text/html") {
      bodyHtml = decodeBase64Url(payload.body.data);
    } else {
      bodyPlain = decodeBase64Url(payload.body.data);
    }
  }

  // ── Build IEmail ──────────────────────────────────────────────────────────
  return {
    messageId: raw.id,
    threadId: raw.threadId,
    userId,
    subject,
    from,
    to,
    cc,
    bcc,
    date,
    bodyPlain,
    bodyHtml,
    snippet: raw.snippet ?? "",
    labels: raw.labelIds ?? [],
    isRead: !(raw.labelIds?.includes("UNREAD") ?? false),
    hasAttachments: attachmentCount > 0,
    attachmentCount,
    fetchedAt: new Date(),
    processed: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers for run()
// ─────────────────────────────────────────────────────────────────────────────

function formatDateForGmail(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ─────────────────────────────────────────────────────────────────────────────
// ETL Pipeline
// ─────────────────────────────────────────────────────────────────────────────

export class EmailETLPipeline {
  private gmailClient: GmailClient;
  private userId: string;
  private batchSize: number;

  constructor(userId: string, accessToken: string, batchSize = 50) {
    this.userId = userId;
    this.gmailClient = new GmailClient(accessToken);
    this.batchSize = batchSize;
  }

  async run(fullSync = false): Promise<{ synced: number; errors: number }> {
    // ── a. Mark user as syncing ───────────────────────────────────────────────
    await User.findOneAndUpdate(
      { googleId: this.userId },
      { $set: { syncStatus: "syncing" } },
    );

    try {
      // ── b. Determine Gmail query ────────────────────────────────────────────
      let query = "";

      if (!fullSync) {
        const user = await User.findOne({ googleId: this.userId }).select(
          "lastSyncAt",
        );

        if (user?.lastSyncAt) {
          query = `after:${formatDateForGmail(user.lastSyncAt)}`;
        } else {
          // No previous sync → treat as full sync
          query = "";
        }
      }

      // ── c. Extract: list all message IDs ───────────────────────────────────
      const messageRefs = await this.gmailClient.listAllMessages({ query });
      console.log(`Found ${messageRefs.length} messages to sync`);

      if (messageRefs.length === 0) {
        await this.finalize(0, 0);
        return { synced: 0, errors: 0 };
      }

      // ── d. Extract + Transform + Load in batches ────────────────────────────
      const batches = chunkArray(messageRefs, this.batchSize);
      const totalBatches = batches.length;

      let totalSynced = 0;
      let totalErrors = 0;

      for (let i = 0; i < batches.length; i++) {
        const batchRefs = batches[i];
        const batchIds = batchRefs.map((ref) => ref.id);

        // 1. Fetch full message payloads
        let rawMessages: IGmailMessage[];
        try {
          rawMessages = await this.gmailClient.getMessagesBatch(batchIds);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);

          // Token expired — try refresh once then retry
          if (message.includes("Token expired")) {
            const retried = await this.tryRefreshAndRetry(batchIds);
            if (retried) {
              rawMessages = retried;
            } else {
              console.error(
                `Batch ${i + 1}/${totalBatches}: token refresh failed, skipping`,
              );
              totalErrors += batchIds.length;
              continue;
            }
          } else {
            console.error(
              `Batch ${i + 1}/${totalBatches}: fetch failed — ${message}`,
            );
            totalErrors += batchIds.length;
            continue;
          }
        }

        // 2. Transform
        const emails: IEmail[] = [];
        for (const raw of rawMessages) {
          try {
            emails.push(transformGmailMessage(raw, this.userId));
          } catch (err) {
            console.error(`Transform failed for message ${raw.id}:`, err);
            totalErrors += 1;
          }
        }

        if (emails.length === 0) continue;

        // 3. Load — bulk upsert by (userId, messageId)
        try {
          const ops = emails.map((e) => ({
            updateOne: {
              filter: { userId: e.userId, messageId: e.messageId },
              update: { $set: e },
              upsert: true,
            },
          }));

          await Email.bulkWrite(ops, { ordered: false });
          totalSynced += emails.length;

          // 4. Log progress
          console.log(
            `Batch ${i + 1}/${totalBatches}: synced ${emails.length} emails`,
          );
        } catch (err) {
          console.error(
            `Batch ${i + 1}/${totalBatches}: bulkWrite failed:`,
            err,
          );
          totalErrors += emails.length;
        }
      }

      // ── e. Update user record ───────────────────────────────────────────────
      await this.finalize(totalSynced, totalErrors);

      // ── f. Return result ────────────────────────────────────────────────────
      return { synced: totalSynced, errors: totalErrors };
    } catch (error) {
      console.error("ETL pipeline error:", error);

      await User.findOneAndUpdate(
        { googleId: this.userId },
        { $set: { syncStatus: "error" } },
      );

      throw error;
    }
  }

  /**
   * Try to refresh the access token and retry the batch.
   * Returns the fetched messages on success, null on failure.
   */
  private async tryRefreshAndRetry(
    batchIds: string[],
  ): Promise<IGmailMessage[] | null> {
    try {
      const user = await User.findOne({ googleId: this.userId }).select(
        "refreshToken",
      );

      if (!user?.refreshToken) {
        console.error("No refresh token available for user", this.userId);
        return null;
      }

      const newTokens = await refreshAccessToken(user.refreshToken);

      // Persist the refreshed access token
      await User.findOneAndUpdate(
        { googleId: this.userId },
        {
          $set: {
            accessToken: newTokens.access_token,
            tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
          },
        },
      );

      // Swap in the new access token for subsequent requests
      this.gmailClient = new GmailClient(newTokens.access_token);

      return await this.gmailClient.getMessagesBatch(batchIds);
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  }

  /**
   * Finalize: update lastSyncAt and syncStatus on the user document.
   */
  private async finalize(synced: number, errors: number): Promise<void> {
    await User.findOneAndUpdate(
      { googleId: this.userId },
      {
        $set: {
          lastSyncAt: new Date(),
          syncStatus: errors > 0 && synced === 0 ? "error" : "idle",
        },
      },
    );
  }
}
