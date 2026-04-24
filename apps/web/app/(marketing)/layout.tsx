import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <header className="border-brand-border/60 bg-brand-bg/70 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
            <span className="font-display text-lg font-semibold tracking-tight">Nexa</span>
          </Link>
          <nav className="text-brand-muted hidden items-center gap-8 text-sm md:flex">
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
            <Link href="/sign-in" className="text-brand-muted hover:text-brand-text text-sm">
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-brand-border/60 text-brand-muted border-t py-10 text-center text-xs">
        <p>© {new Date().getFullYear()} Nexa · Built with Claude · Engr. Mejba Ahmed</p>
      </footer>
    </div>
  );
}
