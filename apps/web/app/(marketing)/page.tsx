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
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="bg-orange-glow absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-24 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="border-brand-border bg-brand-elevated text-brand-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              <span className="bg-brand-primary h-1.5 w-1.5 rounded-full" />
              Multi-agent AI platform · Powered by Claude
            </span>
            <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              One platform.
              <br />
              <span className="text-gradient-brand">Infinite intelligence.</span>
            </h1>
            <p className="text-brand-muted mx-auto mt-6 max-w-xl text-lg">
              Four specialized Claude agents — Trading, Music, Content, Life Coach — with isolated
              memory, custom tools, and real-time streaming. All in one workspace.
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
        <p className="text-brand-muted mt-2 max-w-2xl">
          Each agent has its own knowledge base, tools, and personality. Trained on your data —
          private by design.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {AGENTS.map(({ slug, name, tagline, icon: Icon }) => (
            <article
              key={slug}
              className="border-brand-border bg-brand-elevated hover:border-brand-primary/50 group relative overflow-hidden rounded-2xl border p-8 transition-all"
            >
              <div className="from-brand-primary/0 to-brand-primary/0 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-start gap-5">
                <div className="bg-brand-bg text-brand-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{name}</h3>
                  <p className="text-brand-muted mt-1 text-sm">{tagline}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
