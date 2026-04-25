'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, DollarSign, Search, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

import { Sparkline } from '@/components/charts/sparkline';
import { adminApi } from '@/lib/admin';
import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { cn } from '@/lib/utils';

const numFmt = new Intl.NumberFormat('en-US');
const usdFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const AGENT_LABEL: Record<string, string> = {
  TRADING: 'Trading',
  CONTENT: 'Content',
  LIFE_COACH: 'Life Coach',
  MUSIC: 'Music',
};

function synthSeries(seed: number, length = 30): number[] {
  const s = Math.max(1, seed);
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin(i / 3) * 0.25 + Math.cos(i / 5) * 0.18;
    const drift = (i / length) * 0.5;
    return Math.max(0.05, 0.5 + wave + drift) * s;
  });
}

export default function AdminPage() {
  const { getToken } = useNexaAuth();
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return adminApi.stats(token);
    },
  });

  const { data: agentUsage } = useQuery({
    queryKey: ['admin', 'agents', 'usage'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return adminApi.agentUsage(token);
    },
  });

  const { data: users } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return adminApi.listUsers(token, search || undefined);
    },
  });

  const totalTokens = stats ? stats.tokensInput30d + stats.tokensOutput30d : 0;
  const sparkData = synthSeries(Math.max(totalTokens, 1));
  const maxAgentCalls = Math.max(1, ...(agentUsage?.map((a) => a.calls) ?? []));

  return (
    <div className="bg-brand-bg text-brand-text relative min-h-screen overflow-hidden">
      {/* Atmospheric backdrop */}
      <div className="bg-orange-glow pointer-events-none absolute inset-x-0 top-0 h-[480px]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-[1400px] px-8 py-10 lg:px-12">
        {/* ============================ HEADER ============================ */}
        <header className="border-brand-border/60 border-b pb-10">
          <div className="editorial-marker mb-4">
            <span className="text-brand-primary">§ Admin</span>
            <span className="bg-brand-border-strong h-px w-12" />
            <span>Operator console</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-display-xs lg:text-display-sm font-bold leading-[1.04] tracking-[-0.025em]">
                Platform{' '}
                <span className="text-brand-muted-strong font-serif font-normal italic">
                  signal —
                </span>{' '}
                <span className="text-gradient-brand">last 30 days</span>.
              </h1>
              <p className="text-brand-muted-strong mt-4 max-w-xl text-sm md:text-base">
                Users, conversations, agent usage, cost. Refreshes on demand. Per-user data lives
                inside their tenant — RLS-isolated, never aggregated unless you ask here.
              </p>
            </div>
            <div className="border-brand-border/60 bg-brand-surface/60 hidden items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur lg:inline-flex">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
                Live · refreshes on focus
              </span>
            </div>
          </div>
        </header>

        {/* ============================ STAT STRIP ============================ */}
        <section className="grid grid-cols-2 gap-4 py-10 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total users"
            value={stats ? numFmt.format(stats.totalUsers) : '—'}
            sub={stats ? `${stats.paidUsers} paid` : '—'}
          />
          <StatCard
            icon={Activity}
            label="DAU (approx)"
            value={stats ? numFmt.format(stats.dauApprox) : '—'}
            sub="last 24h"
          />
          <StatCard
            icon={BarChart3}
            label="Conversations"
            value={stats ? numFmt.format(stats.conversations30d) : '—'}
            sub="rolling 30d"
          />
          <StatCard
            icon={DollarSign}
            label="Cost (30d)"
            value={stats ? usdFmt.format(Number(stats.costUsd30d)) : '—'}
            sub={stats ? `${numFmt.format(totalTokens)} tokens` : '—'}
            highlight
          />
        </section>

        {/* ============================ TOKENS CHART ============================ */}
        <section className="py-6">
          <article className="border-brand-border/60 ring-hairline bg-brand-surface/40 overflow-hidden rounded-2xl border p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow mb-2">Token throughput</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold tabular-nums lg:text-5xl">
                    {stats ? numFmt.format(totalTokens) : '—'}
                  </span>
                  <span className="text-brand-muted text-sm">tokens · last 30 days</span>
                </div>
                <p className="text-brand-muted-strong mt-1 text-xs">
                  Synthetic shape until the per-day endpoint ships in v0.2.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Input" value={stats ? numFmt.format(stats.tokensInput30d) : '—'} />
                <Stat label="Output" value={stats ? numFmt.format(stats.tokensOutput30d) : '—'} />
              </div>
            </div>
            <div className="mt-6">
              <Sparkline data={sparkData} height={120} />
            </div>
          </article>
        </section>

        {/* ============================ AGENT USAGE ============================ */}
        <section className="py-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="editorial-marker mb-3">
                <span className="text-brand-primary">§ 01</span>
                <span>Agents</span>
              </div>
              <h2 className="font-display text-3xl font-bold lg:text-4xl">Where the spend goes.</h2>
            </div>
            <span className="tracking-editorial-wide text-brand-muted/60 hidden font-mono text-[10px] uppercase md:inline">
              Calls · tokens · USD · 30d
            </span>
          </div>

          <div className="border-brand-border/60 ring-hairline bg-brand-surface/40 overflow-hidden rounded-2xl border">
            <div className="border-brand-border/40 bg-brand-elevated/30 grid grid-cols-12 border-b px-6 py-3">
              <span className="tracking-editorial-wide text-brand-muted col-span-4 font-mono text-[10px] uppercase">
                Agent
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-2 text-right font-mono text-[10px] uppercase">
                Calls
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-2 text-right font-mono text-[10px] uppercase">
                Tokens in
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-2 text-right font-mono text-[10px] uppercase">
                Tokens out
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-2 text-right font-mono text-[10px] uppercase">
                Cost USD
              </span>
            </div>
            {agentUsage && agentUsage.length > 0 ? (
              <ul className="divide-brand-border/30 divide-y">
                {agentUsage.map((row, i) => {
                  const pct = (row.calls / maxAgentCalls) * 100;
                  return (
                    <li key={row.agentType}>
                      <div className="hover:bg-brand-elevated/30 relative grid grid-cols-12 items-center px-6 py-4 transition-colors">
                        <div
                          className="bg-brand-primary/10 absolute inset-y-0 left-0 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative col-span-4 flex items-center gap-3">
                          <span className="tracking-editorial-wide text-brand-muted/40 font-mono text-[10px] uppercase tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-brand-text font-medium">
                            {AGENT_LABEL[row.agentType] ?? row.agentType}
                          </span>
                        </div>
                        <span className="relative col-span-2 text-right text-sm tabular-nums">
                          {numFmt.format(row.calls)}
                        </span>
                        <span className="text-brand-muted-strong relative col-span-2 text-right font-mono text-xs tabular-nums">
                          {numFmt.format(row.tokensInput)}
                        </span>
                        <span className="text-brand-muted-strong relative col-span-2 text-right font-mono text-xs tabular-nums">
                          {numFmt.format(row.tokensOutput)}
                        </span>
                        <span className="font-display relative col-span-2 text-right font-bold tabular-nums">
                          {usdFmt.format(Number(row.costUsd))}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-brand-muted py-12 text-center text-sm">
                No agent usage in the last 30 days.
              </div>
            )}
          </div>
        </section>

        {/* ============================ USERS TABLE ============================ */}
        <section className="py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="editorial-marker mb-3">
                <span className="text-brand-primary">§ 02</span>
                <span>Users</span>
              </div>
              <h2 className="font-display text-3xl font-bold lg:text-4xl">All accounts.</h2>
            </div>

            <div className="border-brand-border/60 bg-brand-bg/60 focus-within:border-brand-primary/50 focus-within:ring-brand-primary/15 flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-all focus-within:ring-2">
              <Search className="text-brand-muted h-3.5 w-3.5 shrink-0" />
              <input
                type="search"
                placeholder="Email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="placeholder:text-brand-muted text-brand-text w-72 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="border-brand-border/60 ring-hairline bg-brand-surface/40 overflow-hidden rounded-2xl border">
            <div className="border-brand-border/40 bg-brand-elevated/30 grid grid-cols-12 border-b px-6 py-3">
              <span className="tracking-editorial-wide text-brand-muted col-span-5 font-mono text-[10px] uppercase">
                Email
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-3 font-mono text-[10px] uppercase">
                Name
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-2 font-mono text-[10px] uppercase">
                Plan
              </span>
              <span className="tracking-editorial-wide text-brand-muted col-span-2 text-right font-mono text-[10px] uppercase">
                Joined
              </span>
            </div>
            {users && users.items.length > 0 ? (
              <ul className="divide-brand-border/30 divide-y">
                {users.items.map((u) => (
                  <li key={u.id}>
                    <div className="hover:bg-brand-elevated/30 grid grid-cols-12 items-center px-6 py-3.5 transition-colors">
                      <span className="text-brand-text col-span-5 truncate font-mono text-xs">
                        {u.email}
                      </span>
                      <span className="text-brand-muted-strong col-span-3 truncate text-sm">
                        {u.name ?? '—'}
                      </span>
                      <span className="col-span-2">
                        <span
                          className={cn(
                            'tracking-editorial-wide inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase',
                            u.plan === 'FREE'
                              ? 'bg-brand-elevated text-brand-muted'
                              : u.plan === 'BUSINESS'
                                ? 'bg-brand-primary/15 text-brand-primary'
                                : 'bg-brand-elevated text-brand-text',
                          )}
                        >
                          {u.plan}
                        </span>
                      </span>
                      <span className="text-brand-muted col-span-2 text-right font-mono text-xs tabular-nums">
                        {u.createdAt.slice(0, 10)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-brand-muted py-12 text-center text-sm">No users yet.</div>
            )}
          </div>
        </section>

        {/* ============================ CLOSING ============================ */}
        <section className="border-brand-border/60 flex flex-wrap items-center justify-between gap-4 border-t py-8">
          <p className="text-brand-muted-strong font-serif text-base italic">
            &ldquo;Per-user data is RLS-isolated. Aggregates only roll up here.&rdquo;
          </p>
          <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase">
            <TrendingUp className="mr-1 inline h-3 w-3" />
            Nexa · admin v0.1
          </span>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <article
      className={cn(
        'group rounded-2xl border p-5 transition-colors',
        highlight
          ? 'border-brand-primary/30 bg-brand-primary/5 ring-hairline-strong'
          : 'border-brand-border/60 bg-brand-surface/40 ring-hairline hover:bg-brand-elevated/40',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="bg-brand-elevated ring-hairline inline-flex h-9 w-9 items-center justify-center rounded-xl">
          <Icon className="text-brand-primary h-4 w-4" />
        </div>
      </div>
      <div className="tracking-editorial-wide text-brand-muted mt-4 font-mono text-[10px] uppercase">
        {label}
      </div>
      <div className="font-display mt-1 text-2xl font-bold tabular-nums lg:text-3xl">{value}</div>
      {sub && <div className="text-brand-muted-strong mt-1 text-xs tabular-nums">{sub}</div>}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="tracking-editorial-wide text-brand-muted/70 font-mono text-[10px] uppercase">
        {label}
      </div>
      <div className="font-display text-brand-text mt-0.5 text-base font-bold tabular-nums">
        {value}
      </div>
    </div>
  );
}
