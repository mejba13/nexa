import { z } from 'zod';

/**
 * Runtime env validation. Fails fast at boot if required secrets are missing.
 * Only validates keys the API actually reads — frontend-only keys live in apps/web.
 */
export const envValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  /** Comma-separated email allowlist auto-promoted to admin on first Clerk sync. */
  ADMIN_EMAILS: z.string().default(''),
  /**
   * Dev-only bypass — when '1', ClerkAuthGuard accepts every request as
   * the seed admin (clerkId=user_seed_mejba, role=admin). NEVER set this
   * in production. Companion to NEXT_PUBLIC_DEV_AUTH on the web side.
   */
  DEV_AUTH: z.enum(['0', '1']).default('0'),

  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_BUSINESS: z.string().optional(),

  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_HOST: z.string().url().optional(),

  SENTRY_DSN: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),

  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  FREESOUND_API_KEY: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envValidationSchema>;
