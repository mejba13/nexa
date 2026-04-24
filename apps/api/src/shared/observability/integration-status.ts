import { Logger } from '@nestjs/common';

/**
 * Print a one-glance integration health banner at boot. Each row shows whether
 * an env-driven optional integration is wired or running degraded. Required
 * services (DB, Redis, Clerk, Anthropic, OpenAI) are validated upstream by the
 * Zod env schema and will fail boot if missing — they don't need a row here.
 */
export function logIntegrationStatus(): void {
  const logger = new Logger('Integrations');

  const rows: Array<[string, string]> = [
    [
      'Stripe billing',
      has('STRIPE_SECRET_KEY') && has('STRIPE_WEBHOOK_SECRET') ? 'on' : 'OFF (paid plans disabled)',
    ],
    [
      'Stripe price catalogue',
      [
        has('STRIPE_PRICE_STARTER') ? 'STARTER' : null,
        has('STRIPE_PRICE_PRO') ? 'PRO' : null,
        has('STRIPE_PRICE_BUSINESS') ? 'BUSINESS' : null,
      ]
        .filter(Boolean)
        .join(', ') || 'OFF (no plans configured)',
    ],
    ['Cloudflare R2 storage', has('R2_ACCOUNT_ID') ? 'on' : 'OFF (file uploads will fail)'],
    ['Langfuse tracing', has('LANGFUSE_SECRET_KEY') && has('LANGFUSE_PUBLIC_KEY') ? 'on' : 'off'],
    ['Sentry error tracking', has('SENTRY_DSN') ? 'on' : 'off'],
    ['PostHog analytics', has('POSTHOG_KEY') ? 'on' : 'off'],
    [
      'Spotify (Music agent)',
      has('SPOTIFY_CLIENT_ID') && has('SPOTIFY_CLIENT_SECRET') ? 'on' : 'off',
    ],
    ['Freesound (Music agent)', has('FREESOUND_API_KEY') ? 'on' : 'off'],
  ];

  const labelWidth = Math.max(...rows.map(([label]) => label.length));
  for (const [label, value] of rows) {
    logger.log(`${label.padEnd(labelWidth)}  ${value}`);
  }
}

function has(key: string): boolean {
  const v = process.env[key];
  return typeof v === 'string' && v.trim().length > 0;
}
