import { DashboardSidebar } from '../(dashboard)/_components/sidebar';

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const clerkReady = /^pk_(test|live)_[A-Za-z0-9]{16,}$/.test(publishableKey);

// Admin pages make live API calls + depend on signed-in role — can't prerender.
export const dynamic = 'force-dynamic';

/**
 * Admin layout reuses the dashboard sidebar so /admin sits inside the same
 * navigation shell as the rest of the app — no context switch when an
 * operator jumps between user-mode and admin-mode. Passing `isAdmin`
 * surfaces the Admin entry in the sidebar's account section.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text flex min-h-screen">
      <DashboardSidebar clerkReady={clerkReady} isAdmin />
      <main className="flex-1">{children}</main>
    </div>
  );
}
