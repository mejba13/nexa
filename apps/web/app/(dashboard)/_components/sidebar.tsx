'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Compass, LayoutDashboard, Music, PenTool, Settings, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, short: '§' },
  { href: '/agents/trading', label: 'Trading', icon: TrendingUp, short: '01' },
  { href: '/agents/content', label: 'Content', icon: PenTool, short: '02' },
  { href: '/agents/life-coach', label: 'Life Coach', icon: Compass, short: '03' },
  { href: '/agents/music', label: 'Music', icon: Music, short: '04' },
];

const FOOTER_NAV = [
  { href: '/billing', label: 'Billing' },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ clerkReady }: { clerkReady: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="border-brand-border/60 bg-brand-surface/60 sticky top-0 hidden h-screen w-64 shrink-0 border-r backdrop-blur md:flex md:flex-col">
      <Link href="/dashboard" className="group flex items-center gap-2.5 px-6 pb-8 pt-7">
        <span className="relative inline-flex">
          <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
          <span className="bg-brand-primary absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-30" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">Nexa</span>
      </Link>

      <div className="px-6">
        <div className="eyebrow text-brand-muted mb-3">Workspace</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon, short }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-brand-elevated text-brand-text ring-hairline'
                  : 'text-brand-muted hover:bg-brand-elevated/50 hover:text-brand-text',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text',
                )}
              />
              <span className="flex-1">{label}</span>
              <span
                className={cn(
                  'tracking-editorial-wide font-mono text-[10px] uppercase',
                  active ? 'text-brand-primary' : 'text-brand-muted/60',
                )}
              >
                {short}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-brand-border/60 mt-auto border-t p-3">
        {FOOTER_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-brand-elevated text-brand-text'
                  : 'text-brand-muted hover:bg-brand-elevated/50 hover:text-brand-text',
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : <span className="h-4 w-4" />}
              {label}
            </Link>
          );
        })}
        <div className="border-brand-border/60 bg-brand-bg/30 mt-3 flex items-center justify-between rounded-lg border p-3">
          <div className="flex-1 overflow-hidden">
            <div className="tracking-editorial-wide text-brand-muted truncate font-mono text-[10px] uppercase">
              Signed in
            </div>
            <div className="text-brand-text mt-0.5 text-xs">You</div>
          </div>
          {clerkReady ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="bg-brand-elevated h-7 w-7 rounded-full" />
          )}
        </div>
      </div>
    </aside>
  );
}
