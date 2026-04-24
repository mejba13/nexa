import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import type { Conversation } from '@nexa/types';

import { ChatPanel } from '@/components/chat/chat-panel';
import { KnowledgeBasePanel } from '@/components/knowledge/knowledge-base-panel';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const QUICK_PROMPTS = [
  'Draft a LinkedIn post about our latest case study in our brand voice.',
  'Plan a 4-week content calendar for Twitter, LinkedIn, and Instagram.',
  'Write a 1,500-word SEO blog post on [topic] with our voice.',
  'Give me a 30s Reels script with hook, payoff, and CTA.',
];

async function ensureConversation(token: string): Promise<string> {
  const list = await fetch(`${API}/conversations?agentType=CONTENT`, {
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
    body: JSON.stringify({ agentType: 'CONTENT' }),
  });
  const row = (await created.json()) as { id: string };
  return row.id;
}

export default async function ContentWorkspace({
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
            CO
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold">Content Strategist</h1>
            <p className="text-brand-muted text-sm">
              Brand-voice-trained content across every channel. Upload brand docs → the agent
              grounds drafts in your voice via RAG.
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
                  <p className="text-brand-text text-lg">
                    Upload your brand guide, then ask for copy.
                  </p>
                  <p className="text-brand-muted mt-1 text-sm">
                    Every draft will call{' '}
                    <code className="text-brand-primary">query_brand_voice</code> first.
                  </p>
                </div>
              }
            />
          </div>
        </div>

        <aside className="border-brand-border/60 hidden w-80 shrink-0 overflow-y-auto border-l p-6 lg:block">
          <KnowledgeBasePanel
            agentType="CONTENT"
            title="Brand voice"
            description="PDF, DOCX, TXT, MD — style guides, past copy, voice docs."
            emptyHint="Upload a brand guide to ground every draft in your voice."
          />
        </aside>
      </div>
    </div>
  );
}
