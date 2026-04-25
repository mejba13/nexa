import Link from 'next/link';
import { Check } from 'lucide-react';

import { BrandPanel } from '../../_components/brand-panel';
import { DemoAuthForm } from '../../_components/demo-auth-form';
import { EditorialAuthForm } from '../../_components/editorial-auth-form';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);

const PERKS = [
  '100,000 tokens per month',
  'All 4 agents · 24 tools',
  '10 knowledge-base files',
  'No card required',
];

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { clerk_not_configured?: string; plan?: string };
}) {
  const redirected = Boolean(searchParams.clerk_not_configured);
  const plan = searchParams.plan;

  return (
    <>
      {/* ================= BRAND PANEL (left on desktop) ================= */}
      <aside className="relative col-span-12 hidden lg:col-span-7 lg:block">
        <BrandPanel
          eyebrow={plan ? `Sign up · ${plan}` : 'Sign up · 2026'}
          headline={
            <>
              Your AI team,
              <br />
              <span className="text-brand-muted-strong font-serif font-normal italic">
                ready in
              </span>{' '}
              <span className="text-gradient-brand">two minutes</span>.
            </>
          }
          pullquote={
            <>
              Four specialized Claude agents — Trading, Content, Life Coach, Music — with{' '}
              <em>isolated</em> memory, custom tools, and{' '}
              <span className="text-brand-primary">real-time streaming</span>.
            </>
          }
          stats={[
            { label: 'Free tokens', value: '100k', sub: 'per month' },
            { label: 'Agents', value: '04', sub: 'from day 1' },
            { label: 'Setup', value: '2min', sub: 'including signup' },
          ]}
          footer={
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="tracking-editorial-wide text-brand-muted-strong flex items-center gap-2 font-mono text-[10px] uppercase"
                >
                  <Check className="text-brand-primary h-3 w-3 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          }
        />
      </aside>

      {/* ================= AUTH FORM (right on desktop) ================= */}
      <section className="bg-brand-surface/40 relative col-span-12 flex min-h-screen flex-col justify-between lg:col-span-5">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="bg-orange-glow absolute inset-0 opacity-60" />
          <div className="bg-grain absolute inset-0" />
        </div>

        {/* Top bar */}
        <header className="border-brand-border/60 relative z-10 flex items-center justify-between border-b px-6 py-5 lg:border-none lg:px-10 lg:py-8">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
            <span className="font-display text-lg font-semibold">Nexa</span>
          </Link>
          <div className="hidden lg:block">
            <div className="editorial-marker">
              <span className="text-brand-primary">§</span>
              <span>Get started</span>
            </div>
          </div>
          <div className="tracking-editorial-wide text-brand-muted flex items-center gap-3 font-mono text-[10px] uppercase">
            <span>Already in?</span>
            <Link
              href="/sign-in"
              className="text-brand-primary link-underline hover:text-brand-accent"
            >
              Sign in →
            </Link>
          </div>
        </header>

        {/* Form body */}
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-md">
            {plan && plan !== 'FREE' && (
              <div className="border-brand-primary/30 bg-brand-primary/10 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1">
                <span className="bg-brand-primary h-1.5 w-1.5 rounded-full" />
                <span className="tracking-editorial-wide text-brand-primary font-mono text-[10px] uppercase">
                  Upgrading to {plan} after sign-up
                </span>
              </div>
            )}
            {clerkReady ? (
              <EditorialAuthForm
                mode="sign-up"
                redirectTo={plan ? `/billing?plan=${plan}` : '/dashboard'}
              />
            ) : (
              <DemoAuthForm mode="sign-up" redirected={redirected} />
            )}

            {/* Perks row on mobile only — desktop has the BrandPanel footer */}
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2 lg:hidden">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="tracking-editorial-wide text-brand-muted-strong flex items-center gap-2 font-mono text-[10px] uppercase"
                >
                  <Check className="text-brand-primary h-3 w-3 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </main>

        <footer className="border-brand-border/60 relative z-10 border-t px-6 py-4 lg:px-10">
          <p className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
            By creating an account, you agree to our{' '}
            <span className="text-brand-muted-strong link-underline">Terms</span> and{' '}
            <span className="text-brand-muted-strong link-underline">Privacy Policy</span>.
          </p>
        </footer>
      </section>
    </>
  );
}
