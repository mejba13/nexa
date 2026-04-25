import Link from 'next/link';
import {
  ArrowUpRight,
  Compass,
  MessageSquare,
  Music,
  PenTool,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import { api, ApiError } from '@/lib/api';
import { getAuthAware, getCurrentUserAware } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

interface UsageResponse {
  tier: string;
  monthlyTokensUsed: number;
  monthlyTokensLimit: number;
  resetsAt: string | null;
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
    blurb: 'Live market analysis, position sizing, and trade journaling.',
    sample: '"Should I scale into NVDA before Q1 earnings?"',
  },
  {
    type: 'CONTENT' as const,
    href: '/agents/content',
    label: 'Content',
    code: '02',
    Icon: PenTool,
    blurb: 'Long-form writing, editorial direction, and SEO research.',
    sample: '"Outline a 1500-word piece on Claude\'s prompt caching."',
  },
  {
    type: 'LIFE_COACH' as const,
    href: '/agents/life-coach',
    label: 'Life Coach',
    code: '03',
    Icon: Compass,
    blurb: 'Goal tracking, weekly reviews, and habit formation rituals.',
    sample: '"Plan my next 90 days around shipping Nexa v1."',
  },
  {
    type: 'MUSIC' as const,
    href: '/agents/music',
    label: 'Music',
    code: '04',
    Icon: Music,
    blurb: 'Theory, ear training, and structured practice scheduling.',
    sample: '"Build a 30-day practice plan for jazz improvisation."',
  },
];

const STARTERS = [
  'Summarise my week — what did I actually ship?',
  'Draft a launch announcement for the v0.2 milestone.',
  "Show this month's open trades + unrealised P&L.",
  'What are three habits worth dropping right now?',
];

function safeFetch<T>(path: string, token: string | null): Promise<T | null> {
  if (!token) return Promise.resolve(null);
  return api<T>(path, { token }).catch((err) => {
    if (err instanceof ApiError) return null;
    return null;
  });
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

const AGENT_NAME: Record<ConversationListItem['agentType'], string> = {
  TRADING: 'Trading',
  CONTENT: 'Content',
  LIFE_COACH: 'Life Coach',
  MUSIC: 'Music',
};

export default async function DashboardPage() {
  const [authState, user] = await Promise.all([getAuthAware(), getCurrentUserAware()]);
  const token = (await authState.getToken().catch(() => null)) ?? null;
  const first = user?.firstName ?? 'there';

  const [usage, conversations] = await Promise.all([
    safeFetch<UsageResponse>('/billing/usage', token),
    safeFetch<{ data: ConversationListItem[] }>('/conversations?limit=5', token),
  ]);

  const recent = conversations?.data ?? [];

  const tokensUsed = usage?.monthlyTokensUsed ?? 0;
  const tokensLimit = usage?.monthlyTokensLimit ?? 100_000;
  const usagePct = Math.min(100, Math.round((tokensUsed / Math.max(tokensLimit, 1)) * 100));
  const tier = usage?.tier ?? 'FREE';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen">
      <div className="bg-orange-glow pointer-events-none absolute inset-x-0 top-0 h-[480px]" />

      <div className="relative mx-auto max-w-6xl px-8 py-12">
        {/* ============================ HEADER ============================ */}
        <div className="border-brand-border/60 flex items-end justify-between border-b pb-8">
          <div>
            <div className="editorial-marker mb-3">
              <span className="text-brand-primary">§</span>
              <span>{today}</span>
              <span className="bg-brand-border-strong h-px w-10" />
              <span>Workspace</span>
            </div>
            <h1 className="font-display text-display-xs lg:text-display-sm font-bold leading-[1.05]">
              Good to see you, <span className="text-gradient-brand">{first}</span>.
            </h1>
            <p className="text-brand-muted-strong mt-3 max-w-xl text-sm">
              Pick an agent below or pick up where you left off. Everything streams in real time —
              memory, tools, and conversations are isolated per agent.
            </p>
          </div>
          <Link
            href="/billing"
            className="border-brand-border bg-brand-surface/80 hover:border-brand-primary/50 hidden items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors lg:inline-flex"
          >
            <span className="bg-brand-primary h-1.5 w-1.5 rounded-full" />
            <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
              {tier} plan
            </span>
            <ArrowUpRight className="text-brand-muted h-3.5 w-3.5" />
          </Link>
        </div>

        {/* ============================ USAGE STRIP ============================ */}
        <section className="mt-8">
          <div className="border-brand-border bg-brand-surface/60 grid grid-cols-1 gap-6 rounded-2xl border p-6 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="eyebrow mb-2">Token usage</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold tabular-nums">
                  {tokensUsed.toLocaleString()}
                </span>
                <span className="text-brand-muted text-sm">
                  / {tokensLimit.toLocaleString()} this month
                </span>
              </div>
              <div className="bg-brand-elevated relative mt-3 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-brand-primary absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="eyebrow mb-2">Plan</div>
              <div className="font-display text-2xl font-bold">{tier}</div>
              <Link
                href="/billing"
                className="link-underline text-brand-primary mt-1 inline-block text-xs"
              >
                Manage billing
              </Link>
            </div>
            <div>
              <div className="eyebrow mb-2">Resets</div>
              <div className="font-display text-2xl font-bold">
                {usage?.resetsAt
                  ? new Date(usage.resetsAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—'}
              </div>
              <p className="text-brand-muted mt-1 text-xs">Monthly cycle</p>
            </div>
          </div>
        </section>

        {/* ============================ AGENT BENTO ============================ */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="editorial-marker mb-2">
                <span className="text-brand-primary">§ 01</span>
                <span>Agents</span>
              </div>
              <h2 className="font-display text-2xl font-bold">Open a workspace.</h2>
            </div>
            <span className="tracking-editorial-wide text-brand-muted hidden font-mono text-[10px] uppercase md:inline">
              04 specialists · isolated memory
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {AGENTS.map(({ type, href, label, code, Icon, blurb, sample }) => (
              <Link
                key={type}
                href={href}
                className="border-brand-border bg-brand-surface/60 hover:border-brand-primary/50 hover:bg-brand-elevated/80 group relative overflow-hidden rounded-2xl border p-6 transition-all"
              >
                <div className="bg-orange-glow absolute -right-20 -top-20 h-40 w-40 opacity-0 transition-opacity group-hover:opacity-60" />
                <div className="relative flex items-start justify-between">
                  <div className="bg-brand-elevated ring-hairline flex h-11 w-11 items-center justify-center rounded-xl">
                    <Icon className="text-brand-primary h-5 w-5" />
                  </div>
                  <span className="tracking-editorial-wide text-brand-muted/70 font-mono text-[10px] uppercase">
                    § {code}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-bold">{label}</h3>
                <p className="text-brand-muted-strong mt-1 text-sm">{blurb}</p>
                <div className="border-brand-border/60 mt-4 border-t pt-3">
                  <p className="text-brand-muted-strong font-serif text-sm italic">{sample}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="tracking-editorial-wide text-brand-primary font-mono text-[10px] uppercase">
                    Open workspace
                  </span>
                  <ArrowUpRight className="text-brand-primary h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ============================ RECENT + STARTERS ============================ */}
        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="editorial-marker mb-2">
                  <span className="text-brand-primary">§ 02</span>
                  <span>Recent</span>
                </div>
                <h2 className="font-display text-2xl font-bold">Pick up where you left off.</h2>
              </div>
            </div>

            <div className="border-brand-border bg-brand-surface/60 rounded-2xl border">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <MessageSquare className="text-brand-muted h-6 w-6" />
                  <p className="text-brand-muted-strong mt-3 text-sm">
                    No conversations yet — open an agent above to start your first one.
                  </p>
                </div>
              ) : (
                <ul className="divide-brand-border/60 divide-y">
                  {recent.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/agents/${c.agentType.toLowerCase().replace('_', '-')}/${c.id}`}
                        className="hover:bg-brand-elevated/40 flex items-center justify-between gap-4 px-5 py-4 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-brand-text truncate text-sm">
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
                        <ArrowUpRight className="text-brand-muted h-4 w-4 shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside>
            <div className="editorial-marker mb-2">
              <span className="text-brand-primary">§ 03</span>
              <span>Starters</span>
            </div>
            <h2 className="font-display text-2xl font-bold">Try one of these.</h2>
            <ul className="mt-4 space-y-2">
              {STARTERS.map((s) => (
                <li
                  key={s}
                  className="border-brand-border/60 bg-brand-surface/40 hover:border-brand-primary/40 flex items-start gap-3 rounded-xl border p-3 text-sm transition-colors"
                >
                  <Sparkles className="text-brand-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="text-brand-muted-strong font-serif italic">{s}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}
