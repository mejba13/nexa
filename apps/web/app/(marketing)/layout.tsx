'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-brand-border bg-brand-bg/85 border-b backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
          <Logo size="md" suffix="v0.1" />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    'link-underline tracking-editorial-wide font-mono text-xs uppercase transition-colors',
                    active ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text',
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="tracking-editorial-wide text-brand-muted hover:text-brand-text hidden font-mono text-xs uppercase md:inline"
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

      <footer className="border-brand-border/60 bg-brand-surface/30 border-t">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-14">
          <div className="col-span-12 md:col-span-5">
            <Logo size="md" />
            <p className="text-brand-muted-strong mt-4 max-w-sm text-sm">
              One platform for four specialized AI agents. Grounded in your data. Isolated by
              design. Built on Claude.
            </p>
            <p className="tracking-editorial-wide text-brand-muted mt-6 font-mono text-[10px] uppercase">
              Built with Claude · Shipped by{' '}
              <a
                href="https://www.mejba.me/"
                target="_blank"
                rel="noreferrer"
                className="link-underline text-brand-text"
              >
                Engr. Mejba Ahmed
              </a>
            </p>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="eyebrow text-brand-muted mb-4">Product</div>
            <ul className="text-brand-muted-strong space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-brand-text">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-text">
                  About
                </Link>
              </li>
              <li>
                <Link href="/agents/trading" className="hover:text-brand-text">
                  Trading agent
                </Link>
              </li>
              <li>
                <Link href="/agents/content" className="hover:text-brand-text">
                  Content agent
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="eyebrow text-brand-muted mb-4">Platform</div>
            <ul className="text-brand-muted-strong space-y-2 text-sm">
              <li>
                <Link href="/sign-up" className="hover:text-brand-text">
                  Start free
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-brand-text">
                  Sign in
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3001/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-text"
                >
                  API docs
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="eyebrow text-brand-muted mb-4">Legal</div>
            <ul className="text-brand-muted-strong space-y-2 text-sm">
              <li>Privacy policy</li>
              <li>Terms of service</li>
              <li>Data processing addendum</li>
            </ul>
          </div>
        </div>

        <div className="border-brand-border/60 border-t">
          <div className="tracking-editorial-wide text-brand-muted mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-6 py-5 font-mono text-[10px] uppercase">
            <span>© {new Date().getFullYear()} Nexa · All rights reserved</span>
            <span>Status · All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
