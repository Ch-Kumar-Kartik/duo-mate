export interface IGenerateReplyRequest {
  subject: string;
  from: string;
  bodyPlain: string;
}

export interface IGenerateReplyResponse {
  reply: string;
}

export interface ISendEmailRequest {
  to: string;
  subject: string;
  replyBody: string;
  threadId: string;
}
