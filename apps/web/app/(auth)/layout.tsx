import Link from 'next/link';

/**
 * Split-screen shell for /sign-in and /sign-up.
 *
 * Desktop: left brand panel (7/12) + right auth column (5/12).
 * Mobile: stacks — brand panel first (abbreviated), auth form below.
 *
 * Each page owns its own BrandPanel copy + form; this layout just hangs
 * the grid + scaffolding that's shared.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-12">
        {children}
      </div>

      {/* Legal + auxiliary links along the very bottom */}
      <div className="border-brand-border/60 bg-brand-surface/40 border-t py-4">
        <div className="tracking-editorial-wide text-brand-muted mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 font-mono text-[10px] uppercase">
          <span>© {new Date().getFullYear()} Nexa</span>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-brand-text">
              About
            </Link>
            <Link href="/pricing" className="hover:text-brand-text">
              Pricing
            </Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
