import axios from "axios";

const GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

function buildReplySubject(subject: string): string {
  const trimmed = subject.trim();
  return trimmed.toLowerCase().startsWith("re:") ? trimmed : `Re: ${trimmed}`;
}

function buildRfc2822(
  to: string,
  subject: string,
  body: string,
): string {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    body,
  ];
  return lines.join("\r\n");
}

export async function sendReply(
  accessToken: string,
  to: string,
  subject: string,
  replyBody: string,
  threadId: string,
): Promise<void> {
  const replySubject = buildReplySubject(subject);
  const raw = buildRfc2822(to, replySubject, replyBody);
  const encoded = Buffer.from(raw).toString("base64url");

  const payload: Record<string, string> = { raw: encoded };
  if (threadId) {
    payload.threadId = threadId;
  }

  const response = await axios.post(GMAIL_SEND_URL, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    validateStatus: null,
  });

  if (response.status === 401) {
    throw new Error("Token expired — please re-authenticate and try again.");
  }

  if (response.status === 403) {
    throw new Error(
      "Gmail send permission denied. Please re-authenticate to grant the send scope.",
    );
  }

  if (response.status < 200 || response.status >= 300) {
    const detail =
      (response.data as any)?.error?.message ??
      `HTTP ${response.status}`;
    throw new Error(`Gmail send failed: ${detail}`);
  }
}
