import { redirect } from 'next/navigation';

import type { Conversation } from '@nexa/types';

import { AgentWorkspace } from '@/components/agents/agent-workspace';
import { getAuthAware } from '@/lib/auth-server';

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
    if (data[0]) return data[0].id;
  }
  const created = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
  const { getToken } = await getAuthAware();
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const conversationId = searchParams.conv ?? (await ensureConversation(token));

  return (
    <AgentWorkspace
      agentType="LIFE_COACH"
      conversationId={conversationId}
      code="03"
      shortCode="Life Coach"
      title="Life Coach"
      tagline="Personality-aware coach that learns from your journals. Everything the agent says is grounded in words you've already written."
      toolCount={6}
      emptyHeadline="Upload your journals. Then start writing back."
      emptyHint={
        <>
          The agent only speaks in <em>your</em> voice — grounded in the words you&rsquo;ve already
          written.
        </>
      }
      emptyAvailability="06 tools · isolated memory"
      prompts={QUICK_PROMPTS}
      kbTitle="Journals"
      kbDescription="PDF, DOCX, TXT, MD — journal entries, notes, letters to yourself."
      kbEmptyHint="Upload at least one journal so the agent can speak in your voice."
    />
  );
}
