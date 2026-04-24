import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import type { Conversation } from '@nexa/types';

import { ChatPanel } from '@/components/chat/chat-panel';
import { KnowledgeBasePanel } from '@/components/knowledge/knowledge-base-panel';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const QUICK_PROMPTS = [
  'Given my recent journals, what themes keep coming up?',
  'I have a hard decision — walk me through the decision framework.',
  'Write me a reflection on where I am right now, in my voice.',
  'What was I writing about this time last year?',
];

async function ensureConversation(token: string): Promise<string> {
  const list = await fetch(`${API}/conversations?agentType=LIFE_COACH`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (list.ok) {
    const data = (await list.json()) as Conversation[];
    if (data.length) return data[0].id;
  }
  const created = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ agentType: 'LIFE_COACH' }),
  });
  const row = (await created.json()) as { id: string };
  return row.id;
}

export default async function LifeCoachWorkspace({
  searchParams,
}: {
  searchParams: { conv?: string };
}) {
  const { getToken } = auth();
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const conversationId = searchParams.conv ?? (await ensureConversation(token));

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="border-brand-border/60 border-b px-8 py-5">
        <div className="flex items-center gap-4">
          <span className="bg-brand-elevated text-brand-primary inline-flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs">
            LC
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold">Life Coach</h1>
            <p className="text-brand-muted text-sm">
              Personality-aware coach that learns from your journals. Everything the agent says is
              grounded in words you&apos;ve already written.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-brand-border/40 border-b px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <span
                  key={p}
                  className="border-brand-border bg-brand-elevated text-brand-muted cursor-default rounded-full border px-3 py-1 text-xs"
                  title="Paste into chat"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              conversationId={conversationId}
              emptyState={
                <div>
                  <p className="text-brand-text text-lg">Upload your journals to begin.</p>
                  <p className="text-brand-muted mt-1 text-sm">
                    The agent only speaks in your own voice, grounded in what you&apos;ve already
                    written.
                  </p>
                </div>
              }
            />
          </div>
        </div>

        <aside className="border-brand-border/60 hidden w-80 shrink-0 overflow-y-auto border-l p-6 lg:block">
          <KnowledgeBasePanel
            agentType="LIFE_COACH"
            title="Journals"
            description="PDF, DOCX, TXT, MD — journal entries, notes, letters to yourself."
            emptyHint="Your journals are end-to-end private to your account. Upload to begin."
          />
        </aside>
      </div>
    </div>
  );
}
