import { Lock, Zap, ShieldCheck, Gauge } from 'lucide-react';

const INVARIANTS = [
  {
    number: '01',
    title: 'Never fabricates numbers',
    body: 'Trading P/L, Sharpe, and drawdown come from a deterministic backtest engine. The agent narrates — never calculates. 48 unit tests guard the engine.',
    tag: 'Determinism',
    Icon: Gauge,
  },
  {
    number: '02',
    title: 'Tenant-scoped retrieval',
    body: 'Every RAG query filters by user AND agent at the database layer. Row-level-security policies on 7 tables. No cross-account leakage is architecturally possible.',
    tag: 'Isolation',
    Icon: Lock,
  },
  {
    number: '03',
    title: 'Tool-call cap',
    body: 'Ten tool iterations per message, hard-capped. Prevents runaway costs if the agent gets stuck in a loop. Monthly token quotas cut off before Claude is called.',
    tag: 'Cost safety',
    Icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Honest degradation',
    body: "When Spotify, Freesound, or Stripe aren't configured, the agent declines plainly — never invents a URL, sample ID, or price. Typed errors propagate to you.",
    tag: 'Truthfulness',
    Icon: Zap,
  },
];

export function InvariantWall() {
  return (
    <section className="border-brand-border/60 bg-brand-surface/50 relative border-b">
      <div className="bg-brand-ruled absolute inset-0 opacity-[0.15]" aria-hidden />

      <div className="relative mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <header className="mb-16 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-2">
            <div className="editorial-marker">
              <span className="text-brand-primary">§03</span>
              <span>Invariants</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="font-display text-display-md font-bold">
              Four things Nexa will{' '}
              <span className="text-brand-primary font-serif font-normal italic">never</span> do.
            </h2>
            <p className="text-brand-muted-strong mt-4 max-w-2xl">
              Invariants live in code and tests, not marketing. Each one below corresponds to a file
              in the repo and a regression test that fails if it breaks.
            </p>
          </div>
        </header>

        <div className="bg-brand-border/60 grid grid-cols-1 gap-px overflow-hidden rounded-2xl md:grid-cols-2">
          {INVARIANTS.map(({ number, title, body, tag, Icon }) => (
            <div
              key={number}
              className="bg-brand-bg hover:bg-brand-elevated group relative p-8 transition-colors md:p-10"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-brand-primary text-3xl font-bold">
                      {number}
                    </span>
                    <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
                      {tag}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="text-brand-muted-strong mt-3">{body}</p>
                </div>
                <div className="border-brand-border/70 bg-brand-bg/50 group-hover:border-brand-primary/50 group-hover:text-brand-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
