import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { IEmailListItem } from "@/types/email";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (mirrors DashboardPage — shared utils candidate post-MVP)
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

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton row
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="p-4 flex gap-3 border-b border-sidebar-border animate-pulse">
      <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-full" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  emails: IEmailListItem[];
  selectedEmailId: string | null;
  isLoadingEmails: boolean;
  onEmailSelect: (messageId: string) => void;
  onRefresh: () => void;
}

export function Sidebar({
  emails,
  selectedEmailId,
  isLoadingEmails,
  onEmailSelect,
  onRefresh,
}: SidebarProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Inbox Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm">Inbox</h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingEmails}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors disabled:opacity-50"
            aria-label="Refresh emails"
          >
            <RefreshCw
              className={`w-4 h-4 text-foreground ${
                isRefreshing || isLoadingEmails ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full pl-10 pr-4 py-2 bg-background rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingEmails ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : emails.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No emails yet — click ↺ to sync
          </div>
        ) : (
          emails.map((email) => {
            const initials = getInitials(email.from);
            const colour = getSenderColour(email.from);
            const displayName = getDisplayName(email.from);
            const isSelected = email.messageId === selectedEmailId;

            return (
              <button
                key={email.messageId}
                onClick={() => onEmailSelect(email.messageId)}
                className={`w-full p-4 flex gap-3 border-b border-sidebar-border text-left transition-colors ${
                  isSelected
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium"
                  style={{ backgroundColor: colour, color: "#ffffff" }}
                >
                  {initials}
                </div>

                {/* Email Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm truncate ${
                        !email.isRead ? "font-semibold" : ""
                      }`}
                    >
                      {displayName}
                    </h3>
                    {email.hasAttachments && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        📎
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-1 line-clamp-1">{email.subject}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {email.snippet}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
