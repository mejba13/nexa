'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Compass, Music, PenTool, Sparkles, TrendingUp } from 'lucide-react';

import type { AgentType } from '@nexa/types';

import { ChatPanel } from '@/components/chat/chat-panel';
import { EmptyChatState } from '@/components/chat/empty-chat-state';
import { KnowledgeBasePanel } from '@/components/knowledge/knowledge-base-panel';

const AGENT_ICON: Record<AgentType, LucideIcon> = {
  TRADING: TrendingUp,
  CONTENT: PenTool,
  LIFE_COACH: Compass,
  MUSIC: Music,
};

interface AgentWorkspaceProps {
  agentType: AgentType;
  conversationId: string;

  // Header copy
  code: string;
  shortCode: string;
  title: string;
  tagline: string;
  toolCount: number;

  // Empty-state copy
  emptyHeadline: string;
  emptyHint: React.ReactNode;
  emptyAvailability?: string;

  // Quick prompts
  prompts: ReadonlyArray<string>;

  // Knowledge panel copy
  kbTitle: string;
  kbDescription: string;
  kbEmptyHint: string;
  /** File extensions accepted in the upload picker — comma-separated. */
  kbAccept?: string;
}

/**
 * Shared editorial workspace shell for the four agent pages
 * (Trading is bespoke). Lays out a three-band frame:
 *
 *   ┌───────────────────────────────────────────────────┐
 *   │  HEADER — agent identity strip with status pulse  │
 *   ├──────────────────────────────────────┬────────────┤
 *   │                                      │            │
 *   │            CHAT PANEL                │  KB PANEL  │
 *   │   (empty-state on first visit)       │   (right)  │
 *   │                                      │            │
 *   └──────────────────────────────────────┴────────────┘
 *
 * The header doubles as orientation: § code + agent icon tile + display
 * title + serif tagline + a live status pulse with tool count. The empty
 * state lives inside ChatPanel (passed via `emptyState`) so it disappears
 * the moment the first message lands.
 */
export function AgentWorkspace(props: AgentWorkspaceProps) {
  const {
    agentType,
    conversationId,
    code,
    shortCode,
    title,
    tagline,
    toolCount,
    emptyHeadline,
    emptyHint,
    emptyAvailability,
    prompts,
    kbTitle,
    kbDescription,
    kbEmptyHint,
    kbAccept,
  } = props;
  const Icon = AGENT_ICON[agentType];

  return (
    <div className="bg-brand-bg text-brand-text relative flex h-screen flex-col overflow-hidden">
      {/* Atmospheric backdrop */}
      <div className="bg-orange-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" />

      {/* ============================ HEADER ============================ */}
      <header className="border-brand-border/60 relative border-b">
        <div className="mx-auto max-w-[1500px] px-8 py-6 lg:px-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex min-w-0 items-start gap-5">
              {/* Agent tile */}
              <div className="bg-brand-elevated ring-hairline-strong relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                <div className="bg-orange-glow absolute inset-0 opacity-60" />
                <Icon className="text-brand-primary relative h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="editorial-marker mb-2">
                  <span className="text-brand-primary">§ {code}</span>
                  <span className="bg-brand-border-strong h-px w-8" />
                  <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase tabular-nums">
                    {shortCode}
                  </span>
                </div>
                <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.02em] lg:text-4xl">
                  {title}
                </h1>
                <p className="text-brand-muted-strong mt-2 max-w-2xl text-sm md:text-base">
                  {tagline}
                </p>
              </div>
            </div>

            {/* Status pill */}
            <div className="border-brand-border/60 bg-brand-surface/60 ring-hairline hidden flex-col gap-2.5 rounded-2xl border px-4 py-3 backdrop-blur lg:flex lg:min-w-[240px]">
              <div className="flex items-center justify-between">
                <span className="tracking-editorial-wide text-brand-muted/70 font-mono text-[9px] uppercase">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
                    Streaming-ready
                  </span>
                </span>
              </div>
              <div className="bg-brand-border-strong h-px w-full" />
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Tools" value={String(toolCount).padStart(2, '0')} />
                <Stat label="Memory" value="iso" mono />
                <Stat label="Stream" value="SSE" mono />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============================ BODY ============================ */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* CHAT (centre) */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatPanel
            conversationId={conversationId}
            emptyState={
              <EmptyChatState
                Icon={Icon}
                code={code}
                title={emptyHeadline}
                description={emptyHint}
                availability={emptyAvailability}
                prompts={prompts}
              />
            }
          />
        </div>

        {/* KNOWLEDGE BASE (right rail) */}
        <aside className="border-brand-border/60 bg-brand-surface/20 hidden w-[340px] shrink-0 overflow-y-auto border-l p-6 backdrop-blur lg:block">
          <KnowledgeBasePanel
            agentType={agentType}
            title={kbTitle}
            description={kbDescription}
            emptyHint={kbEmptyHint}
            accept={kbAccept}
          />

          {/* RAG flow recap */}
          <div className="border-brand-border/60 bg-brand-bg/50 mt-8 rounded-2xl border p-4">
            <div className="editorial-marker mb-3">
              <span className="text-brand-primary">§ Flow</span>
              <span>How grounding works</span>
            </div>
            <ol className="space-y-2.5 text-xs">
              <FlowStep n="01" label="Upload" body="PDF · DOCX · MD · TXT chunked at 512 tokens." />
              <FlowStep n="02" label="Embed" body="text-embedding-3-small · 1536 dim · pgvector." />
              <FlowStep n="03" label="Retrieve" body="Top-K filtered by your userId + agent." />
              <FlowStep n="04" label="Ground" body="Chunks injected into Claude's context." />
            </ol>
            <a
              href="/about"
              className="text-brand-primary hover:text-brand-accent tracking-editorial-wide mt-4 inline-flex items-center gap-1 font-mono text-[10px] uppercase"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Read the architecture
              <ArrowUpRight className="h-2.5 w-2.5" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="tracking-editorial-wide text-brand-muted/60 font-mono text-[9px] uppercase">
        {label}
      </div>
      <div
        className={`text-brand-text mt-0.5 text-sm font-bold tabular-nums ${
          mono ? 'font-mono' : 'font-display'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FlowStep({ n, label, body }: { n: string; label: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="bg-brand-elevated text-brand-primary tracking-editorial-wide inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[9px] tabular-nums">
        {n}
      </span>
      <div className="min-w-0">
        <span className="text-brand-text font-medium">{label}</span>
        <span className="text-brand-muted-strong"> · {body}</span>
      </div>
    </li>
  );
}
