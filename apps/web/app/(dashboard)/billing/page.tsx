'use client';

import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { billingApi, type PlanRow } from '@/lib/billing';
import { cn } from '@/lib/utils';

const FEATURE_NOTES: Record<PlanRow['plan'], string[]> = {
  FREE: ['100k tokens / month', '1 active agent', '10 files'],
  STARTER: ['1M tokens / month', '2 agents', '50 files', 'Priority email support'],
  PRO: ['5M tokens / month', 'All 4 agents', '500 files', 'Faster model fallback'],
  BUSINESS: ['20M tokens / month', 'All agents', 'Unlimited files', 'Dedicated support'],
};

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

  return (
    <div className="mx-auto max-w-6xl px-8 py-12">
      <h1 className="font-display text-4xl font-semibold">Billing</h1>
      <p className="text-brand-muted mt-2">
        Choose the plan that matches your usage. Upgrade or downgrade anytime via the customer
        portal.
      </p>

      {usage && (
        <section className="border-brand-border bg-brand-elevated mt-8 rounded-2xl border p-6">
          <header className="flex items-baseline justify-between">
            <div>
              <p className="text-brand-muted text-xs uppercase tracking-wider">Current plan</p>
              <h2 className="font-display text-brand-primary text-2xl font-semibold">
                {usage.plan}
              </h2>
            </div>
            {usage.plan !== 'FREE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Manage subscription
              </Button>
            )}
          </header>

          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-brand-muted">Tokens this month</span>
              <span className="font-mono">
                {usage.tokensUsed.toLocaleString()} / {usage.tokensLimit.toLocaleString()}
              </span>
            </div>
            <div className="bg-brand-bg mt-2 h-2 overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  usagePct >= 100 ? 'bg-brand-danger' : 'bg-brand-primary',
                )}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        </section>
      )}

      <section className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans?.map((p) => {
          const isCurrent = usage?.plan === p.plan;
          const monthly = p.limits.priceUsd;
          return (
            <article
              key={p.plan}
              className={cn(
                'bg-brand-elevated flex flex-col rounded-2xl border p-6',
                isCurrent ? 'border-brand-primary/60' : 'border-brand-border',
              )}
            >
              <header>
                <h3 className="font-display text-xl font-semibold">{p.plan}</h3>
                <p className="text-brand-text mt-1 text-2xl font-semibold">
                  ${monthly}
                  <span className="text-brand-muted text-sm">/mo</span>
                </p>
              </header>
              <ul className="text-brand-muted mt-4 flex-1 space-y-2 text-sm">
                {FEATURE_NOTES[p.plan].map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <Check className="text-brand-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                disabled={isCurrent || p.plan === 'FREE' || checkout.isPending || !p.priceId}
                variant={isCurrent ? 'outline' : 'default'}
                onClick={() =>
                  p.plan !== 'FREE' && checkout.mutate(p.plan as Exclude<PlanRow['plan'], 'FREE'>)
                }
              >
                {isCurrent
                  ? 'Current plan'
                  : p.plan === 'FREE'
                    ? 'Default'
                    : !p.priceId
                      ? 'Not configured'
                      : 'Upgrade'}
              </Button>
            </article>
          );
        })}
      </section>

      {checkout.isError && (
        <p className="text-brand-danger mt-4 text-sm">
          Checkout failed: {(checkout.error as Error).message}
        </p>
      )}
    </div>
  );
}
