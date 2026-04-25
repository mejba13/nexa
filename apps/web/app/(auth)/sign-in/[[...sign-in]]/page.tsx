import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

import { AuthPlaceholder } from '../../_components/auth-placeholder';
import { BrandPanel } from '../../_components/brand-panel';
import { authAppearance } from '../../_components/clerk-appearance';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);

export default function SignInPage({
  searchParams,
}: {
  searchParams: { clerk_not_configured?: string };
}) {
  const redirected = Boolean(searchParams.clerk_not_configured);

  return (
    <>
      {/* ================= BRAND PANEL (left on desktop) ================= */}
      <aside className="relative col-span-12 hidden lg:col-span-7 lg:block">
        <BrandPanel
          eyebrow="Sign in · 2026"
          headline={
            <>
              Welcome back to
              <br />
              <span className="text-brand-muted-strong font-serif font-normal italic">
                your
              </span>{' '}
              <span className="text-gradient-brand">AI team</span>.
            </>
          }
          pullquote={
            <>
              Four agents. One workspace.{' '}
              <span className="text-brand-primary">Isolated memory</span>, custom tools, and
              real-time streaming — built on Claude.
            </>
          }
          footer={
            <div className="tracking-editorial-wide text-brand-muted-strong flex items-center gap-2 font-mono text-[10px] uppercase">
              <Sparkles className="text-brand-primary h-3 w-3" />
              <span>Picks up where you left off — every conversation, every agent.</span>
            </div>
          }
        />
      </aside>

      {/* ================= AUTH FORM (right on desktop) ================= */}
      <section className="bg-brand-surface/40 relative col-span-12 flex min-h-screen flex-col justify-between lg:col-span-5">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="bg-orange-glow absolute inset-0 opacity-60" />
          <div className="bg-grain absolute inset-0" />
        </div>

        <header className="border-brand-border/60 relative z-10 flex items-center justify-between border-b px-6 py-5 lg:border-none lg:px-10 lg:py-8">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
            <span className="font-display text-lg font-semibold">Nexa</span>
          </Link>
          <div className="hidden lg:block">
            <div className="editorial-marker">
              <span className="text-brand-primary">§</span>
              <span>Welcome back</span>
            </div>
          </div>
          <div className="tracking-editorial-wide text-brand-muted flex items-center gap-3 font-mono text-[10px] uppercase">
            <span>New here?</span>
            <Link
              href="/sign-up"
              className="text-brand-primary link-underline hover:text-brand-accent"
            >
              Create account →
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-md">
            {clerkReady ? (
              <>
                <div className="mb-8">
                  <h2 className="font-display text-brand-text text-3xl font-bold">
                    Sign in to Nexa.
                  </h2>
                  <p className="text-brand-muted-strong mt-2 text-sm">
                    Continue where you left off. Your agents and memory remain intact.
                  </p>
                </div>
                <SignIn
                  appearance={authAppearance}
                  signUpUrl="/sign-up"
                  forceRedirectUrl="/dashboard"
                />
              </>
            ) : (
              <AuthPlaceholder
                title="Finish the Clerk setup to sign in."
                description="Clerk handles sign-up, sign-in, sessions, and social providers. Two env keys and the form renders here."
                redirected={redirected}
              />
            )}
          </div>
        </main>

        <footer className="border-brand-border/60 relative z-10 border-t px-6 py-4 lg:px-10">
          <p className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
            Protected by Clerk · 2FA + passkeys · SOC 2 Type II
          </p>
        </footer>
      </section>
    </>
  );
}
