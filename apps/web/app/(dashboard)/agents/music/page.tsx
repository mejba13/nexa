import { redirect } from 'next/navigation';

import type { Conversation } from '@nexa/types';

import { AgentWorkspace } from '@/components/agents/agent-workspace';
import { getAuthAware } from '@/lib/auth-server';

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
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
  const { getToken } = await getAuthAware();
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const conversationId = searchParams.conv ?? (await ensureConversation(token));

  return (
    <AgentWorkspace
      agentType="MUSIC"
      conversationId={conversationId}
      code="04"
      shortCode="Music"
      title="Music Producer"
      tagline="Creative collaborator for references, instruments, arrangements, samples, and mixing. Spotify + Freesound real-API integrations when configured; deterministic palettes otherwise."
      toolCount={6}
      emptyHeadline="Tell me the vibe. I'll bring the palette."
      emptyHint={
        <>
          Describe a tempo, a key, a mood — the agent pulls real reference tracks, palettes, and
          royalty-free samples.
        </>
      }
      emptyAvailability="06 tools · Spotify + Freesound"
      prompts={QUICK_PROMPTS}
      kbTitle="Mixing notes"
      kbDescription="PDF, DOCX, TXT, MD — mixing tutorials, reference notes, preset docs."
      kbEmptyHint="Drop in your mixing notes and the agent grounds advice in your own approach."
    />
  );
}
