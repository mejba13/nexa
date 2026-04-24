import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="sticky top-0 z-50 border-b border-brand-border/60 bg-brand-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-primary shadow-glow" />
            <span className="font-display text-lg font-semibold tracking-tight">Nexa</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-brand-muted md:flex">
            <Link href="/" className="hover:text-brand-text">
              Agents
            </Link>
            <Link href="/pricing" className="hover:text-brand-text">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-brand-text">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-brand-muted hover:text-brand-text"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-brand-border/60 py-10 text-center text-xs text-brand-muted">
        <p>
          © {new Date().getFullYear()} Nexa · Built with Claude · Engr. Mejba Ahmed
        </p>
      </footer>
    </div>
  );
}
