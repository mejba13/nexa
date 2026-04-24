import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

const TIMELINE = [
  {
    phase: 'Phase 1',
    range: 'Weeks 1–2',
    title: 'Foundation',
    body: 'Turborepo + pnpm. NestJS + Prisma 5. Next.js 14 App Router. PostgreSQL 16 with pgvector + Redis 7 via Docker. Clerk auth. The skeleton the rest would hang from.',
  },
  {
    phase: 'Phase 2',
    range: 'Weeks 3–4',
    title: 'Agent Core',
    body: 'Claude orchestrator with tool-call loop capped at 10 iterations. SSE streaming. RAG pipeline (512/64 chunking, OpenAI embeddings, pgvector retrieval). File upload to R2. Reusable chat UI.',
  },
  {
    phase: 'Phase 3',
    range: 'Weeks 5–9',
    title: 'Four Agents',
    body: 'Trading (deterministic backtester · 6 tools), Content (platform specs + brand RAG · 6 tools), Life Coach (journal RAG + themes · 6 tools), Music (Spotify + Freesound · 6 tools). Twenty-four tools total, one registry.',
  },
  {
    phase: 'Phase 4',
    range: 'Weeks 10–12',
    title: 'Production Polish',
    body: 'Stripe billing with idempotent webhook reconciler. Admin dashboard with CSV export. Langfuse traces per Claude call. Sentry on 5xx. Integration banner at boot. Seventy-eight unit tests.',
  },
  {
    phase: 'Phase 5',
    range: 'Weeks 13–14',
    title: 'Launch',
    body: 'Docker multi-stage build for Railway. Vercel deploy for web. Tag-driven CI. Full deployment runbook. Where you are now.',
  },
];

const PRINCIPLES = [
  {
    title: 'Determinism > fluency',
    body: 'Trading P/L comes from a pure-function backtest engine. The LLM narrates the numbers; it never calculates them. Same for content platform limits, music palettes, journal themes.',
  },
  {
    title: 'Privacy by layer',
    body: 'Postgres row-level security. Tenant-scoped R2 keys. Every retrieval query filters by user + agent at the SQL layer. Data never crosses accounts — architecturally, not aspirationally.',
  },
  {
    title: 'Honest degradation',
    body: "When Stripe / Spotify / Freesound / R2 aren't configured, the agent says so plainly. A boot banner prints the current integration status. No silent fallbacks that look successful.",
  },
  {
    title: 'Cost-aware by default',
    body: 'Tool-call iterations capped. Monthly token quotas cut off before Claude is called. Prompt caching on the system prompt. Per-iteration cost tracking in Langfuse.',
  },
];

export default function AboutPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="bg-grain pointer-events-none absolute inset-0" aria-hidden />

      {/* Hero */}
      <section className="border-brand-border/60 relative border-b">
        <div className="bg-orange-glow absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6 pb-20 pt-28 md:pt-36">
          <div className="col-span-12 md:col-span-2">
            <div className="editorial-marker">
              <span className="text-brand-primary">§</span>
              <span>About · 2026</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h1 className="font-display text-display-lg font-bold leading-[0.92]">
              Built like a
              <br />
              <span className="text-brand-muted-strong font-serif font-normal italic">
                senior engineer
              </span>{' '}
              <br />
              <span className="text-gradient-brand">would want it built.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Thesis */}
      <section className="border-brand-border/60 border-b py-24 md:py-32">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6">
          <div className="col-span-12 md:col-span-2">
            <div className="editorial-marker">
              <span className="text-brand-primary">§01</span>
              <span>Thesis</span>
            </div>
          </div>
          <div className="col-span-12 space-y-8 md:col-span-10">
            <p className="pullquote max-w-3xl">
              Most AI wrappers are a text field bolted onto an LLM. Nexa is a{' '}
              <span className="text-brand-primary">platform</span>, with durable memory, isolated
              tool surfaces, and <em>honest failure modes</em>.
            </p>
            <div className="hairline" />
            <div className="grid grid-cols-12 gap-6 pt-2">
              <div className="col-span-12 md:col-span-6">
                <p className="text-brand-muted-strong leading-relaxed">
                  The PRD was written in April 2026 and took four weeks of disciplined
                  implementation to ship. The principle through every phase was the same:{' '}
                  <strong className="text-brand-text">
                    never let the agent fabricate something a deterministic function could produce
                    instead.
                  </strong>
                </p>
              </div>
              <div className="col-span-12 md:col-span-6">
                <p className="text-brand-muted-strong leading-relaxed">
                  Everything you see — from the RSI backtester to the brand-voice retrieval to the
                  Stripe webhook reconciler — has a regression test and a place in the Architecture
                  doc. Boring engineering, run hard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-brand-border/60 bg-brand-surface/40 relative border-b">
        <div className="bg-brand-ruled absolute inset-0 opacity-10" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6 py-24 md:py-32">
          <header className="mb-16 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2">
              <div className="editorial-marker">
                <span className="text-brand-primary">§02</span>
                <span>Principles</span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-display-md font-bold">Four principles.</h2>
            </div>
          </header>

          <div className="bg-brand-border/60 grid grid-cols-1 gap-px overflow-hidden rounded-2xl md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.title}
                className="bg-brand-bg hover:bg-brand-elevated p-8 transition-colors md:p-10"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-brand-primary text-3xl font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                </div>
                <p className="text-brand-muted-strong mt-4">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-brand-border/60 border-b py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6">
          <header className="mb-16 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2">
              <div className="editorial-marker">
                <span className="text-brand-primary">§03</span>
                <span>Timeline</span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-display-md font-bold">
                Fourteen weeks.{' '}
                <span className="text-brand-muted-strong font-serif font-normal italic">
                  Five phases.
                </span>
              </h2>
            </div>
          </header>

          <ol className="border-brand-border/60 relative border-l md:ml-6">
            {TIMELINE.map((t, i) => (
              <li key={t.phase} className="relative mb-16 grid grid-cols-12 gap-6 pl-6 md:pl-10">
                <span className="bg-brand-primary shadow-glow absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full md:-left-[5px]" />
                <div className="col-span-12 md:col-span-2">
                  <div className="flex items-baseline gap-2 md:flex-col md:items-start md:gap-1">
                    <span className="font-display text-brand-primary text-3xl font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
                      {t.range}
                    </span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-10">
                  <h3 className="font-display text-2xl font-semibold">{t.title}</h3>
                  <p className="text-brand-muted-strong mt-3 max-w-3xl">{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Builder */}
      <section className="border-brand-border/60 border-b py-24 md:py-32">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6">
          <div className="col-span-12 md:col-span-2">
            <div className="editorial-marker">
              <span className="text-brand-primary">§04</span>
              <span>Builder</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-display-md font-bold">
              Built by{' '}
              <span className="text-brand-primary font-serif font-normal italic">
                one engineer.
              </span>
            </h2>
            <p className="text-brand-muted-strong mt-6 max-w-2xl text-lg leading-relaxed">
              <strong className="text-brand-text">Engr. Mejba Ahmed</strong> — Full-Stack AI
              developer, 10+ years shipping production SaaS, AWS certified, Anthropic-certified on
              Claude Code. 160+ client projects. Built Nexa solo across 14 weeks against the PRD.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild variant="outline">
                <a href="https://www.mejba.me/" target="_blank" rel="noreferrer" className="group">
                  mejba.me
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Button>
              <span className="tracking-editorial-wide text-brand-muted font-mono text-xs uppercase">
                Portfolio · Rendrix · Tube2Blog.ai · BrandFlow AI · RevSignal AI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32">
        <div className="bg-orange-glow-bottom absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6 text-center">
          <h2 className="font-display text-display-md font-bold">Try the workspace.</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up" className="group">
                Start free
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
