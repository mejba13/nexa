import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text flex min-h-screen flex-col">
      <header className="border-brand-border/60 bg-brand-surface border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
            <span className="font-display text-lg font-semibold">
              Nexa <span className="text-brand-muted">Admin</span>
            </span>
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard">Back to app</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
