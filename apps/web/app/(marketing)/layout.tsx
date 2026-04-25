'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Compass, Github, Music, PenTool, TrendingUp } from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

const FOOTER_PRODUCT = [
  { href: '/pricing', label: 'Pricing', code: '01' },
  { href: '/about', label: 'About', code: '02' },
  { href: '/agents/trading', label: 'Trading agent', code: '03' },
  { href: '/agents/content', label: 'Content agent', code: '04' },
  { href: '/agents/life-coach', label: 'Life coach', code: '05' },
  { href: '/agents/music', label: 'Music agent', code: '06' },
];

const FOOTER_PLATFORM = [
  { href: '/sign-up', label: 'Start free', code: '01' },
  { href: '/sign-in', label: 'Sign in', code: '02' },
  { href: 'http://localhost:3001/api/docs', label: 'API docs', code: '03', external: true },
  { href: '#', label: 'Changelog', code: '04' },
  { href: '#', label: 'Status page', code: '05' },
];

const FOOTER_LEGAL = [
  { href: '#', label: 'Privacy policy', code: '01' },
  { href: '#', label: 'Terms of service', code: '02' },
  { href: '#', label: 'Data processing', code: '03' },
  { href: '#', label: 'Cookie policy', code: '04' },
];

const FOOTER_AGENTS = [
  { Icon: TrendingUp, label: 'Trading' },
  { Icon: PenTool, label: 'Content' },
  { Icon: Compass, label: 'Life coach' },
  { Icon: Music, label: 'Music' },
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

      <footer className="bg-brand-bg border-brand-border/60 relative overflow-hidden border-t">
        {/* Atmospheric: orange glow + grain + grid wash */}
        <div className="bg-orange-glow-bottom pointer-events-none absolute inset-x-0 top-0 h-[480px]" />
        <div className="bg-grain pointer-events-none absolute inset-0" />
        <div
          aria-hidden
          className="bg-brand-border/40 absolute left-0 right-0 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,145,0,0.5) 30%, rgba(255,145,0,0.5) 70%, transparent 100%)',
          }}
        />

        <div className="relative mx-auto max-w-[1400px] px-6">
          {/* ============================ CLOSING STATEMENT ============================ */}
          <section className="border-brand-border/60 grid grid-cols-12 gap-8 border-b py-16 md:py-24">
            <div className="col-span-12 md:col-span-7">
              <div className="editorial-marker mb-4">
                <span className="text-brand-primary">§ Coda</span>
                <span className="bg-brand-border-strong h-px w-10" />
                <span>Nexa · 2026</span>
              </div>
              <p className="text-brand-text font-display text-display-xs lg:text-display-sm font-bold leading-[1.05]">
                Stop juggling tabs.
                <br />
                <span className="text-brand-muted-strong font-serif font-normal italic">
                  Start shipping with
                </span>{' '}
                <span className="text-gradient-brand">a team of four</span>.
              </p>
              <p className="text-brand-muted-strong mt-6 max-w-lg text-sm md:text-base">
                100k tokens, every month, on the house. No card. No quota traps. Cancel from the
                customer portal anytime.
              </p>
            </div>
            <div className="col-span-12 flex flex-col justify-end gap-3 md:col-span-5 md:items-end">
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/sign-up" className="group">
                    Start free
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">View pricing</Link>
                </Button>
              </div>
              <div className="tracking-editorial-wide text-brand-muted mt-2 font-mono text-[10px] uppercase">
                <span className="text-brand-primary">●</span> 2-minute signup · no card · cancel
                anytime
              </div>
            </div>
          </section>

          {/* ============================ AGENT TICKER ============================ */}
          <div
            aria-hidden
            className="border-brand-border/40 mask-fade-x flex items-center gap-12 overflow-hidden border-b py-6"
          >
            <div className="animate-marquee flex shrink-0 items-center gap-12 whitespace-nowrap will-change-transform">
              {[...FOOTER_AGENTS, ...FOOTER_AGENTS, ...FOOTER_AGENTS].map(({ Icon, label }, i) => (
                <span
                  key={`${label}-${i}`}
                  className="tracking-editorial-wide text-brand-muted/50 inline-flex items-center gap-3 font-mono text-xs uppercase"
                >
                  <Icon className="text-brand-primary/60 h-3.5 w-3.5" />
                  {label}
                  <span className="text-brand-border-strong">·</span>
                </span>
              ))}
            </div>
          </div>

          {/* ============================ MAIN GRID ============================ */}
          <section className="grid grid-cols-12 gap-x-8 gap-y-12 py-16">
            {/* Brand column */}
            <div className="col-span-12 md:col-span-5">
              <Logo size="lg" suffix="v0.1" />
              <p className="text-brand-muted-strong mt-6 max-w-md font-serif text-lg italic leading-snug">
                Four agents. One workspace. Isolated memory, custom tools, and real-time streaming —
                built on Claude.
              </p>

              {/* Stat strip */}
              <dl className="border-brand-border/40 bg-brand-border/40 mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-lg border">
                {[
                  { k: 'Agents', v: '04', sub: 'specialized' },
                  { k: 'Tools', v: '24', sub: 'per session' },
                  { k: 'Tokens', v: '100k', sub: 'per month' },
                ].map((s) => (
                  <div key={s.k} className="bg-brand-bg/95 px-4 py-3.5">
                    <dt className="tracking-editorial-wide text-brand-muted font-mono text-[9px] uppercase">
                      {s.k}
                    </dt>
                    <dd className="font-display text-brand-text mt-1 text-xl font-bold tabular-nums">
                      {s.v}
                    </dd>
                    <dd className="tracking-editorial-wide text-brand-muted/70 mt-0.5 font-mono text-[9px] uppercase">
                      {s.sub}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Social rail */}
              <div className="mt-8 flex items-center gap-3">
                <SocialIcon href="https://github.com/EngrMejbaAhmed" label="GitHub" Icon={Github} />
                <SocialIcon href="https://x.com" label="X / Twitter" Icon={XGlyph} />
                <SocialIcon
                  href="https://www.linkedin.com/in/engr-mejba-ahmed"
                  label="LinkedIn"
                  Icon={LinkedInGlyph}
                />
                <span className="bg-brand-border-strong ml-2 h-px flex-1" />
                <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
                  Follow
                </span>
              </div>
            </div>

            {/* Nav columns */}
            <FooterColumn title="Product" code="01" items={FOOTER_PRODUCT} />
            <FooterColumn title="Platform" code="02" items={FOOTER_PLATFORM} />
            <FooterColumn title="Legal" code="03" items={FOOTER_LEGAL} />
          </section>

          {/* ============================ BOTTOM RAIL ============================ */}
          <section className="border-brand-border/60 grid grid-cols-12 items-center gap-4 border-t py-6">
            <div className="col-span-12 flex flex-wrap items-center gap-x-5 gap-y-2 md:col-span-8">
              <span className="tracking-editorial-wide text-brand-muted/80 font-mono text-[10px] uppercase">
                © {new Date().getFullYear()} Nexa
              </span>
              <span className="bg-brand-border-strong hidden h-3 w-px md:block" />
              <span className="tracking-editorial-wide text-brand-muted/80 font-mono text-[10px] uppercase">
                Built with Claude
              </span>
              <span className="bg-brand-border-strong hidden h-3 w-px md:block" />
              <span className="tracking-editorial-wide text-brand-muted/80 font-mono text-[10px] uppercase">
                Shipped by{' '}
                <a
                  href="https://www.mejba.me/"
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline text-brand-text"
                >
                  Engr. Mejba Ahmed
                </a>
              </span>
            </div>

            <div className="col-span-12 flex flex-wrap items-center justify-end gap-x-5 gap-y-2 md:col-span-4">
              <span className="bg-brand-elevated/60 inline-flex items-center gap-2 rounded-full px-3 py-1">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
                  All systems · operational
                </span>
              </span>
              <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase">
                Region · iad-1
              </span>
            </div>
          </section>
        </div>
      </footer>
    </div>
  );
}

interface FooterItem {
  href: string;
  label: string;
  code: string;
  external?: boolean;
}

function FooterColumn({
  title,
  code,
  items,
}: {
  title: string;
  code: string;
  items: FooterItem[];
}) {
  return (
    <div className="col-span-6 md:col-span-2">
      <div className="editorial-marker mb-5">
        <span className="text-brand-primary">§ {code}</span>
        <span>{title}</span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const isExternal = item.external || item.href.startsWith('http');
          const Tag = isExternal ? 'a' : Link;
          const props = isExternal
            ? { href: item.href, target: '_blank', rel: 'noreferrer' as const }
            : { href: item.href };
          return (
            <li key={item.label}>
              <Tag
                {...(props as { href: string })}
                className="text-brand-muted-strong hover:text-brand-text group inline-flex items-baseline gap-2.5 text-sm transition-colors"
              >
                <span className="tracking-editorial-wide text-brand-muted/40 group-hover:text-brand-primary font-mono text-[10px] uppercase tabular-nums transition-colors">
                  {item.code}
                </span>
                <span>{item.label}</span>
                {isExternal && (
                  <ArrowUpRight className="text-brand-muted/40 group-hover:text-brand-primary h-3 w-3 -translate-y-px transition-all group-hover:-translate-y-1 group-hover:translate-x-0.5" />
                )}
              </Tag>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="border-brand-border bg-brand-surface/60 text-brand-muted hover:border-brand-primary/40 hover:bg-brand-elevated hover:text-brand-text inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all"
    >
      <Icon className="h-3.5 w-3.5" />
    </a>
  );
}

function XGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.16 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function LinkedInGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"
      />
    </svg>
  );
}
