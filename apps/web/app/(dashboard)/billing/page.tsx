'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Check,
  CreditCard,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Sparkline } from '@/components/charts/sparkline';
import { Button } from '@/components/ui/button';
import { billingApi, type PlanRow } from '@/lib/billing';
import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { cn } from '@/lib/utils';

const FEATURE_NOTES: Record<PlanRow['plan'], string[]> = {
  FREE: ['100k tokens · monthly', '1 active agent', '10 KB files', 'No card required'],
  STARTER: ['1M tokens · monthly', '2 agents', '50 KB files', 'Email support'],
  PRO: ['5M tokens · monthly', 'All 4 agents', '500 KB files', 'Priority queue + Haiku fallback'],
  BUSINESS: ['20M tokens · monthly', 'All agents', 'Unlimited KB', 'Dedicated Slack channel'],
};

const PLAN_TAGLINE: Record<PlanRow['plan'], string> = {
  FREE: 'Try every agent. No card. No quota traps.',
  STARTER: 'For solo operators shipping nights and weekends.',
  PRO: 'For founders running their own AI team daily.',
  BUSINESS: 'For studios with multi-stakeholder workflows.',
};

function synthSeries(seed: number, length = 30): number[] {
  const s = Math.max(1, seed);
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin(i / 3) * 0.25 + Math.cos(i / 7) * 0.18;
    const drift = (i / length) * 0.6;
    return Math.max(0.05, 0.5 + wave + drift) * s;
  });
}

export default function BillingPage() {
  const { getToken } = useNexaAuth();

  const { data: plans } = useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => billingApi.plans(),
  });

  const { data: usage } = useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return billingApi.usage(token);
    },
  });

  const checkout = useMutation({
    mutationFn: async (plan: Exclude<PlanRow['plan'], 'FREE'>) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await billingApi.checkout(token, {
        plan,
        successUrl: `${origin}/billing?status=success`,
        cancelUrl: `${origin}/billing?status=cancelled`,
      });
      return res;
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const portal = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return billingApi.portal(token, `${origin}/billing`);
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const usagePct =
    usage && usage.tokensLimit > 0
      ? Math.min(100, Math.round((usage.tokensUsed / usage.tokensLimit) * 100))
      : 0;

  const sparkData = synthSeries(Math.max(usage?.tokensUsed ?? 8000, 8000));

  return (
    <div className="bg-brand-bg text-brand-text relative min-h-screen overflow-hidden">
      {/* Atmospheric backdrop */}
      <div className="bg-orange-glow pointer-events-none absolute inset-x-0 top-0 h-[480px]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-[1300px] px-8 py-10 lg:px-12">
        {/* ============================ HEADER ============================ */}
        <header className="border-brand-border/60 border-b pb-10">
          <div className="editorial-marker mb-4">
            <span className="text-brand-primary">§ Billing</span>
            <span className="bg-brand-border-strong h-px w-12" />
            <span>Plan + usage</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-display-xs lg:text-display-sm font-bold leading-[1.04] tracking-[-0.025em]">
                Pay for{' '}
                <span className="text-brand-muted-strong font-serif font-normal italic">
                  what you
                </span>{' '}
                <span className="text-gradient-brand">actually use</span>.
              </h1>
              <p className="text-brand-muted-strong mt-4 max-w-xl text-sm md:text-base">
                Tokens reset monthly. No card on FREE. Upgrade or downgrade anytime via the customer
                portal — your conversations and KB never leave your account.
              </p>
            </div>
            {usage?.plan && usage.plan !== 'FREE' && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                <ExternalLink className="h-4 w-4" />
                Manage subscription
              </Button>
            )}
          </div>
        </header>

        {/* ============================ CURRENT PLAN + USAGE ============================ */}
        {usage && (
          <section className="grid grid-cols-12 gap-5 py-10">
            {/* Plan card */}
            <article className="border-brand-border/60 ring-hairline bg-brand-surface/40 relative col-span-12 overflow-hidden rounded-2xl border p-7 lg:col-span-5">
              <div className="bg-orange-glow pointer-events-none absolute -right-32 -top-32 h-64 w-64 opacity-50" />
              <div className="relative">
                <div className="eyebrow mb-3">Current plan</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl font-bold tracking-[-0.03em] lg:text-6xl">
                    {usage.plan}
                  </span>
                  <span className="text-brand-muted-strong text-sm">tier</span>
                </div>
                <p className="text-brand-muted-strong mt-3 max-w-sm font-serif text-sm italic">
                  {PLAN_TAGLINE[usage.plan as PlanRow['plan']] ?? PLAN_TAGLINE.FREE}
                </p>

                <div className="bg-brand-border-strong my-6 h-px w-full" />

                <div className="grid grid-cols-3 gap-4">
                  <Stat label="This month" value={`${(usage.tokensUsed / 1000).toFixed(1)}k`} />
                  <Stat label="Limit" value={`${(usage.tokensLimit / 1000).toFixed(0)}k`} />
                  <Stat label="Used" value={`${usagePct}%`} highlight />
                </div>
              </div>
            </article>

            {/* Sparkline + bar */}
            <article className="border-brand-border/60 bg-brand-surface/40 col-span-12 overflow-hidden rounded-2xl border p-7 lg:col-span-7">
              <div className="flex items-start justify-between">
                <div>
                  <div className="eyebrow mb-2">Token consumption</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold tabular-nums">
                      {usage.tokensUsed.toLocaleString()}
                    </span>
                    <span className="text-brand-muted text-sm">
                      / {usage.tokensLimit.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-brand-muted-strong mt-1 text-xs">
                    Last 30 days · resets on the 1st
                  </p>
                </div>
                <span
                  className={`tracking-editorial-wide rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${
                    usagePct > 80
                      ? 'bg-brand-primary/15 text-brand-primary'
                      : 'bg-brand-elevated text-brand-muted-strong'
                  }`}
                >
                  {usagePct}%
                </span>
              </div>

              <div className="mt-6">
                <Sparkline data={sparkData} height={88} />
                <div className="bg-brand-elevated/80 relative mt-3 h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-700',
                      usagePct >= 100 ? 'bg-brand-danger' : 'bg-brand-primary',
                    )}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <div className="text-brand-muted-strong mt-3 flex items-center justify-between text-[10px] tabular-nums">
                  <span>30 days ago</span>
                  <span>today</span>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* ============================ PLAN COMPARISON ============================ */}
        <section className="py-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="editorial-marker mb-3">
                <span className="text-brand-primary">§ 01</span>
                <span>Tiers</span>
              </div>
              <h2 className="font-display text-3xl font-bold lg:text-4xl">
                Move when you outgrow.
              </h2>
            </div>
            <span className="tracking-editorial-wide text-brand-muted/60 hidden font-mono text-[10px] uppercase md:inline">
              Cancel anytime · prorated to the cycle
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans?.map((p, i) => {
              const isCurrent = usage?.plan === p.plan;
              const isFeatured = p.plan === 'PRO';
              return (
                <article
                  key={p.plan}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-2xl border p-6 transition-all',
                    isFeatured
                      ? 'border-brand-primary/40 bg-brand-surface/60 ring-hairline-strong'
                      : 'border-brand-border/60 bg-brand-surface/40',
                    !isCurrent && 'hover:border-brand-primary/30 hover:bg-brand-elevated/60',
                  )}
                >
                  {isFeatured && (
                    <span className="bg-brand-primary text-brand-bg tracking-editorial-wide absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase">
                      <Sparkles className="h-2.5 w-2.5" />
                      Most picked
                    </span>
                  )}

                  <header>
                    <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase tabular-nums">
                      §{String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display mt-2 text-2xl font-bold tracking-tight">
                      {p.plan}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold tabular-nums">
                        ${p.limits.priceUsd}
                      </span>
                      <span className="text-brand-muted text-sm">/ month</span>
                    </div>
                    <p className="text-brand-muted-strong mt-2 font-serif text-xs italic leading-snug">
                      {PLAN_TAGLINE[p.plan]}
                    </p>
                  </header>

                  <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                    {FEATURE_NOTES[p.plan].map((note) => (
                      <li key={note} className="flex items-start gap-2.5">
                        <Check className="text-brand-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="text-brand-muted-strong">{note}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-6 w-full"
                    disabled={isCurrent || p.plan === 'FREE' || checkout.isPending || !p.priceId}
                    variant={isCurrent ? 'outline' : isFeatured ? 'default' : 'outline'}
                    onClick={() =>
                      p.plan !== 'FREE' &&
                      checkout.mutate(p.plan as Exclude<PlanRow['plan'], 'FREE'>)
                    }
                  >
                    {isCurrent
                      ? 'Current plan'
                      : p.plan === 'FREE'
                        ? 'Default tier'
                        : !p.priceId
                          ? 'Coming soon'
                          : 'Upgrade'}
                    {!isCurrent && p.plan !== 'FREE' && p.priceId && (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </article>
              );
            })}
          </div>

          {checkout.isError && (
            <div className="border-brand-primary/30 bg-brand-primary/10 text-brand-primary mt-6 rounded-xl border px-4 py-3 text-sm">
              Checkout failed: {(checkout.error as Error).message}
            </div>
          )}
        </section>

        {/* ============================ INVARIANTS ============================ */}
        <section className="border-brand-border/60 grid grid-cols-1 gap-4 border-t py-10 md:grid-cols-3">
          <Invariant
            icon={CreditCard}
            title="Pay-as-you-grow"
            body="Upgrade prorated to the cycle. Downgrade applies on next renewal."
          />
          <Invariant
            icon={Zap}
            title="Hard cutoff"
            body="At 100% you stop, you don't pay overage. Email at 80% so you pick the moment."
          />
          <Invariant
            icon={TrendingUp}
            title="No lock-in"
            body="Export everything to Markdown anytime. Cancellation deletes within 30 days."
          />
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="tracking-editorial-wide text-brand-muted/60 font-mono text-[9px] uppercase">
        {label}
      </div>
      <div
        className={cn(
          'font-display mt-1 text-xl font-bold tabular-nums',
          highlight ? 'text-brand-primary' : 'text-brand-text',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Invariant({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <article className="border-brand-border/60 bg-brand-surface/40 rounded-2xl border p-5">
      <div className="bg-brand-elevated ring-hairline mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl">
        <Icon className="text-brand-primary h-4 w-4" />
      </div>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="text-brand-muted-strong mt-1 text-xs leading-relaxed">{body}</p>
    </article>
  );
}
