import { DashboardSidebar } from './_components/sidebar';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);

// Dashboard routes are fully dynamic — they depend on the signed-in user +
// live API calls. Prerendering them at build would require a mounted
// ClerkProvider + API, which isn't available in the CI build step.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text flex min-h-screen">
      <DashboardSidebar clerkReady={clerkReady} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
