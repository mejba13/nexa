import Link from 'next/link';
import { ArrowUpRight, Compass, Music, PenTool, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { AgentShowcase } from './_components/agent-showcase';
import { InvariantWall } from './_components/invariant-wall';
import { StatStrip } from './_components/stat-strip';

const AGENTS = [
  {
    slug: 'trading',
    label: 'Trading Analyst',
    eyebrow: 'Agent 01',
    oneliner:
      'A quant research partner that never fabricates a number. Every P/L, Sharpe, and drawdown comes from a deterministic backtest engine — the model only narrates.',
    example: {
      user: 'Backtest my RSI mean reversion on BTC for 2023 with $10k.',
      agent:
        'Ran it. 58% win rate, 18 trades, +23.5% return, max drawdown -8.4%, Sharpe 1.42. Volatility filter would have trimmed the March whipsaw (-4% of DD). Want me to A/B the RSI-25 variant?',
      tool: 'run_backtest · get_performance_metrics',
    },
    Icon: TrendingUp,
  },
  {
    slug: 'content',
    label: 'Content Strategist',
    eyebrow: 'Agent 02',
    oneliner:
      'Brand-voice-trained copy across every channel. Grounds every draft in your uploaded style guide via RAG. Respects platform char limits to the character.',
    example: {
      user: 'Draft a LinkedIn post about our Acme case study. My voice.',
      agent:
        'Pulled 4 brand excerpts — your voice opens on a specific moment, avoids buzzwords, ends with a single question. Draft @ 287 chars below preview fold. One CTA. Ready.',
      tool: 'query_brand_voice · generate_social_post',
    },
    Icon: PenTool,
  },
  {
    slug: 'life-coach',
    label: 'Life Coach',
    eyebrow: 'Agent 03',
    oneliner:
      'A reflection partner grounded in your own journals. Never invents past events. One concrete next step per conversation — not ten.',
    example: {
      user: 'What themes keep coming up in my journals this quarter?',
      agent:
        'Across 127 chunks: "tired" clusters before board weeks, "discipline" clusters right after. Your 2025-03 entry says you recover faster when you schedule the hard conversation first. Any you\'re putting off?',
      tool: 'extract_themes · query_past_reflections',
    },
    Icon: Compass,
  },
  {
    slug: 'music',
    label: 'Music Producer',
    eyebrow: 'Agent 04',
    oneliner:
      "A creative collaborator that sources real tracks from Spotify and real samples from Freesound. If an API isn't configured, it declines honestly — never fabricates a URL.",
    example: {
      user: 'Lo-fi hiphop, 82 BPM, dusty and jazzy. Palette + references.',
      agent:
        'Palette: warm Rhodes, upright bass, swung boom-bap kit, vinyl crackle. 70-90 BPM range. Arrangement: lofi-loop template, 56 bars / 2:45. Want me to pull Spotify references?',
      tool: 'suggest_instruments · suggest_arrangement',
    },
    Icon: Music,
  },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="bg-grain pointer-events-none absolute inset-0" aria-hidden />

      {/* HERO */}
      <section className="border-brand-border/60 relative border-b">
        <div className="bg-grid absolute inset-0 opacity-50" aria-hidden />
        <div className="bg-orange-glow absolute inset-0" aria-hidden />

        <div className="relative mx-auto grid min-h-[86vh] max-w-[1400px] grid-cols-12 gap-6 px-6 pb-16 pt-24 md:pb-24 md:pt-36">
          <aside className="col-span-12 flex flex-col gap-3 md:col-span-2">
            <div className="editorial-marker">
              <span className="text-brand-primary">§00</span>
              <span>Issue 01</span>
            </div>
            <div className="tracking-editorial-wide text-brand-muted mt-auto hidden font-mono text-[10px] uppercase md:block">
              <div>Built on Claude</div>
              <div className="text-brand-muted/60 mt-1">Opus 4.7 · 1M ctx</div>
            </div>
          </aside>

          <div className="col-span-12 md:col-span-10">
            <div className="animate-fade-up">
              <div className="mb-6 flex items-center gap-3">
                <span className="bg-brand-primary inline-flex h-1.5 w-1.5 animate-pulse rounded-full" />
                <span className="eyebrow">Multi-agent AI · Live 2026</span>
              </div>
              <h1 className="font-display text-display-lg text-brand-text font-bold">
                One platform.
                <br />
                <span className="text-gradient-brand">
                  Infinite <span className="font-serif font-normal italic">intelligence</span>.
                </span>
              </h1>
            </div>

            <div className="mt-10 grid grid-cols-12 gap-6 md:mt-16">
              <div className="col-span-12 md:col-span-7">
                <p
                  className="animate-fade-up text-brand-muted-strong max-w-xl text-lg leading-relaxed md:text-xl"
                  style={{ animationDelay: '0.15s' }}
                >
                  Four specialized Claude agents — Trading, Content, Life Coach, Music — with
                  isolated memory, custom tools, and real-time streaming. Private by design.
                  Grounded in your data.{' '}
                  <strong className="text-brand-text">Never fabricating numbers.</strong>
                </p>

                <div
                  className="animate-fade-up mt-10 flex flex-wrap items-center gap-3"
                  style={{ animationDelay: '0.3s' }}
                >
                  <Button asChild size="lg">
                    <Link href="/sign-up" className="group">
                      Start free
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/pricing">See pricing</Link>
                  </Button>
                  <Link
                    href="/about"
                    className="link-underline tracking-editorial-wide text-brand-muted hover:text-brand-text ml-2 font-mono text-xs uppercase"
                  >
                    How it works →
                  </Link>
                </div>
              </div>

              <div className="col-span-12 md:col-span-5">
                <div
                  className="animate-slide-in-right border-brand-border bg-brand-surface/80 relative rounded-2xl border p-5 backdrop-blur"
                  style={{ animationDelay: '0.35s' }}
                >
                  <div className="border-brand-border/60 flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-brand-danger/60 h-2 w-2 rounded-full" />
                      <span className="bg-brand-warning/60 h-2 w-2 rounded-full" />
                      <span className="bg-brand-success/60 h-2 w-2 rounded-full" />
                    </div>
                    <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
                      trading · msg 1
                    </span>
                  </div>
                  <div className="mt-4 space-y-4 font-mono text-[12px] leading-relaxed">
                    <div>
                      <span className="text-brand-primary">▶</span>{' '}
                      <span className="text-brand-muted">
                        Backtest RSI mean reversion on BTC 2023, $10k.
                      </span>
                    </div>
                    <div className="border-brand-border/60 bg-brand-bg/60 text-brand-text rounded-lg border p-3">
                      <div className="tracking-editorial-wide text-brand-muted flex items-center gap-2 text-[10px] uppercase">
                        <span className="text-brand-primary">↳</span>
                        <span>run_backtest</span>
                      </div>
                      <div className="text-brand-text mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-brand-muted text-[10px]">Return</div>
                          <div className="text-brand-success">+23.5%</div>
                        </div>
                        <div>
                          <div className="text-brand-muted text-[10px]">Win rate</div>
                          <div>58%</div>
                        </div>
                        <div>
                          <div className="text-brand-muted text-[10px]">Max DD</div>
                          <div className="text-brand-danger">-8.4%</div>
                        </div>
                        <div>
                          <div className="text-brand-muted text-[10px]">Sharpe</div>
                          <div className="text-brand-primary">1.42</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-brand-muted-strong">
                      Run complete. 18 trades across 2023. Want the volatility-filter variant?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StatStrip />
      </section>

      {/* THESIS */}
      <section className="border-brand-border/60 relative border-b py-28 md:py-40">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6">
          <div className="col-span-12 mb-12 flex items-start justify-between md:col-span-2 md:mb-0 md:flex-col">
            <div className="editorial-marker">
              <span className="text-brand-primary">§01</span>
              <span>Thesis</span>
            </div>
            <span className="tracking-editorial-wide text-brand-muted hidden font-mono text-[10px] uppercase md:mt-auto md:block">
              — the author
            </span>
          </div>
          <blockquote className="col-span-12 md:col-span-10">
            <p className="pullquote text-4xl leading-[1.1] md:text-6xl">
              Most AI tools <span className="text-brand-primary">re-learn you</span> every session.
              Nexa remembers — <em>privately, per agent</em> — and proves it{' '}
              <span className="text-gradient-brand">every turn</span>.
            </p>
            <footer className="tracking-editorial-wide text-brand-muted mt-10 flex items-center gap-4 font-mono text-xs uppercase">
              <span className="bg-brand-border-strong h-px w-12" />
              <span>Design principle · Nexa PRD §18</span>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* FOUR AGENTS */}
      <section className="border-brand-border/60 relative border-b">
        <div
          className="via-brand-primary/60 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
          <header className="mb-16 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2">
              <div className="editorial-marker">
                <span className="text-brand-primary">§02</span>
                <span>Agents</span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-display-md font-bold">
                Four agents.{' '}
                <span className="text-brand-muted-strong font-serif font-normal italic">
                  One workspace.
                </span>
              </h2>
              <p className="text-brand-muted-strong mt-4 max-w-2xl">
                Each agent has its own tools, its own knowledge base, and its own personality.
                Switch with one click. Data never crosses agents. Billing never crosses accounts.
              </p>
            </div>
          </header>

          <div className="space-y-20 md:space-y-32">
            {AGENTS.map((a, i) => (
              <AgentShowcase key={a.slug} agent={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <InvariantWall />

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="bg-orange-glow-bottom absolute inset-0" aria-hidden />
        <div
          className="via-brand-primary/40 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 py-32 md:py-48">
          <div className="col-span-12 md:col-span-2">
            <div className="editorial-marker">
              <span className="text-brand-primary">§04</span>
              <span>Start</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-display-lg font-bold leading-[0.92]">
              Stop juggling
              <br />
              <span className="text-brand-muted-strong font-serif font-normal italic">
                AI subscriptions.
              </span>
              <br />
              <span className="text-gradient-brand">Start shipping.</span>
            </h2>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/sign-up" className="group">
                  Start free — 100k tokens
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">Pricing</Link>
              </Button>
              <span className="tracking-editorial-wide text-brand-muted ml-2 font-mono text-xs uppercase">
                No card · Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
