import { Logo } from '@/components/brand/logo';

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
        <div className="mb-8 inline-flex">
          <Logo size="lg" asLink={false} />
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
