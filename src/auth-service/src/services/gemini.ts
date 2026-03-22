import { ai, GEMINI_MODEL } from "../config/gemini.js";
import type { IGenerateReplyRequest } from "../types/ai.js";

function buildPrompt(subject: string, from: string, bodyPlain: string): string {
  return `You are writing a professional email reply on behalf of the recipient.

Email details:
- From: ${from}
- Subject: ${subject}
- Original message:
${bodyPlain}

Instructions:
- Write a concise, professional reply that matches the tone of the original email.
- Do not use placeholder names like [Your Name] or [Name].
- Do not add a subject line — write only the body of the reply.
- End the email naturally without a placeholder signature.
- Keep the reply focused and relevant to the original message.

Reply:`;
}

export async function generateReply({
  subject,
  from,
  bodyPlain,
}: IGenerateReplyRequest): Promise<string> {
  const prompt = buildPrompt(subject, from, bodyPlain);

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  const text = response.text;

  if (!text || text.trim().length === 0) {
    throw new Error("Gemini returned an empty response");
  }

  return text.trim();
}
