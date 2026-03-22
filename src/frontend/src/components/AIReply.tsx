import { RefreshCw, Send, Loader2 } from "lucide-react";

interface AIReplyProps {
  reply: string;
  isGenerating: boolean;
  isSending: boolean;
  onReplyChange: (value: string) => void;
  onRegenerate: () => void;
  onSend: () => void;
}

export function AIReply({
  reply,
  isGenerating,
  isSending,
  onReplyChange,
  onRegenerate,
  onSend,
}: AIReplyProps) {
  const isDisabled = isGenerating || isSending;

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-muted-foreground">AI-Generated Reply</h3>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              disabled={isDisabled}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-sidebar transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isGenerating ? "Generating…" : "Regenerate"}
            </button>
            <button
              onClick={onSend}
              disabled={isDisabled || !reply.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        {/* Editable reply area */}
        <div className="relative">
          <textarea
            value={reply}
            onChange={(e) => onReplyChange(e.target.value)}
            disabled={isDisabled}
            placeholder="Click 'Regenerate' to generate an AI reply…"
            rows={6}
            className="w-full p-6 bg-card rounded-lg border border-border text-base leading-relaxed text-card-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          />
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-lg backdrop-blur-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
