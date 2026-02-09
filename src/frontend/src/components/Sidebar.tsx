import { Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Email {
  id: number;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  color: string;
}

interface SidebarProps {
  emails: Email[];
  selectedEmailId: number;
  onEmailSelect: (id: number) => void;
  onRefresh: () => void;
}

export function Sidebar({ emails, selectedEmailId, onEmailSelect, onRefresh }: SidebarProps) {
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
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors disabled:opacity-50"
            aria-label="Refresh emails"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
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
        {emails.map((email) => (
          <button
            key={email.id}
            onClick={() => onEmailSelect(email.id)}
            className={`w-full p-4 flex gap-3 border-b border-sidebar-border text-left transition-colors ${
              selectedEmailId === email.id
                ? 'bg-sidebar-accent'
                : 'hover:bg-sidebar-accent/50'
            }`}
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{ backgroundColor: email.color, color: '#ffffff' }}
            >
              {email.initials}
            </div>

            {/* Email Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm truncate">{email.sender}</h3>
              </div>
              <p className="text-sm mb-1 line-clamp-1">{email.subject}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {email.preview}
              </p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}