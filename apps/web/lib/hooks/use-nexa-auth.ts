'use client';

import { useAuth, useUser } from '@clerk/nextjs';

import { DEV_AUTH, DEV_TOKEN, DEV_USER } from '../dev-auth';

interface NexaAuthResult {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Display-friendly user fields, populated whenever the session is loaded. */
  user: {
    firstName: string | null;
    fullName: string | null;
    email: string | null;
    imageUrl: string | null;
  } | null;
}

const DEV_RESULT: NexaAuthResult = {
  isLoaded: true,
  isSignedIn: true,
  userId: DEV_USER.clerkId,
  getToken: async () => DEV_TOKEN,
  signOut: async () => {
    if (typeof window !== 'undefined') window.location.assign('/');
  },
  user: {
    firstName: DEV_USER.firstName,
    fullName: DEV_USER.fullName,
    email: DEV_USER.email,
    imageUrl: null,
  },
};

/**
 * Combined Clerk wrapper. Provides everything the dashboard needs in one
 * call: auth state, JWT for the API, and the user profile. Falls back to
 * the seed admin when DEV_AUTH=1.
 *
 * `DEV_AUTH` is a module-level constant evaluated at startup, so the early
 * return below is stable across the entire process — Clerk's hooks are
 * either always called or never called for a given build, satisfying the
 * rules-of-hooks contract about consistent ordering.
 */
export function useNexaAuth(): NexaAuthResult {
  if (DEV_AUTH) return DEV_RESULT;

  // DEV_AUTH is a module-level constant evaluated at build/start; the early
  // return above is stable across the entire process so hook order is
  // consistent within any given build. Disable the lint warning here.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkAuth = useAuth();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const clerkUser = useUser();
  const u = clerkUser.user;
  return {
    isLoaded: clerkAuth.isLoaded && clerkUser.isLoaded,
    isSignedIn: Boolean(clerkAuth.isSignedIn),
    userId: clerkAuth.userId ?? null,
    getToken: () => clerkAuth.getToken(),
    signOut: async () => {
      await clerkAuth.signOut();
    },
    user: u
      ? {
          firstName: u.firstName ?? null,
          fullName: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
          email: u.primaryEmailAddress?.emailAddress ?? null,
          imageUrl: u.imageUrl ?? null,
        }
      : null,
  };
}
