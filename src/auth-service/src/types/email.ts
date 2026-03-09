// src/auth-service/src/types/email.ts
// TODO: Implement TypeScript interfaces for email data

/**
 * Represents a single email fetched from Gmail.
 * This interface defines the shape of email data AFTER transformation
 * (i.e., after parsing the raw Gmail API response).
 *
 * Fields to add:
 * - messageId: string          → Gmail message ID (unique per message)
 * - threadId: string           → Gmail thread ID (groups related emails)
 * - userId: string             → Your app's user ID (the Google user.id from OAuth)
 * - subject: string            → Email subject line
 * - from: string               → Sender address (e.g., "John Doe <john@example.com>")
 * - to: string[]               → Recipient addresses
 * - cc: string[]               → CC addresses (default: [])
 * - bcc: string[]              → BCC addresses (default: [])
 * - date: Date                 → When the email was sent/received
 * - bodyPlain: string | null   → Plain text body (null if not available)
 * - bodyHtml: string | null    → HTML body (null if not available)
 * - snippet: string            → Gmail's preview snippet (first ~100 chars)
 * - labels: string[]           → Gmail labels: INBOX, SENT, UNREAD, STARRED, etc.
 * - isRead: boolean            → Whether the email has been read
 * - hasAttachments: boolean    → Whether the email has file attachments
 * - attachmentCount: number    → Number of attachments
 * - fetchedAt: Date            → Timestamp when we fetched this email
 * - processed: boolean         → Whether downstream processing is done (default: false)
 */
export interface IEmail {
    // TODO: Add the fields listed above
}

/**
 * Represents a raw Gmail API message response.
 * You get this from: GET /gmail/v1/users/me/messages/{id}?format=full
 *
 * You don't need to define every field — just the ones you'll use:
 * - id: string
 * - threadId: string
 * - labelIds: string[]
 * - snippet: string
 * - payload: {
 *     headers: Array<{ name: string; value: string }>
 *     mimeType: string
 *     body?: { data?: string; size: number }
 *     parts?: Array<{
 *       mimeType: string
 *       body?: { data?: string; size: number }
 *       filename?: string
 *       parts?: ... (recursive for nested multipart)
 *     }>
 *   }
 * - internalDate: string   → Unix timestamp in milliseconds as a string
 *
 * Docs: https://developers.google.com/gmail/api/reference/rest/v1/users.messages#Message
 */
export interface IGmailMessage {
    // TODO: Add the fields listed above
    // Tip: You can make this loose with [key: string]: any for fields you don't need
}

/**
 * Options for listing Gmail messages.
 * Used by the Gmail client's listMessages() method.
 *
 * Fields:
 * - query?: string        → Gmail search query (e.g., "after:2024/01/01", "is:unread")
 * - maxResults?: number   → Max messages to return per page (default: 100, max: 500)
 * - pageToken?: string    → Token for pagination (from previous response)
 * - labelIds?: string[]   → Filter by labels (e.g., ['INBOX'])
 */
export interface IListMessagesOptions {
    // TODO: Add the fields listed above
}

/**
 * Response shape from Gmail's messages.list endpoint.
 *
 * Fields:
 * - messages: Array<{ id: string; threadId: string }>  → List of message stubs
 * - nextPageToken?: string                              → Token for next page (null if last page)
 * - resultSizeEstimate: number                          → Approximate total count
 */
export interface IListMessagesResponse {
    // TODO: Add the fields listed above
}

/**
 * Email sync status — tracks the state of an email sync job.
 *
 * Fields:
 * - userId: string
 * - status: 'idle' | 'syncing' | 'completed' | 'error'
 * - totalMessages: number
 * - processedMessages: number
 * - lastSyncAt: Date | null
 * - error?: string
 */
export interface ISyncStatus {
    // TODO: Add the fields listed above
}
