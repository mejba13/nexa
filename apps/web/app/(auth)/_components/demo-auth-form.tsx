'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Eye, EyeOff, KeyRound } from 'lucide-react';

type Mode = 'sign-in' | 'sign-up';

interface Props {
  mode: Mode;
  redirected?: boolean;
}

/**
 * Pixel-identical preview of the editorial auth form rendered when Clerk
 * is not configured. Inputs are real (uncontrolled), submit shows an inline
 * notice instead of attempting auth, plus a collapsible setup helper.
 */
export function DemoAuthForm({ mode, redirected }: Props) {
  const [showPw, setShowPw] = useState(false);
  const [showHelp, setShowHelp] = useState(Boolean(redirected));
  const [submitted, setSubmitted] = useState(false);

  const isSignUp = mode === 'sign-up';

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setShowHelp(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="editorial-marker mb-3">
          <span className="text-brand-primary">§</span>
          <span>{isSignUp ? 'New here · 1 of 2' : 'Returning'}</span>
        </div>
        <h2 className="font-display text-brand-text text-3xl font-bold">
          {isSignUp ? 'Create your account.' : 'Sign in to Nexa.'}
        </h2>
        <p className="text-brand-muted-strong mt-2 text-sm">
          {isSignUp
            ? '100k tokens free every month · no card · cancel from the customer portal anytime.'
            : 'Continue where you left off — your agents and memory remain intact.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DemoOAuthButton provider="google" onClick={() => setShowHelp(true)} />
        <DemoOAuthButton provider="github" onClick={() => setShowHelp(true)} />
      </div>

      <Divider label="or with email" />

      {(submitted || redirected) && (
        <DemoNotice expanded={showHelp} onToggle={() => setShowHelp((s) => !s)} />
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignUp && (
          <Field label="First name" id="firstName">
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Maya"
              className={inputCls}
            />
          </Field>
        )}

        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@studio.com"
            className={inputCls}
          />
        </Field>

        <Field
          label="Password"
          id="password"
          aside={
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="text-brand-muted hover:text-brand-text tracking-editorial-wide inline-flex items-center gap-1 font-mono text-[10px] uppercase transition-colors"
            >
              {showPw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showPw ? 'Hide' : 'Show'}
            </button>
          }
        >
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            placeholder={isSignUp ? 'At least 8 characters' : '••••••••'}
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          className="bg-brand-text text-brand-bg hover:bg-brand-primary group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-3 font-medium transition-all"
        >
          <span className="flex items-center gap-2">
            {isSignUp ? 'Create account' : 'Sign in'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </form>
    </div>
  );
}

// =============================================================================
// SHARED PRIMITIVES (kept local so the demo + functional forms can drift safely)
// =============================================================================

const inputCls =
  'w-full rounded-lg border border-brand-border bg-brand-bg/60 px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted/60 transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20';

function Field({
  label,
  id,
  aside,
  children,
}: {
  label: string;
  id: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={id}
          className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase"
        >
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-brand-border h-px flex-1" />
      <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
        {label}
      </span>
      <span className="bg-brand-border h-px flex-1" />
    </div>
  );
}

function DemoNotice({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border-brand-primary/30 bg-brand-primary/5 rounded-xl border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <KeyRound className="text-brand-primary h-4 w-4 shrink-0" />
          <div>
            <div className="text-brand-primary text-sm font-medium">Demo mode — auth not wired</div>
            <p className="text-brand-muted-strong mt-0.5 text-xs">
              Paste your Clerk keys into <code className="font-mono">apps/web/.env.local</code> to
              enable real sign-in.
            </p>
          </div>
        </div>
        <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
          {expanded ? 'Hide' : 'How'}
        </span>
      </button>

      {expanded && (
        <div className="border-brand-primary/20 space-y-3 border-t px-4 py-3 text-xs">
          <ol className="text-brand-muted-strong space-y-2">
            <li>
              <span className="text-brand-primary mr-2 font-mono">01</span>
              Create a free dev project at{' '}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-primary link-underline"
              >
                dashboard.clerk.com
              </a>
            </li>
            <li>
              <span className="text-brand-primary mr-2 font-mono">02</span>
              Enable Email + Google + GitHub providers
            </li>
            <li>
              <span className="text-brand-primary mr-2 font-mono">03</span>
              Copy the Publishable + Secret keys into{' '}
              <code className="text-brand-text font-mono">apps/web/.env.local</code>
            </li>
            <li>
              <span className="text-brand-primary mr-2 font-mono">04</span>
              Restart <code className="text-brand-text font-mono">pnpm dev</code> — the form goes
              live
            </li>
          </ol>
          <Link
            href="https://dashboard.clerk.com"
            target="_blank"
            className="text-brand-primary hover:text-brand-accent tracking-editorial-wide inline-flex items-center gap-1 font-mono text-[10px] uppercase"
          >
            Open Clerk dashboard
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function DemoOAuthButton({
  provider,
  onClick,
}: {
  provider: 'google' | 'github';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-brand-border bg-brand-surface/60 text-brand-text hover:border-brand-primary/50 hover:bg-brand-elevated group inline-flex items-center justify-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm transition-all"
    >
      {provider === 'google' ? <GoogleGlyph /> : <GithubGlyph />}
      <span className="font-medium">{provider === 'google' ? 'Google' : 'GitHub'}</span>
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#FFC107"
        d="M22 12.27a11 11 0 0 0-.18-2H12v3.78h5.62a4.81 4.81 0 0 1-2.07 3.16v2.62h3.36A10.2 10.2 0 0 0 22 12.27Z"
      />
      <path
        fill="#FF3D00"
        d="M12 22a10 10 0 0 0 6.91-2.5l-3.36-2.62a6 6 0 0 1-9.04-3.18H3.05v2.7A10 10 0 0 0 12 22Z"
      />
      <path fill="#4CAF50" d="M6.51 13.7a6 6 0 0 1 0-3.4V7.6H3.05a10 10 0 0 0 0 8.8l3.46-2.7Z" />
      <path
        fill="#1976D2"
        d="M12 6.13a5.43 5.43 0 0 1 3.84 1.5l2.86-2.85A10 10 0 0 0 3.05 7.6l3.46 2.7A6 6 0 0 1 12 6.13Z"
      />
    </svg>
  );
}

function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.55.11-3.22 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.67.24 2.91.12 3.22.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z"
      />
    </svg>
  );
}
