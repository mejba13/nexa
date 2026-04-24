/**
 * Next.js calls register() on cold start. We forward to the env-appropriate
 * Sentry config so client/server/edge runtimes each get instrumented exactly
 * once. All three configs no-op when NEXT_PUBLIC_SENTRY_DSN is missing.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
