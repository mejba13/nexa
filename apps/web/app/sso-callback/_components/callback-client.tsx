'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);

export function CallbackClient() {
  if (!clerkReady) return null;
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  );
}
