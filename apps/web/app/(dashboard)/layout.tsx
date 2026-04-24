import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Compass, LayoutDashboard, Music, PenTool, Settings, TrendingUp } from 'lucide-react';

// Dashboard routes are fully dynamic — they depend on the signed-in user +
// live API calls. Prerendering them at build would require a mounted
// ClerkProvider + API, which isn't available in the CI build step.
export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/agents/trading', label: 'Trading', icon: TrendingUp },
  { href: '/agents/music', label: 'Music', icon: Music },
  { href: '/agents/content', label: 'Content', icon: PenTool },
  { href: '/agents/life-coach', label: 'Life Coach', icon: Compass },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text flex min-h-screen">
      <aside className="border-brand-border/60 bg-brand-surface hidden w-64 shrink-0 border-r p-4 md:flex md:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
          <span className="font-display text-lg font-semibold">Nexa</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="text-brand-muted hover:bg-brand-elevated hover:text-brand-text flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-brand-border/60 mt-auto flex items-center justify-between rounded-lg border p-2">
          <Link
            href="/settings"
            className="text-brand-muted hover:text-brand-text flex items-center gap-2 text-sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
