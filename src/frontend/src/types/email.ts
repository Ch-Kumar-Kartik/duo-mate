export interface IEmailListItem {
  _id: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isRead: boolean;
  hasAttachments: boolean;
  labels: string[];
}

export interface IEmailFull extends IEmailListItem {
  to: string[];
  cc: string[];
  bcc: string[];
  bodyPlain: string | null;
  bodyHtml: string | null;
  attachmentCount: number;
}
