interface EmailViewProps {
  sender: string;
  email: string;
  initials: string;
  subject: string;
  content: string;
  color: string;
}

export function EmailView({ sender, email, initials, subject, content, color }: EmailViewProps) {
  return (
    <div className="flex-1 bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Sender Info */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base"
            style={{ backgroundColor: color, color: '#ffffff' }}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-base">{sender}</h2>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Subject */}
        <h1 className="text-2xl mb-6">{subject}</h1>

        {/* Email Content */}
        <div className="text-base leading-relaxed whitespace-pre-line text-foreground">
          {content}
        </div>
      </div>
    </div>
  );
}
