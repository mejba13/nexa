'use client';

import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { adminApi } from '@/lib/admin';

const numFmt = new Intl.NumberFormat('en-US');

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-brand-border bg-brand-elevated rounded-xl border p-5">
      <div className="text-brand-muted text-[11px] uppercase tracking-wider">{label}</div>
      <div className="font-display mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-brand-muted mt-1 text-xs">{sub}</div>}
    </div>
  );
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

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold">Platform overview</h1>
        <p className="text-brand-muted text-sm">Last 30 days unless otherwise noted.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total users"
          value={stats ? numFmt.format(stats.totalUsers) : '—'}
          sub={stats ? `${stats.paidUsers} paid` : undefined}
        />
        <StatCard label="DAU (approx)" value={stats ? numFmt.format(stats.dauApprox) : '—'} />
        <StatCard
          label="Conversations"
          value={stats ? numFmt.format(stats.conversations30d) : '—'}
        />
        <StatCard
          label="Cost (30d)"
          value={stats ? `$${Number(stats.costUsd30d).toFixed(2)}` : '—'}
          sub={
            stats
              ? `${numFmt.format(stats.tokensInput30d + stats.tokensOutput30d)} tokens`
              : undefined
          }
        />
      </section>

      <section>
        <h2 className="font-display mb-3 text-xl font-semibold">Agent usage (30d)</h2>
        <div className="border-brand-border bg-brand-elevated overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg/40 text-brand-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3 text-right">Calls</th>
                <th className="px-4 py-3 text-right">Tokens (in)</th>
                <th className="px-4 py-3 text-right">Tokens (out)</th>
                <th className="px-4 py-3 text-right">Cost USD</th>
              </tr>
            </thead>
            <tbody>
              {agentUsage?.map((row) => (
                <tr key={row.agentType} className="border-brand-border/60 border-t">
                  <td className="px-4 py-3 font-medium">{row.agentType}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{numFmt.format(row.calls)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {numFmt.format(row.tokensInput)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {numFmt.format(row.tokensOutput)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    ${Number(row.costUsd).toFixed(2)}
                  </td>
                </tr>
              ))}
              {(!agentUsage || agentUsage.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-brand-muted px-4 py-8 text-center">
                    No agent usage in the last 30 days.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Users</h2>
          <input
            placeholder="Search email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-brand-border bg-brand-elevated focus:border-brand-primary w-72 rounded-lg border px-3 py-1.5 text-sm focus:outline-none"
          />
        </header>
        <div className="border-brand-border bg-brand-elevated overflow-hidden rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-bg/40 text-brand-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users?.items.map((u) => (
                <tr key={u.id} className="border-brand-border/60 border-t">
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">{u.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.plan === 'FREE' ? 'text-brand-muted' : 'text-brand-primary font-medium'
                      }
                    >
                      {u.plan}
                    </span>
                  </td>
                  <td className="text-brand-muted px-4 py-3 font-mono text-xs">
                    {u.createdAt.slice(0, 10)}
                  </td>
                </tr>
              ))}
              {(!users || users.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-brand-muted px-4 py-8 text-center">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
