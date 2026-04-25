/**
 * Dev-only auth bypass.
 *
 * When NEXT_PUBLIC_DEV_AUTH=1 is set in apps/web/.env.local AND we're not in
 * production, the web app skips Clerk entirely and impersonates the seed
 * admin (user_seed_mejba). The companion DEV_AUTH=1 flag on the API side
 * makes every request authenticate as the same user. Together these let an
 * operator hit /dashboard, /admin, and every agent surface without ever
 * touching the Clerk dashboard — strictly for local development.
 *
 * NEVER enable in production. The check below requires both the env flag and
 * NODE_ENV !== 'production'; the middleware also short-circuits only in dev.
 */

export const DEV_AUTH =
  process.env.NEXT_PUBLIC_DEV_AUTH === '1' && process.env.NODE_ENV !== 'production';

export const DEV_USER = {
  clerkId: 'user_seed_mejba',
  email: 'mejba@nexa.com',
  firstName: 'Mejba',
  lastName: 'Ahmed',
  fullName: 'Engr. Mejba Ahmed',
  imageUrl: '',
  role: 'admin' as const,
} as const;

/** Stable sentinel used as a JWT placeholder. The API guard ignores it
 *  entirely when DEV_AUTH=1 — never sent to a real Clerk verification path. */
export const DEV_TOKEN = 'dev-auth-token';
