import Link from 'next/link';
import { ArrowUpRight, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PLAN_LIMITS, PLANS, type Plan } from '@nexa/types';

const HIGHLIGHTS: Record<Plan, string[]> = {
  FREE: [
    'All 4 agents — read-only quota',
    'Bring-your-own API keys later',
    '10 knowledge-base files',
    'Community support',
  ],
  STARTER: [
    'Two agents active at once',
    '50 knowledge-base files',
    'Full RAG pipeline',
    'Email support · 24hr SLA',
  ],
  PRO: [
    'All 4 agents, no cap',
    '500 knowledge-base files',
    'Priority Claude model routing',
    'Email support · 4hr SLA',
  ],
  BUSINESS: [
    'Everything in Pro',
    'Unlimited files',
    'Dedicated support channel',
    'Admin dashboard + audit log',
  ],
};

const NOT_INCLUDED: Record<Plan, string[]> = {
  FREE: ['Billing portal', 'Custom tools'],
  STARTER: ['Priority model routing'],
  PRO: [],
  BUSINESS: [],
};

const FEATURES: Array<{
  label: string;
  values: Record<Plan, string | boolean>;
}> = [
  {
    label: 'Monthly tokens',
    values: {
      FREE: '100,000',
      STARTER: '1,000,000',
      PRO: '5,000,000',
      BUSINESS: '20,000,000',
    },
  },
  {
    label: 'Active agents',
    values: { FREE: '1', STARTER: '2', PRO: 'All 4', BUSINESS: 'All 4' },
  },
  {
    label: 'Knowledge base files',
    values: { FREE: '10', STARTER: '50', PRO: '500', BUSINESS: 'Unlimited' },
  },
  {
    label: 'Streaming chat',
    values: { FREE: true, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: 'Deterministic backtests',
    values: { FREE: true, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: 'Stripe customer portal',
    values: { FREE: false, STARTER: true, PRO: true, BUSINESS: true },
  },
  {
    label: 'Langfuse trace export',
    values: { FREE: false, STARTER: false, PRO: true, BUSINESS: true },
  },
  {
    label: 'Admin dashboard + CSV export',
    values: { FREE: false, STARTER: false, PRO: false, BUSINESS: true },
  },
  {
    label: 'Dedicated support channel',
    values: { FREE: false, STARTER: false, PRO: false, BUSINESS: true },
  },
];

export default function PricingPage() {
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
              <span>Pricing · 2026</span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h1 className="font-display text-display-lg font-bold leading-[0.92]">
              Pay for what
              <br />
              <span className="text-gradient-brand">you actually use.</span>
            </h1>
            <p className="text-brand-muted-strong mt-8 max-w-xl text-lg leading-relaxed">
              Token-metered monthly subscriptions. No seat fees, no usage spikes that surprise you —
              quotas are hard cutoffs, never soft overages.{' '}
              <strong className="text-brand-text">Cancel anytime</strong> from the Stripe customer
              portal.
            </p>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="border-brand-border/60 relative border-b py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="bg-brand-border/60 grid grid-cols-1 gap-px overflow-hidden rounded-2xl md:grid-cols-4">
            {(PLANS as readonly Plan[]).map((plan) => {
              const limits = PLAN_LIMITS[plan];
              const isPro = plan === 'PRO';
              return (
                <div
                  key={plan}
                  className={`bg-brand-bg flex flex-col p-8 transition-colors ${
                    isPro ? 'bg-brand-elevated' : 'hover:bg-brand-elevated'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="eyebrow mb-2">Plan</div>
                      <h3 className="font-display text-2xl font-bold">{plan}</h3>
                    </div>
                    {isPro && (
                      <span className="border-brand-primary/40 bg-brand-primary/10 tracking-editorial-wide text-brand-primary rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase">
                        Most popular
                      </span>
                    )}
                  </div>

                  <div className="mt-8 flex items-baseline gap-1">
                    <span className="font-display text-brand-text text-5xl font-bold tabular-nums">
                      ${limits.priceUsd}
                    </span>
                    <span className="text-brand-muted font-mono text-xs">/mo</span>
                  </div>
                  <p className="tracking-editorial-wide text-brand-muted mt-1 font-mono text-[10px] uppercase">
                    {limits.tokensPerMonth.toLocaleString()} tokens
                  </p>

                  <ul className="mt-8 flex-1 space-y-3">
                    {HIGHLIGHTS[plan].map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm">
                        <Check className="text-brand-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="text-brand-muted-strong">{h}</span>
                      </li>
                    ))}
                    {NOT_INCLUDED[plan].map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm opacity-60">
                        <X className="text-brand-muted mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="text-brand-muted line-through">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild className="mt-8 w-full" variant={isPro ? 'default' : 'outline'}>
                    <Link href={plan === 'FREE' ? '/sign-up' : `/sign-up?plan=${plan}`}>
                      {plan === 'FREE' ? 'Start free' : `Get ${plan.toLowerCase()}`}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compare */}
      <section className="border-brand-border/60 relative border-b py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <header className="mb-10 grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-2">
              <div className="editorial-marker">
                <span className="text-brand-primary">§02</span>
                <span>Compare</span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2 className="font-display text-display-sm font-bold">Feature by feature.</h2>
            </div>
          </header>

          <div className="border-brand-border overflow-hidden rounded-2xl border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-brand-border bg-brand-surface/60 border-b">
                  <th className="tracking-editorial-wide text-brand-muted px-6 py-4 font-mono text-[10px] uppercase">
                    Feature
                  </th>
                  {PLANS.map((plan) => (
                    <th
                      key={plan}
                      className="tracking-editorial-wide text-brand-muted px-6 py-4 font-mono text-[10px] uppercase"
                    >
                      {plan}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => (
                  <tr
                    key={f.label}
                    className={`${
                      i % 2 === 0 ? 'bg-brand-bg' : 'bg-brand-surface/30'
                    } border-brand-border/60 border-b last:border-b-0`}
                  >
                    <td className="text-brand-text px-6 py-4 text-sm">{f.label}</td>
                    {PLANS.map((plan) => {
                      const v = f.values[plan];
                      return (
                        <td key={plan} className="px-6 py-4 text-sm">
                          {typeof v === 'boolean' ? (
                            v ? (
                              <Check className="text-brand-primary h-4 w-4" />
                            ) : (
                              <X className="text-brand-muted/40 h-4 w-4" />
                            )
                          ) : (
                            <span className="text-brand-muted-strong font-mono tabular-nums">
                              {v}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-brand-border/60 relative border-b py-24">
        <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-6">
          <div className="col-span-12 md:col-span-4">
            <div className="editorial-marker mb-3">
              <span className="text-brand-primary">§03</span>
              <span>FAQ</span>
            </div>
            <h2 className="font-display text-display-sm font-bold leading-tight">
              Questions we
              <br />
              <span className="text-brand-muted-strong font-serif font-normal italic">
                get asked.
              </span>
            </h2>
          </div>
          <div className="col-span-12 md:col-span-8">
            <dl className="divide-brand-border divide-y">
              {[
                {
                  q: 'What happens if I hit my token limit?',
                  a: 'Your next chat message returns a 403 with a clear "quota exhausted" notice. Your historical data is never deleted. Upgrade mid-month and new requests flow immediately.',
                },
                {
                  q: 'Do I need my own Anthropic or OpenAI key?',
                  a: 'No. Tokens are metered from our pool. Bring-your-own-keys is on the roadmap for Pro+ so you can route through enterprise accounts.',
                },
                {
                  q: 'How is data isolated between users?',
                  a: 'Postgres row-level security on every user-owned table, plus tenant-scoped Cloudflare R2 keys. Every retrieval filters by userId AND agentType at the SQL layer.',
                },
                {
                  q: 'Can I cancel?',
                  a: 'Yes — the Stripe customer portal cancels instantly. Access continues through the paid period. Your data stays with you.',
                },
                {
                  q: 'Do you sell or train on my data?',
                  a: "Never. Your journals, brand guides, and conversations never leave your account. Anthropic's API does not train on our traffic.",
                },
              ].map((item) => (
                <div key={item.q} className="py-6">
                  <dt className="font-display text-brand-text text-lg font-semibold">{item.q}</dt>
                  <dd className="text-brand-muted-strong mt-2">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32">
        <div className="bg-orange-glow-bottom absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1400px] px-6 text-center">
          <h2 className="font-display text-display-md font-bold leading-[1]">
            Start with free.
            <br />
            <span className="text-gradient-brand">Upgrade when it pays for itself.</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up" className="group">
                Start free
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Link
              href="/about"
              className="tracking-editorial-wide text-brand-muted link-underline hover:text-brand-text font-mono text-xs uppercase"
            >
              How we built this →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
