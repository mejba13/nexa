import { CallbackClient } from './_components/callback-client';

export const dynamic = 'force-dynamic';

/**
 * Landing target after a Clerk OAuth round-trip (Google / GitHub).
 * The client child completes the session, then Clerk redirects to /dashboard.
 */
export default function SSOCallbackPage() {
  return (
    <div className="bg-brand-bg text-brand-text flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="relative mx-auto mb-6 inline-flex">
          <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
          <span className="bg-brand-primary absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-40" />
        </div>
        <p className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
          Completing handshake…
        </p>
        <p className="text-brand-muted mt-2 font-serif text-sm italic">One moment.</p>
        <CallbackClient />
      </div>
    </div>
  );
}
