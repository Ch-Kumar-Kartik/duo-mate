import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { EmailView } from "@/components/EmailView";
import { AIReply } from "@/components/AIReply";
import type { IEmailListItem, IEmailFull } from "@/types/email";
import { apiClient } from "@/lib/api-client";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function parseEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [emails, setEmails] = useState<IEmailListItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<IEmailFull | null>(null);
  const [aiReply, setAiReply] = useState("");
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // ── Load emails ───────────────────────────────────────────────────────────
  const loadEmails = useCallback(async () => {
    setIsLoadingEmails(true);
    try {
      let data = await apiClient.get<{ emails: IEmailListItem[] }>(
        "/email/list",
      );

      // Auto-sync on first load if inbox is empty
      if (data.emails.length === 0) {
        console.log("[dashboard] no emails found — triggering auto-sync");
        await apiClient.post("/email/sync");
        data = await apiClient.get<{ emails: IEmailListItem[] }>("/email/list");
      }

      setEmails(data.emails);

      // Auto-select the first email
      if (data.emails.length > 0) {
        handleEmailSelect(data.emails[0].messageId);
      }
    } catch (err) {
      console.error("[dashboard] failed to load emails:", err);
    } finally {
      setIsLoadingEmails(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // ── Stub handlers — replaced in steps 6.5 → 6.8 ─────────────────────────
  const handleRefresh = useCallback(async () => {
    try {
      await apiClient.post("/email/sync");
      await loadEmails();
    } catch (err) {
      console.error("[dashboard] refresh failed:", err);
    }
  }, [loadEmails]);
  const handleEmailSelect = useCallback(async (messageId: string) => {
    setIsLoadingEmail(true);
    setAiReply("");
    try {
      const email = await apiClient.get<IEmailFull>(`/email/${messageId}`);
      setSelectedEmail(email);
    } catch (err) {
      console.error("[dashboard] failed to load email:", err);
    } finally {
      setIsLoadingEmail(false);
    }
  }, []);
  const handleGenerate = useCallback(async () => {
    if (!selectedEmail) return;
    setIsGenerating(true);
    try {
      const data = await apiClient.post<{ reply: string }>(
        "/ai/generate-reply",
        {
          subject: selectedEmail.subject,
          from: selectedEmail.from,
          bodyPlain: selectedEmail.bodyPlain ?? selectedEmail.snippet,
        },
      );
      setAiReply(data.reply);
    } catch (err) {
      console.error("[dashboard] failed to generate reply:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedEmail]);
  const handleSend = useCallback(async () => {
    if (!selectedEmail || !aiReply.trim()) return;
    setIsSending(true);
    try {
      await apiClient.post("/email/send", {
        to: parseEmailAddress(selectedEmail.from),
        subject: selectedEmail.subject,
        replyBody: aiReply,
        threadId: selectedEmail.threadId,
      });
      console.log("[dashboard] reply sent successfully");
      setAiReply("");
    } catch (err) {
      console.error("[dashboard] failed to send reply:", err);
    } finally {
      setIsSending(false);
    }
  }, [selectedEmail, aiReply]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          emails={emails}
          selectedEmailId={selectedEmail?.messageId ?? null}
          isLoadingEmails={isLoadingEmails}
          onEmailSelect={handleEmailSelect}
          onRefresh={handleRefresh}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EmailView
            email={selectedEmail}
            isLoadingEmail={isLoadingEmail}
            isLoadingEmails={isLoadingEmails}
          />
          <AIReply
            reply={aiReply}
            isGenerating={isGenerating}
            isSending={isSending}
            onReplyChange={setAiReply}
            onRegenerate={handleGenerate}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
