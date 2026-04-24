import { SignIn } from '@clerk/nextjs';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);

export default function SignInPage({
  searchParams,
}: {
  searchParams: { clerk_not_configured?: string };
}) {
  if (!clerkReady) {
    return (
      <main className="bg-brand-bg flex min-h-screen items-center justify-center px-6 py-16">
        <div className="border-brand-border bg-brand-elevated max-w-md rounded-2xl border p-8">
          <h1 className="font-display text-2xl font-semibold">Clerk not configured</h1>
          <p className="text-brand-muted mt-3 text-sm">
            Set{' '}
            <code className="bg-brand-bg text-brand-primary rounded px-1.5 py-0.5 font-mono text-xs">
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
            </code>{' '}
            and{' '}
            <code className="bg-brand-bg text-brand-primary rounded px-1.5 py-0.5 font-mono text-xs">
              CLERK_SECRET_KEY
            </code>{' '}
            in <code className="font-mono text-xs">apps/web/.env.local</code>, then restart the dev
            server.
          </p>
          <p className="text-brand-muted mt-3 text-xs">
            Get a free dev key at{' '}
            <a
              className="text-brand-primary underline"
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noreferrer"
            >
              dashboard.clerk.com
            </a>
            .
          </p>
          {searchParams.clerk_not_configured && (
            <p className="border-brand-border/60 bg-brand-bg/40 text-brand-muted mt-4 rounded-lg border p-3 text-xs">
              You were redirected here because you tried to access a protected route.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="bg-brand-bg flex min-h-screen items-center justify-center px-6 py-16">
      <SignIn appearance={{ elements: { rootBox: 'mx-auto' } }} />
    </main>
  );
}
