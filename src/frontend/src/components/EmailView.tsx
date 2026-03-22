import type { IEmailFull } from "@/types/email";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(from: string): string {
  const name = from.replace(/<[^>]+>/, "").trim();
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "??";
}

const COLOURS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
];
function getSenderColour(from: string): string {
  let hash = 0;
  for (let i = 0; i < from.length; i++)
    hash = from.charCodeAt(i) + ((hash << 5) - hash);
  return COLOURS[Math.abs(hash) % COLOURS.length];
}

function getDisplayName(from: string): string {
  const name = from.replace(/<[^>]+>/, "").trim();
  return name || from.replace(/.*<([^>]+)>.*/, "$1");
}

function parseEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from.trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getBody(email: IEmailFull): string {
  if (email.bodyPlain && email.bodyPlain.trim().length > 0) {
    return email.bodyPlain.trim();
  }
  if (email.bodyHtml && email.bodyHtml.trim().length > 0) {
    return stripHtml(email.bodyHtml);
  }
  return email.snippet || "(no content)";
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface EmailViewProps {
  email: IEmailFull | null;
  isLoadingEmail: boolean;
  isLoadingEmails: boolean;
}

export function EmailView({
  email,
  isLoadingEmail,
  isLoadingEmails,
}: EmailViewProps) {
  if (isLoadingEmail) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {isLoadingEmails ? "Loading emails…" : "Select an email to read"}
        </p>
      </div>
    );
  }

  const initials = getInitials(email.from);
  const colour = getSenderColour(email.from);
  const displayName = getDisplayName(email.from);
  const emailAddress = parseEmailAddress(email.from);
  const body = getBody(email);
  const date = new Date(email.date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Sender info */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-medium flex-shrink-0"
            style={{ backgroundColor: colour, color: "#ffffff" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-base truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground truncate">
              {emailAddress}
            </p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
            {date}
          </span>
        </div>

        {/* Subject */}
        <h1 className="text-2xl mb-6">{email.subject}</h1>

        {/* Body */}
        <div className="text-base leading-relaxed whitespace-pre-line text-foreground">
          {body}
        </div>
      </div>
    </div>
  );
}
