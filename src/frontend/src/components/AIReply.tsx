import { RefreshCw, Send } from 'lucide-react';

interface AIReplyProps {
  reply: string;
  onRegenerate: () => void;
  onSend: () => void;
}

export function AIReply({ reply, onRegenerate, onSend }: AIReplyProps) {
  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-muted-foreground">AI-Generated Reply</h3>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-sidebar transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity text-sm"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>

        {/* Reply Content */}
        <div className="p-6 bg-card rounded-lg border border-border">
          <p className="text-base leading-relaxed whitespace-pre-line text-card-foreground">
            {reply}
          </p>
        </div>
      </div>
    </div>
  );
}
