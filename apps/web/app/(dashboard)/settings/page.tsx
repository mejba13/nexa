'use client';

import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  Download,
  ExternalLink,
  Key,
  LogOut,
  Mail,
  Moon,
  Shield,
  Trash2,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';

export default function SettingsPage() {
  const { user, userId, signOut } = useNexaAuth();

  return (
    <div className="bg-brand-bg text-brand-text relative min-h-screen overflow-hidden">
      {/* Atmospheric backdrop */}
      <div className="bg-orange-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" />
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative mx-auto max-w-[1100px] px-8 py-10 lg:px-12">
        {/* ============================ HEADER ============================ */}
        <header className="border-brand-border/60 border-b pb-10">
          <div className="editorial-marker mb-4">
            <span className="text-brand-primary">§ Settings</span>
            <span className="bg-brand-border-strong h-px w-12" />
            <span>Account control</span>
          </div>
          <h1 className="font-display text-display-xs lg:text-display-sm font-bold leading-[1.04] tracking-[-0.025em]">
            Tune the{' '}
            <span className="text-brand-muted-strong font-serif font-normal italic">edges</span> of
            your <span className="text-gradient-brand">workspace</span>.
          </h1>
          <p className="text-brand-muted-strong mt-4 max-w-xl text-sm md:text-base">
            Profile basics, preferences, and data ownership. Billing lives at{' '}
            <a href="/billing" className="text-brand-primary link-underline">
              /billing
            </a>
            .
          </p>
        </header>

        {/* ============================ PROFILE + IDENTITY ============================ */}
        <section className="grid grid-cols-12 gap-6 py-10">
          {/* Avatar + name */}
          <article className="border-brand-border/60 ring-hairline bg-brand-surface/40 col-span-12 overflow-hidden rounded-2xl border p-7 lg:col-span-5">
            <div className="eyebrow mb-3">Profile</div>
            <div className="mt-2 flex items-center gap-4">
              <div className="bg-brand-primary/15 ring-brand-primary/30 text-brand-primary font-display inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold ring-1">
                {(user?.firstName?.[0] ?? 'M').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-2xl font-bold tracking-tight">
                  {user?.fullName ?? 'You'}
                </div>
                <div className="text-brand-muted mt-0.5 truncate font-mono text-xs">
                  {user?.email ?? '—'}
                </div>
              </div>
            </div>
            <div className="bg-brand-border-strong my-6 h-px w-full" />
            <p className="text-brand-muted-strong text-sm">
              Profile edits — name, avatar, password, MFA — are managed via Clerk&rsquo;s user menu
              in the sidebar. Email changes require verification.
            </p>
          </article>

          {/* Identity table */}
          <article className="border-brand-border/60 bg-brand-surface/40 col-span-12 overflow-hidden rounded-2xl border p-7 lg:col-span-7">
            <div className="eyebrow mb-3">Identity</div>
            <dl className="divide-brand-border/40 mt-3 divide-y">
              <IdentityRow icon={Mail} label="Primary email" value={user?.email ?? '—'} mono />
              <IdentityRow icon={Key} label="Clerk user id" value={userId ?? '—'} mono truncate />
              <IdentityRow
                icon={Shield}
                label="Auth provider"
                value="Clerk · 2FA-ready · SOC 2 Type II"
              />
              <IdentityRow icon={Clock} label="Region" value="iad-1 · low-latency" mono />
            </dl>
          </article>
        </section>

        {/* ============================ PREFERENCES ============================ */}
        <section className="py-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="editorial-marker mb-3">
                <span className="text-brand-primary">§ 01</span>
                <span>Preferences</span>
              </div>
              <h2 className="font-display text-2xl font-bold lg:text-3xl">
                Defaults baked into v1.
              </h2>
            </div>
            <span className="tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase">
              Read-only · v2 unlocks
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PreferenceCard
              icon={Moon}
              title="Dark theme"
              description="Only theme for v1. Light comes with v2."
              status="On"
            />
            <PreferenceCard
              icon={Zap}
              title="Streaming chat"
              description="Token-by-token over SSE — no polling."
              status="On"
            />
            <PreferenceCard
              icon={Bell}
              title="Quota alerts"
              description="Email at 80% and 100% of monthly quota."
              status="On"
            />
          </div>
        </section>

        {/* ============================ DATA ============================ */}
        <section className="py-12">
          <div className="mb-6">
            <div className="editorial-marker mb-3">
              <span className="text-brand-primary">§ 02</span>
              <span>Your data</span>
            </div>
            <h2 className="font-display text-2xl font-bold lg:text-3xl">Export or wipe.</h2>
            <p className="text-brand-muted-strong mt-2 max-w-xl text-sm">
              Per-conversation Markdown export ships next to each conversation. Full-account archive
              arrives in v2. Deletion is final and irreversible.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="border-brand-border/60 ring-hairline bg-brand-surface/40 rounded-2xl border p-6">
              <div className="bg-brand-elevated ring-hairline mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl">
                <Download className="text-brand-primary h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-semibold">Export everything</h3>
              <p className="text-brand-muted-strong mt-1 text-sm">
                A signed zip with every conversation, document, strategy, and journal entry — keyed
                by agent. Ships in v2.
              </p>
              <Button variant="outline" size="sm" disabled className="mt-4">
                <ExternalLink className="h-3.5 w-3.5" />
                Coming in v2
              </Button>
            </article>

            <article className="border-brand-primary/30 bg-brand-primary/5 rounded-2xl border p-6">
              <div className="bg-brand-primary/15 ring-brand-primary/30 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1">
                <AlertTriangle className="text-brand-primary h-4 w-4" />
              </div>
              <h3 className="font-display text-lg font-semibold">Danger zone</h3>
              <p className="text-brand-muted-strong mt-1 text-sm">
                Permanently delete your account, conversations, documents, strategies, journals, and
                KB embeddings. This cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    typeof window !== 'undefined' &&
                    confirm('Permanently delete your account + all data? This cannot be undone.')
                  ) {
                    // TODO: POST /auth/me DELETE once Clerk delete path is wired.
                  }
                }}
                className="mt-4"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete account
              </Button>
            </article>
          </div>
        </section>

        {/* ============================ FOOTER / SIGN OUT ============================ */}
        <section className="border-brand-border/60 flex flex-wrap items-center justify-between gap-4 border-t py-8">
          <div className="text-brand-muted-strong font-serif text-sm italic">
            &ldquo;Your agents and memory remain intact across sessions.&rdquo;
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </section>
      </div>
    </div>
  );
}

function IdentityRow({
  icon: Icon,
  label,
  value,
  mono,
  truncate,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="text-brand-muted h-4 w-4 shrink-0" />
        <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
          {label}
        </span>
      </div>
      <span
        className={`text-brand-text min-w-0 text-right text-sm ${mono ? 'font-mono text-xs' : ''} ${
          truncate ? 'truncate' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PreferenceCard({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <article className="border-brand-border/60 ring-hairline bg-brand-surface/40 hover:bg-brand-elevated/50 group rounded-2xl border p-5 transition-colors">
      <div className="flex items-start justify-between">
        <div className="bg-brand-elevated ring-hairline inline-flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon className="text-brand-primary h-4 w-4" />
        </div>
        <span className="tracking-editorial-wide bg-brand-primary/15 text-brand-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase">
          <Check className="h-2.5 w-2.5" />
          {status}
        </span>
      </div>
      <h3 className="font-display mt-4 text-base font-semibold">{title}</h3>
      <p className="text-brand-muted-strong mt-1 text-xs leading-relaxed">{description}</p>
    </article>
  );
}
