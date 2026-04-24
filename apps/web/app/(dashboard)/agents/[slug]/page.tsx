import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

import { AGENT_METADATA, AGENT_SLUG_TO_TYPE, type Conversation } from '@nexa/types';

import { ChatPanel } from '@/components/chat/chat-panel';

interface Props {
  params: { slug: string };
  searchParams: { conv?: string };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function ensureConversation(token: string, agentType: string): Promise<string> {
  const list = await fetch(`${API}/conversations?agentType=${agentType}`, {
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
    body: JSON.stringify({ agentType }),
  });
  const row = (await created.json()) as { id: string };
  return row.id;
}

export default async function AgentWorkspacePage({ params, searchParams }: Props) {
  const agentType = AGENT_SLUG_TO_TYPE[params.slug];
  if (!agentType) notFound();
  const meta = AGENT_METADATA[agentType];

  const { getToken } = auth();
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const conversationId = searchParams.conv ?? (await ensureConversation(token, agentType));

  return (
    <div className="flex h-screen flex-col">
      <header className="border-brand-border/60 border-b px-8 py-5">
        <div className="flex items-center gap-4">
          <span
            className="bg-brand-elevated inline-flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs"
            style={{ color: meta.accentColor }}
          >
            {agentType.slice(0, 2)}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold capitalize">
              {params.slug.replace('-', ' ')}
            </h1>
            <p className="text-brand-muted text-sm">{meta.tagline}</p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatPanel
          conversationId={conversationId}
          emptyState={
            <div>
              <p className="text-brand-text text-lg">Ready when you are.</p>
              <p className="text-brand-muted mt-1 text-sm">{meta.tagline}</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
