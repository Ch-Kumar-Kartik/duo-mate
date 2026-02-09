import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { EmailView } from '@/components/EmailView';
import { AIReply } from '@/components/AIReply';

interface Email {
    id: number;
    sender: string;
    email: string;
    initials: string;
    subject: string;
    preview: string;
    content: string;
    color: string;
    aiReply: string;
}

const mockEmails: Email[] = [
    {
        id: 1,
        sender: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        initials: 'SC',
        subject: 'Q4 Product Roadmap Review',
        preview: "Hi team, I've reviewed the latest product roadmap and have some...",
        content: `Hi team,

I've reviewed the latest product roadmap and have some thoughts on the Q4 priorities. Overall, the direction looks great, but I think we should consider moving the mobile app redesign up in the timeline.

The user research data suggests this is a higher priority than initially anticipated. Let me know your thoughts!

Best,
Sarah`,
        color: '#3b82f6',
        aiReply: `Hi Sarah,

Thank you for your feedback on the Q4 roadmap. I completely agree with your assessment about the mobile app redesign. The user research data does make a compelling case for prioritizing this.

Let's schedule a quick sync to discuss the timeline adjustments and resource allocation. Are you available tomorrow afternoon?

Best regards`
    },
    {
        id: 2,
        sender: 'Marcus Johnson',
        email: 'marcus.johnson@company.com',
        initials: 'MJ',
        subject: 'Design System Updates',
        preview: "Following up on yesterday's meeting about the component library...",
        content: `Hi there,

Following up on yesterday's meeting about the component library. I've updated the design tokens and added the new button variants we discussed.

Could you review when you get a chance? I'd love to get your feedback before we roll this out to the team.

Thanks,
Marcus`,
        color: '#10b981',
        aiReply: `Hi Marcus,

Thanks for the quick turnaround on the design system updates! I'll review the new button variants and tokens today and get back to you with feedback by end of day.

Looking forward to seeing the improvements!

Best`
    },
    {
        id: 3,
        sender: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        initials: 'ER',
        subject: 'Launch Timeline Discussion',
        preview: "Just sending a quick call to discuss the launch timeline?",
        content: `Hey team,

Just sending a quick call to discuss the launch timeline? We need to finalize the marketing materials and coordinate with the sales team.

I have a few time slots available this week. Let me know what works for everyone.

Cheers,
Emily`,
        color: '#f59e0b',
        aiReply: `Hi Emily,

Absolutely! Let's get everyone aligned on the launch timeline. I'm available Wednesday afternoon or Thursday morning. 

Let me know which works best and I'll send out a calendar invite.

Thanks`
    },
    {
        id: 4,
        sender: 'Alex Kim',
        email: 'alex.kim@company.com',
        initials: 'AK',
        subject: 'API Integration Questions',
        preview: "I have a few questions about the API integration we discussed...",
        content: `Hi,

I have a few questions about the API integration we discussed in last week's technical review. Specifically around authentication and rate limiting.

Can we set up some time to go over the implementation details? I want to make sure we're aligned before I start building.

Thanks,
Alex`,
        color: '#8b5cf6',
        aiReply: `Hi Alex,

Of course! Happy to clarify the authentication flow and rate limiting approach. I have time tomorrow at 2pm or Friday at 10am if either of those work for you.

I'll prepare some documentation to share beforehand as well.

Best`
    }
];

// Additional emails that can be "fetched" on refresh
const newMockEmails: Email[] = [
    {
        id: 5,
        sender: 'Jessica Park',
        email: 'jessica.park@company.com',
        initials: 'JP',
        subject: 'Budget Approval Request',
        preview: "Hi, I need approval for the Q1 marketing budget...",
        content: `Hi,

I need approval for the Q1 marketing budget. I've attached the detailed breakdown and projections for your review.

Can we discuss this at your earliest convenience?

Thanks,
Jessica`,
        color: '#ec4899',
        aiReply: `Hi Jessica,

I've reviewed the Q1 marketing budget breakdown and it looks reasonable. I'll approve it by end of day tomorrow after confirming with finance.

Let's schedule a quick call if you have any questions.

Best`
    },
    {
        id: 6,
        sender: 'David Liu',
        email: 'david.liu@company.com',
        initials: 'DL',
        subject: 'Security Update Required',
        preview: "Important: We need to update our security protocols...",
        content: `Team,

Important: We need to update our security protocols following the recent industry standards update. This affects all our production systems.

Please review the attached documentation and let me know if you have concerns.

Regards,
David`,
        color: '#ef4444',
        aiReply: `Hi David,

Thanks for flagging this. Security is definitely a priority. I'll review the documentation today and get back to you with any questions or concerns.

Let's make sure we have a solid implementation plan.

Best`
    }
];

export default function DashboardPage() {
    const [emails, setEmails] = useState<Email[]>(mockEmails);
    const [selectedEmailId, setSelectedEmailId] = useState(1);
    const selectedEmail = emails.find(email => email.id === selectedEmailId) || emails[0];

    const handleRefresh = async () => {
        console.log('Fetching new emails...');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add new emails if they don't already exist
        setEmails(prevEmails => {
            const existingIds = new Set(prevEmails.map(e => e.id));
            const emailsToAdd = newMockEmails.filter(e => !existingIds.has(e.id));

            if (emailsToAdd.length > 0) {
                console.log(`Fetched ${emailsToAdd.length} new email(s)`);
                return [...emailsToAdd, ...prevEmails];
            }

            console.log('No new emails');
            return prevEmails;
        });
    };

    const handleRegenerate = () => {
        console.log('Regenerating AI reply...');
        // In a real app, this would call an AI API to regenerate the reply
    };

    const handleSend = () => {
        console.log('Sending email...');
        // In a real app, this would send the email
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    emails={emails}
                    selectedEmailId={selectedEmailId}
                    onEmailSelect={setSelectedEmailId}
                    onRefresh={handleRefresh}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <EmailView
                        sender={selectedEmail.sender}
                        email={selectedEmail.email}
                        initials={selectedEmail.initials}
                        subject={selectedEmail.subject}
                        content={selectedEmail.content}
                        color={selectedEmail.color}
                    />
                    <AIReply
                        reply={selectedEmail.aiReply}
                        onRegenerate={handleRegenerate}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </div>
    );
}
