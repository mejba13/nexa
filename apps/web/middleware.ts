import { NextResponse, type NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/about',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
]);

/**
 * Clerk publishable keys start with `pk_test_` or `pk_live_` followed by a
 * non-trivial base64-ish payload. When the env var is absent or still the
 * placeholder (`pk_test_REPLACE_ME`), we short-circuit auth so the landing
 * page renders during local setup — protected routes 302 to /sign-in so the
 * operator knows they haven't finished configuring Clerk yet.
 */
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);
const devAuth = process.env.NEXT_PUBLIC_DEV_AUTH === '1' && process.env.NODE_ENV !== 'production';

const clerkGate = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

function fallbackGate(req: NextRequest) {
  if (isPublicRoute(req)) return NextResponse.next();
  const signIn = new URL('/sign-in', req.url);
  signIn.searchParams.set('clerk_not_configured', '1');
  return NextResponse.redirect(signIn);
}

function devOpenGate(_req: NextRequest) {
  // DEV_AUTH=1 — every route reachable, the API impersonates the seed admin.
  return NextResponse.next();
}

export default devAuth ? devOpenGate : clerkReady ? clerkGate : fallbackGate;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
