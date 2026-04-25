import { redirect } from 'next/navigation';

import type { Conversation } from '@nexa/types';

import { AgentWorkspace } from '@/components/agents/agent-workspace';
import { getAuthAware } from '@/lib/auth-server';

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
    if (data[0]) return data[0].id;
  }
  const created = await fetch(`${API}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
  const { getToken } = await getAuthAware();
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const conversationId = searchParams.conv ?? (await ensureConversation(token));

  return (
    <AgentWorkspace
      agentType="CONTENT"
      conversationId={conversationId}
      code="02"
      shortCode="Content"
      title="Content Strategist"
      tagline="Brand-voice-trained content across every channel. Upload brand docs and the agent grounds drafts in your voice via RAG."
      toolCount={4}
      emptyHeadline="Upload a brand guide. Then ask for copy."
      emptyHint={
        <>
          Every draft calls{' '}
          <span className="text-brand-primary font-mono not-italic">query_brand_voice</span> first
          so nothing reads like generic AI output.
        </>
      }
      emptyAvailability="04 tools · streaming"
      prompts={QUICK_PROMPTS}
      kbTitle="Brand voice"
      kbDescription="PDF, DOCX, TXT, MD — style guides, past copy, voice docs."
      kbEmptyHint="Upload a brand guide to ground every draft in your voice."
    />
  );
}
