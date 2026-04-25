'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  ChevronRight,
  Compass,
  LayoutDashboard,
  LogOut,
  Music,
  PenTool,
  Search,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Logo } from '@/components/brand/logo';
import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { cn } from '@/lib/utils';

const PRIMARY_NAV = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    code: '§',
    accent: 'home',
  },
  { href: '/agents/trading', label: 'Trading', icon: TrendingUp, code: '01', accent: 'agent' },
  { href: '/agents/content', label: 'Content', icon: PenTool, code: '02', accent: 'agent' },
  { href: '/agents/life-coach', label: 'Life Coach', icon: Compass, code: '03', accent: 'agent' },
  { href: '/agents/music', label: 'Music', icon: Music, code: '04', accent: 'agent' },
] as const;

const SECONDARY_NAV = [
  { href: '/billing', label: 'Billing', icon: Wallet, adminOnly: false },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
] as const;

interface UsageSnapshot {
  plan: string;
  tokensUsed: number;
  tokensLimit: number;
}

interface ConversationItem {
  id: string;
  agentType: string;
  lastMessageAt: string | null;
}

const AGENT_KEY: Record<string, string> = {
  TRADING: '/agents/trading',
  CONTENT: '/agents/content',
  LIFE_COACH: '/agents/life-coach',
  MUSIC: '/agents/music',
};

export function DashboardSidebar({
  clerkReady,
  isAdmin = false,
}: {
  clerkReady: boolean;
  /** Show /admin in the secondary nav. Defaults to false; admin layout passes true. */
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const { getToken, user, signOut } = useNexaAuth();
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [recentByAgent, setRecentByAgent] = useState<Record<string, string>>({});
  const [today, setToday] = useState<string>('');
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setToday(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }));
      setTime(d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
        const headers = { Authorization: `Bearer ${token}` };
        const [u, c] = await Promise.all([
          fetch(`${base}/billing/usage`, { headers, cache: 'no-store' }).then((r) =>
            r.ok ? (r.json() as Promise<UsageSnapshot>) : null,
          ),
          fetch(`${base}/conversations?limit=20`, { headers, cache: 'no-store' }).then((r) =>
            r.ok ? (r.json() as Promise<{ data: ConversationItem[] }>) : null,
          ),
        ]);
        if (cancelled) return;
        if (u) setUsage(u);
        if (c?.data) {
          const counts: Record<string, string> = {};
          for (const conv of c.data) {
            const path = AGENT_KEY[conv.agentType];
            if (!path) continue;
            counts[path] = String((Number(counts[path] ?? '0') || 0) + 1);
          }
          setRecentByAgent(counts);
        }
      } catch {
        // Silent — sidebar still renders without data.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const usagePct = usage
    ? Math.min(100, Math.round((usage.tokensUsed / Math.max(usage.tokensLimit, 1)) * 100))
    : 0;
  const usageTone = usagePct > 80 ? 'high' : usagePct > 50 ? 'mid' : 'low';

  return (
    <aside className="border-brand-border/60 bg-brand-surface/30 sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r backdrop-blur-2xl md:flex">
      {/* Atmospheric layers */}
      <div className="from-brand-primary/12 via-brand-primary/4 pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b to-transparent" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-30" />
      {/* Right hairline accent */}
      <div className="bg-brand-border-strong pointer-events-none absolute inset-y-0 right-0 w-px opacity-50" />

      {/* ============================ HEADER ============================ */}
      <div className="relative px-5 pb-4 pt-6">
        <div className="flex items-start justify-between">
          <Link href="/dashboard" aria-label="Nexa — dashboard" className="inline-flex">
            <Logo size="md" asLink={false} />
          </Link>
          <div className="flex flex-col items-end leading-tight">
            <span className="tracking-editorial-wide text-brand-muted/70 font-mono text-[9px] uppercase tabular-nums">
              {today}
            </span>
            <span className="text-brand-muted/50 mt-0.5 font-mono text-[9px] tabular-nums">
              {time}
            </span>
          </div>
        </div>
      </div>

      {/* ============================ SEARCH ============================ */}
      <div className="relative px-5 pb-4">
        <div className="border-brand-border/60 bg-brand-bg/70 hover:border-brand-border focus-within:border-brand-primary/50 focus-within:ring-brand-primary/15 group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all focus-within:ring-2">
          <Search className="text-brand-muted h-3.5 w-3.5 shrink-0" />
          <input
            type="search"
            placeholder="Jump to…"
            aria-label="Quick navigation search"
            className="placeholder:text-brand-muted text-brand-text flex-1 bg-transparent text-sm outline-none"
          />
          <kbd className="border-brand-border bg-brand-elevated text-brand-muted hidden rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase md:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ============================ PRIMARY NAV ============================ */}
      <nav className="relative flex-1 overflow-y-auto px-3 pb-3">
        <SectionLabel count="04 agents">Workspace</SectionLabel>

        <ul className="mt-2 space-y-0.5">
          {PRIMARY_NAV.map(({ href, label, icon: Icon, code }) => {
            const active =
              pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
            const conversationCount = recentByAgent[href];
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                    active
                      ? 'from-brand-elevated via-brand-elevated/80 to-brand-elevated/20 text-brand-text ring-hairline bg-gradient-to-r'
                      : 'text-brand-muted hover:text-brand-text hover:bg-brand-elevated/40',
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="bg-brand-primary shadow-glow absolute inset-y-2 left-0 w-0.5 rounded-r-full" />
                  )}

                  {/* Icon tile */}
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all',
                      active
                        ? 'bg-brand-primary/15 ring-brand-primary/20 ring-1'
                        : 'bg-brand-elevated/40 group-hover:bg-brand-elevated',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5 transition-colors',
                        active
                          ? 'text-brand-primary'
                          : 'text-brand-muted group-hover:text-brand-text',
                      )}
                    />
                  </span>

                  <span className="flex-1 truncate font-medium">{label}</span>

                  {/* Right side: count badge or code */}
                  {conversationCount && !active ? (
                    <span className="bg-brand-elevated text-brand-muted-strong tracking-editorial-wide rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tabular-nums">
                      {conversationCount}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'tracking-editorial-wide font-mono text-[10px] uppercase tabular-nums',
                        active ? 'text-brand-primary' : 'text-brand-muted/40',
                      )}
                    >
                      {code}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* "Today" mini card */}
        <div className="mt-6">
          <SectionLabel>Today</SectionLabel>
          <Link
            href="/dashboard"
            className="border-brand-border/60 hover:border-brand-primary/40 from-brand-bg/40 via-brand-bg/40 to-brand-primary/5 group mx-1 mt-2 block overflow-hidden rounded-xl border bg-gradient-to-br p-3 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[9px] uppercase">
                Operational
              </span>
              <ChevronRight className="text-brand-muted/40 group-hover:text-brand-primary ml-auto h-3 w-3 transition-all group-hover:translate-x-0.5" />
            </div>
            <p className="text-brand-text mt-2 font-serif text-xs italic leading-snug">
              &ldquo;Pick up where you left off.&rdquo;
            </p>
            <div className="text-brand-muted-strong mt-2 flex items-center justify-between font-mono text-[9px] tabular-nums">
              <span>iad-1 · v0.1</span>
              <span className="text-brand-primary inline-flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" />
                streaming
              </span>
            </div>
          </Link>
        </div>

        {/* Account section */}
        <div className="mt-6">
          <SectionLabel>Account</SectionLabel>
          <ul className="mt-2 space-y-0.5">
            {SECONDARY_NAV.filter((n) => !n.adminOnly || isAdmin).map(
              ({ href, label, icon: Icon, adminOnly }) => {
                const active = pathname === href || pathname?.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-brand-elevated text-brand-text'
                          : 'text-brand-muted hover:bg-brand-elevated/40 hover:text-brand-text',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-3.5 w-3.5 transition-colors',
                          active
                            ? 'text-brand-primary'
                            : 'text-brand-muted group-hover:text-brand-text',
                        )}
                      />
                      <span className="flex-1 font-medium">{label}</span>
                      {adminOnly && (
                        <span className="bg-brand-primary/15 text-brand-primary tracking-editorial-wide rounded-full px-1.5 py-0.5 font-mono text-[8px] uppercase">
                          Admin
                        </span>
                      )}
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </div>
      </nav>

      {/* ============================ USAGE STRIP ============================ */}
      {usage && (
        <div className="relative mx-3 mb-3">
          <div
            className={cn(
              'rounded-xl border p-3 transition-colors',
              usageTone === 'high'
                ? 'border-brand-primary/30 bg-brand-primary/5'
                : 'border-brand-border/60 bg-brand-bg/40',
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex h-1.5 w-1.5 rounded-full',
                    usageTone === 'high'
                      ? 'bg-brand-primary'
                      : usageTone === 'mid'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400',
                  )}
                />
                <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[9px] uppercase">
                  {usage.plan} · usage
                </span>
              </div>
              <span className="font-display text-brand-text text-xs font-bold tabular-nums">
                {usagePct}%
              </span>
            </div>
            <div className="bg-brand-elevated/80 relative h-1 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                  usageTone === 'high' ? 'bg-brand-primary' : 'bg-brand-primary/70',
                )}
                style={{ width: `${usagePct}%` }}
              />
              {/* Shimmer */}
              <div
                className="absolute inset-y-0 w-12 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  animation: 'shimmer 2.5s ease-in-out infinite',
                  left: `${usagePct}%`,
                }}
              />
            </div>
            <div className="text-brand-muted-strong mt-2 flex items-center justify-between text-[10px] tabular-nums">
              <span>{(usage.tokensUsed / 1000).toFixed(1)}k used</span>
              <span>/ {(usage.tokensLimit / 1000).toFixed(0)}k</span>
            </div>
            <Link
              href="/billing"
              className="text-brand-primary hover:text-brand-accent tracking-editorial-wide mt-2.5 inline-flex items-center gap-1 font-mono text-[9px] uppercase transition-colors"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Manage plan
              <ChevronRight className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ============================ USER FOOTER ============================ */}
      <div className="border-brand-border/60 relative border-t p-3">
        <div className="bg-brand-elevated/40 ring-hairline hover:bg-brand-elevated/70 group relative flex items-center gap-3 rounded-xl p-2.5 transition-colors">
          {/* Online pulse */}
          <span className="absolute right-2 top-2 inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {clerkReady ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="bg-brand-primary/20 ring-brand-primary/40 text-brand-primary font-display inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1">
              {(user?.firstName?.[0] ?? 'M').toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-brand-text truncate text-xs font-medium">
              {user?.fullName ?? user?.firstName ?? 'You'}
            </div>
            <div className="text-brand-muted truncate font-mono text-[10px]">
              {user?.email ?? '—'}
            </div>
          </div>
          {!clerkReady && (
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="text-brand-muted hover:text-brand-text shrink-0 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <div className="flex items-center justify-between px-3">
      <span className="tracking-editorial-wide text-brand-muted/70 font-mono text-[9px] uppercase">
        {children}
      </span>
      {count && (
        <span className="tracking-editorial-wide text-brand-muted/40 font-mono text-[9px] uppercase tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}
