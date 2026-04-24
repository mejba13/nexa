'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Check, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-8 py-12">
      <header className="mb-10">
        <div className="editorial-marker mb-3">
          <span className="text-brand-primary">§</span>
          <span>Settings</span>
        </div>
        <h1 className="font-display text-display-sm font-bold">Account</h1>
        <p className="text-brand-muted-strong mt-2">
          Profile and session settings. Billing lives at{' '}
          <a href="/billing" className="text-brand-primary link-underline">
            /billing
          </a>
          .
        </p>
      </header>

      <section className="border-brand-border bg-brand-elevated mb-8 rounded-2xl border p-6">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <dl className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
              Name
            </dt>
            <dd className="text-brand-text mt-1">{user?.fullName ?? '—'}</dd>
          </div>
          <div>
            <dt className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
              Email
            </dt>
            <dd className="text-brand-text mt-1 font-mono text-xs">
              {user?.primaryEmailAddress?.emailAddress ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
              Member since
            </dt>
            <dd className="text-brand-text mt-1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
          <div>
            <dt className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
              Clerk user id
            </dt>
            <dd className="text-brand-muted mt-1 truncate font-mono text-xs">{user?.id ?? '—'}</dd>
          </div>
        </dl>
        <p className="text-brand-muted mt-6 text-xs">
          Profile edits are managed via Clerk. Open your Clerk user menu to change name, avatar,
          password, or MFA.
        </p>
      </section>

      <section className="border-brand-border bg-brand-elevated mb-8 rounded-2xl border p-6">
        <h2 className="font-display text-lg font-semibold">Preferences</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center gap-3">
            <Check className="text-brand-primary h-4 w-4" />
            <span className="text-brand-muted-strong">
              Dark theme · <span className="text-brand-muted">(only theme for v1)</span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="text-brand-primary h-4 w-4" />
            <span className="text-brand-muted-strong">
              Streaming chat · <span className="text-brand-muted">token-by-token over SSE</span>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Check className="text-brand-primary h-4 w-4" />
            <span className="text-brand-muted-strong">
              Email notifications at 80% and 100% of monthly quota
            </span>
          </li>
        </ul>
      </section>

      <section className="border-brand-border bg-brand-elevated mb-8 rounded-2xl border p-6">
        <h2 className="font-display text-lg font-semibold">Data</h2>
        <p className="text-brand-muted-strong mt-2 text-sm">
          Export or delete all your data. Per-conversation Markdown export lives next to the
          conversation. Full-account export ships in v2.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" disabled>
            <ExternalLink className="h-3.5 w-3.5" /> Export all (v2)
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                typeof window !== 'undefined' &&
                confirm('Permanently delete your account + all data? This cannot be undone.')
              ) {
                // TODO: POST /auth/me DELETE once Clerk user-delete path is wired
              }
            }}
          >
            Delete account
          </Button>
        </div>
      </section>

      <section>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
