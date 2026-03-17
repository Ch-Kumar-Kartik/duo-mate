export interface IEmail {
  messageId: string;
  threadId: string;
  userId: string;
  subject: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  date: Date;
  bodyPlain: string | null;
  bodyHtml: string | null;
  snippet: string;
  labels: string[];
  isRead: boolean;
  hasAttachments: boolean;
  attachmentCount: number;
  fetchedAt: Date;
  processed: boolean;
}

export interface IGmailMessagePart {
  mimeType: string;
  body?: {
    data?: string;
    size: number;
  };
  filename?: string;
  parts?: IGmailMessagePart[];
}

export interface IGmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    mimeType: string;
    body?: { data?: string; size: number };
    parts?: IGmailMessagePart[];
  };
}

export interface IListMessagesOptions {
  query?: string;
  maxResults?: number;
  pageToken?: string;
  labelIds?: string[];
}

export interface IListMessagesResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface ISyncStatus {
  userId: string;
  status: "idle" | "syncing" | "completed" | "error";
  totalMessages: number;
  processedMessages: number;
  lastSyncAt: Date | null;
  error?: string;
}
