import { auth, currentUser } from '@clerk/nextjs/server';

import { DEV_AUTH, DEV_TOKEN, DEV_USER } from './dev-auth';

/**
 * Server-side wrappers around Clerk's `auth()` and `currentUser()` that
 * fall back to the seed admin in DEV_AUTH mode. Lets server components
 * stay declarative without conditional imports of Clerk.
 */

export async function getAuthAware(): Promise<{
  userId: string | null;
  getToken: () => Promise<string | null>;
}> {
  if (DEV_AUTH) {
    return { userId: DEV_USER.clerkId, getToken: async () => DEV_TOKEN };
  }
  const a = auth();
  return {
    userId: a.userId ?? null,
    getToken: () => a.getToken(),
  };
}

export async function getCurrentUserAware(): Promise<{
  firstName: string | null;
  fullName: string | null;
  primaryEmail: string | null;
  imageUrl: string | null;
} | null> {
  if (DEV_AUTH) {
    return {
      firstName: DEV_USER.firstName,
      fullName: DEV_USER.fullName,
      primaryEmail: DEV_USER.email,
      imageUrl: null,
    };
  }
  const u = await currentUser();
  if (!u) return null;
  const primary = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId);
  return {
    firstName: u.firstName ?? null,
    fullName: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
    primaryEmail: primary?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? null,
    imageUrl: u.imageUrl ?? null,
  };
}
