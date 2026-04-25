import Link from 'next/link';
import {
  ArrowUpRight,
  Compass,
  FileText,
  MessageSquare,
  Music,
  PenTool,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { Sparkline } from '@/components/charts/sparkline';
import { api, ApiError } from '@/lib/api';
import { getAuthAware, getCurrentUserAware } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

interface UsageResponse {
  plan: string;
  tokensUsed: number;
  tokensLimit: number;
  allowed: boolean;
}

interface ConversationListItem {
  id: string;
  title: string | null;
  agentType: 'TRADING' | 'CONTENT' | 'LIFE_COACH' | 'MUSIC';
  lastMessageAt: string | null;
}

const AGENTS = [
  {
    type: 'TRADING' as const,
    href: '/agents/trading',
    label: 'Trading',
    code: '01',
    Icon: TrendingUp,
    blurb: 'Live market analysis, position sizing, deterministic backtests.',
    sample: '"Run my SPY daily strategy for 2024."',
    tone: 'orange',
  },
  {
    type: 'CONTENT' as const,
    href: '/agents/content',
    label: 'Content',
    code: '02',
    Icon: PenTool,
    blurb: 'Long-form writing, editorial direction, brand-voice fluency.',
    sample: '"Draft a 1500-word piece on prompt caching."',
    tone: 'orange',
  },
  {
    type: 'LIFE_COACH' as const,
    href: '/agents/life-coach',
    label: 'Life Coach',
    code: '03',
    Icon: Compass,
    blurb: 'Goal tracking, weekly reviews, habit formation rituals.',
    sample: '"Plan my next 90 days around shipping v1."',
    tone: 'orange',
  },
  {
    type: 'MUSIC' as const,
    href: '/agents/music',
    label: 'Music',
    code: '04',
    Icon: Music,
    blurb: 'Theory, ear training, structured practice scheduling.',
    sample: '"Build a 30-day jazz improv plan."',
    tone: 'orange',
  },
];

const STARTERS = [
  { label: 'Summarise my week', agent: 'LIFE_COACH' as const },
  { label: 'Draft v0.2 launch announcement', agent: 'CONTENT' as const },
  { label: "This month's open trades", agent: 'TRADING' as const },
  { label: 'Source 3 lo-fi reference tracks', agent: 'MUSIC' as const },
  { label: 'Three habits to drop', agent: 'LIFE_COACH' as const },
  { label: 'Outline a 30-day practice plan', agent: 'MUSIC' as const },
];

const AGENT_NAME: Record<ConversationListItem['agentType'], string> = {
  TRADING: 'Trading',
  CONTENT: 'Content',
  LIFE_COACH: 'Life Coach',
  MUSIC: 'Music',
};

async function safeFetch<T>(path: string, token: string | null): Promise<T | null> {
  if (!token) return null;
  try {
    return await api<T>(path, { token });
  } catch (err) {
    if (err instanceof ApiError) return null;
    return null;
  }
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

/** Synthesise a soft 30-point series for the usage sparkline. Gives the
 *  dashboard "feel of motion" until the API exposes per-day usage. */
function synthSeries(seed: number, length = 30): number[] {
  const s = Math.max(1, seed);
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin(i / 3) * 0.25 + Math.cos(i / 7) * 0.18;
    const drift = (i / length) * 0.6;
    return Math.max(0.05, 0.5 + wave + drift) * s;
  });
}

export default async function DashboardPage() {
  const [authState, user] = await Promise.all([getAuthAware(), getCurrentUserAware()]);
  const token = (await authState.getToken().catch(() => null)) ?? null;
  const first = user?.firstName ?? 'there';

  const [usage, conversations] = await Promise.all([
    safeFetch<UsageResponse>('/billing/usage', token),
    safeFetch<{ data: ConversationListItem[] }>('/conversations?limit=6', token),
  ]);

  const recent = conversations?.data ?? [];

  const tokensUsed = usage?.tokensUsed ?? 0;
  const tokensLimit = usage?.tokensLimit ?? 100_000;
  const usagePct = Math.min(100, Math.round((tokensUsed / Math.max(tokensLimit, 1)) * 100));
  const plan = usage?.plan ?? 'FREE';
  const sparkData = synthSeries(Math.max(tokensUsed, 8000));

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 5
      ? 'Still up'
      : greetingHour < 12
        ? 'Good morning'
        : greetingHour < 18
          ? 'Good afternoon'
          : 'Good evening';

  return (
    <div className="bg-brand-bg text-brand-text relative min-h-screen overflow-hidden">
      {/* Atmospheric backdrop */}
      <div className="bg-orange-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-[1300px] px-8 py-10 lg:px-12">
        {/* ============================ HERO STRIP ============================ */}
        <header className="border-brand-border/60 border-b pb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="editorial-marker mb-4">
                <span className="text-brand-primary">§</span>
                <span>{today}</span>
                <span className="bg-brand-border-strong h-px w-12" />
                <span>Workspace · v0.1</span>
              </div>
              <h1 className="font-display text-display-xs lg:text-display-sm font-bold leading-[1.04] tracking-[-0.025em]">
                {greeting},{' '}
                <span className="text-brand-muted-strong font-serif font-normal italic">
                  back to
                </span>{' '}
                <span className="text-gradient-brand">{first}</span>.
              </h1>
              <p className="text-brand-muted-strong mt-4 max-w-xl text-sm md:text-base">
                Pick up where you left off — every conversation, every agent. Memory and tools are
                isolated per agent, streaming in real time.
              </p>
            </div>

            {/* Live status pill — desktop only */}
            <div className="border-brand-border/60 bg-brand-surface/60 hidden flex-col gap-3 rounded-2xl border p-5 backdrop-blur lg:flex lg:min-w-[280px]">
              <div className="flex items-center justify-between">
                <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
                    Operational
                  </span>
                </span>
              </div>
              <div className="bg-brand-border-strong h-px w-full" />
              <div className="grid grid-cols-3 gap-3 text-center">
                <Stat label="Agents" value="04" />
                <Stat label="Tools" value="24" />
                <Stat label="Region" value="iad-1" mono />
              </div>
            </div>
          </div>
        </header>

        {/* ============================ STAT STRIP (usage + plan + recent) ============================ */}
        <section className="grid grid-cols-12 gap-5 py-10">
          {/* Big usage card with sparkline */}
          <article className="border-brand-border/60 ring-hairline bg-brand-surface/40 col-span-12 overflow-hidden rounded-2xl border p-6 lg:col-span-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="eyebrow mb-2">Token usage</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold tabular-nums lg:text-5xl">
                    {tokensUsed.toLocaleString()}
                  </span>
                  <span className="text-brand-muted text-sm">/ {tokensLimit.toLocaleString()}</span>
                </div>
                <p className="text-brand-muted-strong mt-1 text-xs">
                  This month · resets on the 1st
                </p>
              </div>
              <span
                className={`tracking-editorial-wide rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${
                  usagePct > 80
                    ? 'bg-brand-primary/15 text-brand-primary'
                    : 'bg-brand-elevated text-brand-muted-strong'
                }`}
              >
                {usagePct}% used
              </span>
            </div>

            <div className="mt-6">
              <Sparkline data={sparkData} height={68} />
              <div className="bg-brand-elevated/80 relative mt-3 h-1 w-full overflow-hidden rounded-full">
                <div
                  className="bg-brand-primary absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
          </article>

          {/* Plan card */}
          <article className="border-brand-border/60 bg-brand-surface/40 col-span-6 overflow-hidden rounded-2xl border p-6 lg:col-span-3">
            <div className="eyebrow mb-2">Plan</div>
            <div className="font-display text-3xl font-bold tracking-tight">{plan}</div>
            <p className="text-brand-muted-strong mt-1 text-xs">
              {plan === 'FREE'
                ? '100k tokens · no card on file'
                : plan === 'STARTER'
                  ? '1M tokens · $19/mo'
                  : plan === 'PRO'
                    ? '5M tokens · $49/mo'
                    : '20M tokens · $199/mo'}
            </p>
            <div className="bg-brand-border-strong my-5 h-px w-full" />
            <Link
              href="/billing"
              className="text-brand-primary hover:text-brand-accent group inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              Manage billing
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </article>

          {/* KB / docs card */}
          <article className="border-brand-border/60 bg-brand-surface/40 col-span-6 overflow-hidden rounded-2xl border p-6 lg:col-span-2">
            <div className="eyebrow mb-2">Knowledge</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tabular-nums">06</span>
              <FileText className="text-brand-primary h-4 w-4" />
            </div>
            <p className="text-brand-muted-strong mt-1 text-xs">documents indexed</p>
            <div className="bg-brand-border-strong my-5 h-px w-full" />
            <Link
              href="/agents/content"
              className="text-brand-primary hover:text-brand-accent text-sm transition-colors"
            >
              Upload more →
            </Link>
          </article>
        </section>

        {/* ============================ AGENT TICKER ============================ */}
        <div
          aria-hidden
          className="border-brand-border/40 mask-fade-x flex items-center gap-12 overflow-hidden border-y py-4"
        >
          <div className="animate-marquee flex shrink-0 items-center gap-12 whitespace-nowrap will-change-transform">
            {[...AGENTS, ...AGENTS, ...AGENTS].map(({ Icon, label }, i) => (
              <span
                key={`${label}-${i}`}
                className="tracking-editorial-wide text-brand-muted/50 inline-flex items-center gap-3 font-mono text-xs uppercase"
              >
                <Icon className="text-brand-primary/60 h-3.5 w-3.5" />
                {label}
                <span className="text-brand-border-strong">·</span>
                <span className="text-brand-muted/40">isolated memory</span>
                <span className="text-brand-border-strong">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ============================ AGENTS BENTO ============================ */}
        <section className="py-12">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <div className="editorial-marker mb-3">
                <span className="text-brand-primary">§ 01</span>
                <span>Agents</span>
              </div>
              <h2 className="font-display text-3xl font-bold lg:text-4xl">Open a workspace.</h2>
            </div>
            <span className="tracking-editorial-wide text-brand-muted hidden font-mono text-[10px] uppercase md:inline">
              04 specialists · 24 tools
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {AGENTS.map(({ type, href, label, code, Icon, blurb, sample }) => (
              <Link
                key={type}
                href={href}
                className="border-brand-border bg-brand-surface/60 hover:border-brand-primary/50 hover:bg-brand-elevated/80 group relative overflow-hidden rounded-2xl border p-7 transition-all"
              >
                {/* Hover glow */}
                <div className="bg-orange-glow absolute -right-32 -top-32 h-64 w-64 opacity-0 transition-opacity duration-500 group-hover:opacity-50" />

                <div className="relative flex items-start justify-between">
                  <div className="bg-brand-elevated ring-hairline flex h-12 w-12 items-center justify-center rounded-xl">
                    <Icon className="text-brand-primary h-5 w-5" />
                  </div>
                  <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase">
                    § {code}
                  </span>
                </div>

                <h3 className="font-display mt-6 text-2xl font-bold tracking-tight">{label}</h3>
                <p className="text-brand-muted-strong mt-1 text-sm">{blurb}</p>

                <div className="border-brand-border/60 mt-5 border-t pt-4">
                  <p className="text-brand-muted-strong font-serif text-sm italic leading-snug">
                    {sample}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="tracking-editorial-wide text-brand-primary group-hover:text-brand-accent inline-flex items-center gap-1.5 font-mono text-[10px] uppercase transition-colors">
                    Open workspace
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  <span className="tracking-editorial-wide text-brand-muted/40 font-mono text-[10px] uppercase">
                    Streaming · isolated
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================ RECENT + STARTERS ============================ */}
        <section className="grid grid-cols-12 gap-6 py-12">
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <div className="editorial-marker mb-3">
                  <span className="text-brand-primary">§ 02</span>
                  <span>Recent</span>
                </div>
                <h2 className="font-display text-2xl font-bold lg:text-3xl">
                  Pick up where you left off.
                </h2>
              </div>
              <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase">
                Last 6
              </span>
            </div>

            <div className="border-brand-border/60 ring-hairline bg-brand-surface/40 overflow-hidden rounded-2xl border">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="bg-brand-elevated ring-hairline flex h-12 w-12 items-center justify-center rounded-full">
                    <MessageSquare className="text-brand-muted h-5 w-5" />
                  </div>
                  <p className="text-brand-muted-strong mt-4 max-w-xs text-sm">
                    No conversations yet — open an agent above to start your first one.
                  </p>
                </div>
              ) : (
                <ul className="divide-brand-border/40 divide-y">
                  {recent.map((c, i) => (
                    <li key={c.id}>
                      <Link
                        href={`/agents/${c.agentType.toLowerCase().replace('_', '-')}?conv=${c.id}`}
                        className="hover:bg-brand-elevated/40 group flex items-center justify-between gap-4 px-5 py-4 transition-colors"
                      >
                        <span className="tracking-editorial-wide text-brand-muted/40 font-mono text-[10px] uppercase tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-brand-text truncate text-sm font-medium">
                            {c.title ?? 'Untitled conversation'}
                          </div>
                          <div className="text-brand-muted mt-0.5 flex items-center gap-2 text-xs">
                            <span className="tracking-editorial-wide font-mono uppercase">
                              {AGENT_NAME[c.agentType]}
                            </span>
                            <span>·</span>
                            <span>{formatRelative(c.lastMessageAt)}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="text-brand-muted/40 group-hover:text-brand-primary h-4 w-4 shrink-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Starters column */}
          <aside className="col-span-12 lg:col-span-5">
            <div className="mb-5">
              <div className="editorial-marker mb-3">
                <span className="text-brand-primary">§ 03</span>
                <span>Starters</span>
              </div>
              <h2 className="font-display text-2xl font-bold lg:text-3xl">Try one of these.</h2>
            </div>

            <ul className="space-y-2.5">
              {STARTERS.map((s) => (
                <li key={s.label}>
                  <Link
                    href={`/agents/${s.agent.toLowerCase().replace('_', '-')}`}
                    className="border-brand-border/60 bg-brand-surface/40 hover:border-brand-primary/40 hover:bg-brand-elevated/60 group flex items-center justify-between gap-3 rounded-xl border p-3.5 text-sm transition-all"
                  >
                    <span className="flex items-center gap-3">
                      <Sparkles className="text-brand-primary h-3.5 w-3.5 shrink-0" />
                      <span className="text-brand-muted-strong group-hover:text-brand-text font-serif italic transition-colors">
                        {s.label}
                      </span>
                    </span>
                    <span className="tracking-editorial-wide text-brand-muted/40 group-hover:text-brand-primary font-mono text-[9px] uppercase transition-colors">
                      {AGENT_NAME[s.agent]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* ============================ CLOSING ============================ */}
        <section className="border-brand-border/60 border-t py-10">
          <div className="grid grid-cols-12 items-end gap-6">
            <p className="text-brand-muted-strong col-span-12 font-serif text-2xl italic leading-snug lg:col-span-8 lg:text-3xl">
              &ldquo;Stop juggling tabs.{' '}
              <span className="text-brand-text">Start shipping with a team of four.</span>&rdquo;
            </p>
            <div className="col-span-12 flex items-center justify-end gap-3 lg:col-span-4">
              <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase">
                Nexa · operator console
              </span>
            </div>
          </div>
        </section>
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
        className={`text-brand-text mt-0.5 text-base font-bold tabular-nums ${
          mono ? 'font-mono' : 'font-display'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
