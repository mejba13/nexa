import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import type { Conversation } from '@nexa/types';

import { ChatPanel } from '@/components/chat/chat-panel';
import { KnowledgeBasePanel } from '@/components/knowledge/knowledge-base-panel';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const QUICK_PROMPTS = [
  'Find reference tracks for a lo-fi hiphop beat around 80 BPM.',
  'Suggest an instrument palette and arrangement for Afrobeats.',
  'Write a verse-chorus lyric scaffold for a melancholic pop song about change.',
  'Find rain-and-thunder texture samples for a lo-fi intro.',
];

async function ensureConversation(token: string): Promise<string> {
  const list = await fetch(`${API}/conversations?agentType=MUSIC`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (list.ok) {
    const data = (await list.json()) as Conversation[];
    if (data[0]) return data[0].id;
  }
  const created = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ agentType: 'MUSIC' }),
  });
  const row = (await created.json()) as { id: string };
  return row.id;
}

export default async function MusicWorkspace({
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
            MU
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold">Music Producer</h1>
            <p className="text-brand-muted text-sm">
              Creative collaborator for references, instruments, arrangements, samples, and mixing.
              Spotify + Freesound real-API integrations when configured; deterministic palettes
              otherwise.
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
                  <p className="text-brand-text text-lg">What are we making?</p>
                  <p className="text-brand-muted mt-1 text-sm">
                    Describe the vibe, the tempo, or the reference and the agent will pull real
                    tracks, palettes, and samples.
                  </p>
                </div>
              }
            />
          </div>
        </div>

        <aside className="border-brand-border/60 hidden w-80 shrink-0 overflow-y-auto border-l p-6 lg:block">
          <KnowledgeBasePanel
            agentType="MUSIC"
            title="Mixing notes"
            description="PDF, DOCX, TXT, MD — mixing tutorials, reference notes, preset docs."
            emptyHint="Upload mixing references to ground mixing_guidance in your own knowledge."
          />
        </aside>
      </div>
    </div>
  );
}
