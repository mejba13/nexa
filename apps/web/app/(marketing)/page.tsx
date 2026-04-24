import Link from 'next/link';
import { Compass, Music, PenTool, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

const AGENTS = [
  {
    slug: 'trading',
    name: 'Trading Analyst',
    tagline: 'Autonomous quant partner — backtest, analyze, iterate.',
    icon: TrendingUp,
  },
  {
    slug: 'music',
    name: 'Music Producer',
    tagline: 'Creative collaborator for production, mixing, and ideas.',
    icon: Music,
  },
  {
    slug: 'content',
    name: 'Content Strategist',
    tagline: 'Brand-voice-trained content across every channel.',
    icon: PenTool,
  },
  {
    slug: 'life-coach',
    name: 'Life Coach',
    tagline: 'Personality-aware coach that learns from your journals.',
    icon: Compass,
  },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-orange-glow" />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-elevated px-3 py-1 text-xs text-brand-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              Multi-agent AI platform · Powered by Claude
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              One platform.
              <br />
              <span className="text-gradient-brand">Infinite intelligence.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-brand-muted">
              Four specialized Claude agents — Trading, Music, Content, Life Coach — with
              isolated memory, custom tools, and real-time streaming. All in one workspace.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">Start free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Agents grid (bento) */}
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Meet your AI team
        </h2>
        <p className="mt-2 max-w-2xl text-brand-muted">
          Each agent has its own knowledge base, tools, and personality. Trained on your
          data — private by design.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {AGENTS.map(({ slug, name, tagline, icon: Icon }) => (
            <article
              key={slug}
              className="group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-elevated p-8 transition-all hover:border-brand-primary/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/0 via-transparent to-brand-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-bg text-brand-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{name}</h3>
                  <p className="mt-1 text-sm text-brand-muted">{tagline}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
