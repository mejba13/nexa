'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { isClerkAPIResponseError } from '@clerk/nextjs/errors';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

type Mode = 'sign-in' | 'sign-up';
type Stage = 'form' | 'verify';

interface Props {
  mode: Mode;
  /** Optional redirect after success. Defaults to /dashboard. */
  redirectTo?: string;
}

const SSO_REDIRECT = '/sso-callback';

/**
 * Custom Clerk-powered auth form. Replaces Clerk's drop-in <SignIn>/<SignUp>
 * widgets so the look matches the rest of the editorial system. Uses
 * @clerk/nextjs hooks for credential auth + OAuth round-trips.
 *
 * Sign-up is two-step: collect credentials → verify email code.
 */
export function EditorialAuthForm({ mode, redirectTo = '/dashboard' }: Props) {
  if (mode === 'sign-in') return <SignInForm redirectTo={redirectTo} />;
  return <SignUpForm redirectTo={redirectTo} />;
}

// =============================================================================
// SIGN-IN
// =============================================================================

function SignInForm({ redirectTo }: { redirectTo: string }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<false | 'submit' | 'google' | 'github'>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || busy) return;
    setError(null);
    setBusy('submit');
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.push(redirectTo);
      } else {
        setError('Additional verification required. Try the Clerk-hosted flow.');
      }
    } catch (err) {
      setError(extractErr(err) ?? 'Sign-in failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  async function onOAuth(provider: 'google' | 'github') {
    if (!isLoaded || busy) return;
    setError(null);
    setBusy(provider);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_github',
        redirectUrl: SSO_REDIRECT,
        redirectUrlComplete: redirectTo,
      });
    } catch (err) {
      setError(extractErr(err) ?? `${provider} sign-in failed.`);
      setBusy(false);
    }
  }

  return (
    <FormShell
      eyebrow="Returning"
      title="Sign in to Nexa."
      subtitle="Continue where you left off — your agents and memory remain intact."
      onOAuth={onOAuth}
      busy={busy}
      error={error}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </Field>

        {/* Clerk requires a CAPTCHA element exist for the request to succeed. */}
        <div id="clerk-captcha" />

        <SubmitButton busy={busy === 'submit'} label="Sign in" />
      </form>
    </FormShell>
  );
}

// =============================================================================
// SIGN-UP (two-step: form → verify code)
// =============================================================================

function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('form');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<false | 'submit' | 'google' | 'github' | 'verify'>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || busy) return;
    setError(null);
    setBusy('submit');
    try {
      await signUp.create({ firstName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStage('verify');
    } catch (err) {
      setError(extractErr(err) ?? 'Sign-up failed. Try a different email or stronger password.');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || busy) return;
    setError(null);
    setBusy('verify');
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.push(redirectTo);
      } else {
        setError('Verification did not complete. Check the code and try again.');
      }
    } catch (err) {
      setError(extractErr(err) ?? 'Invalid code.');
    } finally {
      setBusy(false);
    }
  }

  async function onOAuth(provider: 'google' | 'github') {
    if (!isLoaded || busy) return;
    setError(null);
    setBusy(provider);
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_github',
        redirectUrl: SSO_REDIRECT,
        redirectUrlComplete: redirectTo,
      });
    } catch (err) {
      setError(extractErr(err) ?? `${provider} sign-up failed.`);
      setBusy(false);
    }
  }

  if (stage === 'verify') {
    return (
      <div className="space-y-6">
        <div>
          <div className="editorial-marker mb-3">
            <span className="text-brand-primary">§</span>
            <span>Verify · 2 of 2</span>
          </div>
          <h2 className="font-display text-brand-text text-3xl font-bold">Check your inbox.</h2>
          <p className="text-brand-muted-strong mt-2 text-sm">
            We sent a 6-digit code to{' '}
            <span className="text-brand-text font-mono text-xs">{email}</span>. Paste it here to
            finish setting up your workspace.
          </p>
        </div>

        <form onSubmit={onVerify} className="space-y-4">
          <Field label="Verification code" id="code">
            <input
              id="code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••• •••"
              className={`${inputCls} text-center font-mono text-2xl tracking-[0.5em]`}
            />
          </Field>

          {error && <ErrorBanner message={error} />}

          <SubmitButton busy={busy === 'verify'} label="Verify & continue" />

          <button
            type="button"
            onClick={() => setStage('form')}
            className="text-brand-muted hover:text-brand-text tracking-editorial-wide font-mono text-[10px] uppercase transition-colors"
          >
            ← Back to form
          </button>
        </form>
      </div>
    );
  }

  return (
    <FormShell
      eyebrow="New here · 1 of 2"
      title="Create your account."
      subtitle="100k tokens free every month · no card · cancel from the customer portal anytime."
      onOAuth={onOAuth}
      busy={busy}
      error={error}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="First name" id="firstName">
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Maya"
            className={inputCls}
          />
        </Field>

        <Field label="Email" id="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputCls}
          />
        </Field>

        <div id="clerk-captcha" />

        <SubmitButton busy={busy === 'submit'} label="Create account" />
      </form>
    </FormShell>
  );
}

// =============================================================================
// SHARED PRIMITIVES
// =============================================================================

const inputCls =
  'w-full rounded-lg border border-brand-border bg-brand-bg/60 px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted/60 transition-all focus:border-brand-primary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20';

interface FormShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  onOAuth: (p: 'google' | 'github') => void;
  busy: false | 'submit' | 'google' | 'github' | 'verify';
  error: string | null;
  children: React.ReactNode;
}

function FormShell({ eyebrow, title, subtitle, onOAuth, busy, error, children }: FormShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="editorial-marker mb-3">
          <span className="text-brand-primary">§</span>
          <span>{eyebrow}</span>
        </div>
        <h2 className="font-display text-brand-text text-3xl font-bold">{title}</h2>
        <p className="text-brand-muted-strong mt-2 text-sm">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" onClick={() => onOAuth('google')} busy={busy === 'google'} />
        <OAuthButton provider="github" onClick={() => onOAuth('github')} busy={busy === 'github'} />
      </div>

      <Divider label="or with email" />

      {error && <ErrorBanner message={error} />}

      {children}
    </div>
  );
}

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

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="bg-brand-text text-brand-bg hover:bg-brand-primary disabled:bg-brand-muted group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-3 font-medium transition-all disabled:cursor-not-allowed"
    >
      <span className="relative z-10 flex items-center gap-2">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
        {!busy && (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
    </button>
  );
}

function OAuthButton({
  provider,
  onClick,
  busy,
}: {
  provider: 'google' | 'github';
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="border-brand-border bg-brand-surface/60 text-brand-text hover:border-brand-primary/50 hover:bg-brand-elevated group inline-flex items-center justify-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : provider === 'google' ? (
        <GoogleGlyph />
      ) : (
        <GithubGlyph />
      )}
      <span className="font-medium">{provider === 'google' ? 'Google' : 'GitHub'}</span>
    </button>
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border-brand-primary/30 bg-brand-primary/10 text-brand-primary rounded-lg border px-3 py-2 text-xs"
    >
      {message}
    </div>
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

function extractErr(err: unknown): string | null {
  if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage ?? err.errors[0]?.message ?? null;
  }
  if (err instanceof Error) return err.message;
  return null;
}
