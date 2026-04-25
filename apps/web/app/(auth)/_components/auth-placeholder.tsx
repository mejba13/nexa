import Link from 'next/link';
import { ArrowUpRight, Copy, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AuthPlaceholderProps {
  title: string;
  description: string;
  /** Query flag from middleware indicating a redirect happened. */
  redirected?: boolean;
}

const REQUIRED_KEYS = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'];

/**
 * Rendered in the auth column when Clerk isn't configured. Deliberately
 * informative — shows what to do next, not an apology. Stays on-brand
 * (same fonts, same orange accent) so the placeholder feels like a first-
 * class state of the app rather than an error.
 */
export function AuthPlaceholder({ title, description, redirected }: AuthPlaceholderProps) {
  return (
    <div className="w-full space-y-6">
      <div>
        <div className="editorial-marker mb-3">
          <span className="text-brand-primary">§</span>
          <span>Setup required</span>
        </div>
        <h2 className="font-display text-brand-text text-3xl font-bold">{title}</h2>
        <p className="text-brand-muted-strong mt-3">{description}</p>
      </div>

      {redirected && (
        <div className="border-brand-primary/30 bg-brand-primary/5 rounded-lg border px-4 py-3">
          <p className="text-brand-primary font-mono text-xs">
            You tried to reach a protected route. Finish the Clerk setup below to continue.
          </p>
        </div>
      )}

      <div className="border-brand-border bg-brand-surface/60 rounded-xl border p-5">
        <div className="eyebrow mb-3">1 · Create a Clerk project</div>
        <p className="text-brand-muted-strong text-sm">
          Dev instance is free. Click through at{' '}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noreferrer"
            className="text-brand-primary link-underline"
          >
            dashboard.clerk.com
          </a>
          , enable Google + GitHub, copy your Publishable + Secret keys.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="group">
            Open Clerk dashboard
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Button>
      </div>

      <div className="border-brand-border bg-brand-surface/60 rounded-xl border p-5">
        <div className="eyebrow mb-3">2 · Paste into apps/web/.env.local</div>
        <ul className="space-y-2.5">
          {REQUIRED_KEYS.map((k) => (
            <li
              key={k}
              className="border-brand-border/60 bg-brand-bg flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            >
              <code className="text-brand-text truncate font-mono text-xs">{k}</code>
              <Copy className="text-brand-muted h-3.5 w-3.5 shrink-0" />
            </li>
          ))}
        </ul>
        <p className="text-brand-muted mt-3 text-xs">
          Restart <code className="text-brand-primary font-mono">pnpm dev</code> after pasting.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to home</Link>
        </Button>
        <Link
          href="/about"
          className="tracking-editorial-wide text-brand-muted link-underline hover:text-brand-text font-mono text-[10px] uppercase"
        >
          <ExternalLink className="mr-1 inline h-3 w-3" />
          How it works
        </Link>
      </div>
    </div>
  );
}
