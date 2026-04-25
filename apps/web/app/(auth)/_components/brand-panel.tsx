import Link from 'next/link';
import { Compass, Music, PenTool, TrendingUp } from 'lucide-react';

interface BrandPanelProps {
  eyebrow: string;
  headline: React.ReactNode;
  pullquote?: React.ReactNode;
  stats?: Array<{ label: string; value: string; sub?: string }>;
  badges?: Array<{ label: string; Icon: typeof TrendingUp }>;
  footer?: React.ReactNode;
}

const DEFAULT_BADGES = [
  { label: 'Trading', Icon: TrendingUp },
  { label: 'Content', Icon: PenTool },
  { label: 'Coach', Icon: Compass },
  { label: 'Music', Icon: Music },
];

const DEFAULT_STATS = [
  { label: 'Agents', value: '04', sub: 'specialized' },
  { label: 'Tools', value: '24', sub: 'per session' },
  { label: 'Context', value: '1M', sub: 'tokens' },
];

/**
 * Left panel of the split-screen auth layout. Carries the brand without
 * upstaging the form. Matches the editorial spread from landing/pricing:
 * eyebrow → display headline → pull quote → stat row → agent badges.
 *
 * Desktop-only — stacks below the form on mobile via parent layout.
 */
export function BrandPanel({
  eyebrow,
  headline,
  pullquote,
  stats = DEFAULT_STATS,
  badges = DEFAULT_BADGES,
  footer,
}: BrandPanelProps) {
  return (
    <div className="border-brand-border/60 bg-brand-bg relative flex h-full min-h-screen flex-col justify-between overflow-hidden border-r p-10 lg:p-14">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-grid-dense absolute inset-0 opacity-30" />
        <div className="bg-orange-glow absolute inset-0 opacity-80" />
        <div className="bg-grain absolute inset-0" />
      </div>

      {/* Top rail */}
      <div className="relative z-10 flex items-start justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative inline-flex">
            <span className="bg-brand-primary shadow-glow h-2.5 w-2.5 rounded-full" />
            <span className="bg-brand-primary absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full opacity-40" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Nexa</span>
          <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
            · v0.1
          </span>
        </Link>
        <div className="editorial-marker">
          <span className="text-brand-primary">§</span>
          <span>{eyebrow}</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 py-12">
        <h1 className="font-display text-display-sm text-brand-text lg:text-display-md font-bold leading-[1.02]">
          {headline}
        </h1>

        {pullquote && (
          <blockquote className="mt-10 max-w-lg">
            <p className="text-brand-muted-strong font-serif text-xl italic leading-snug lg:text-2xl">
              {pullquote}
            </p>
            <footer className="tracking-editorial-wide text-brand-muted mt-4 flex items-center gap-3 font-mono text-[10px] uppercase">
              <span className="bg-brand-border-strong h-px w-8" />
              <span>Nexa · design principle</span>
            </footer>
          </blockquote>
        )}

        {/* Agent badges */}
        <div className="mt-12 flex flex-wrap gap-2">
          {badges.map(({ label, Icon }) => (
            <span
              key={label}
              className="border-brand-border bg-brand-surface/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur"
            >
              <Icon className="text-brand-primary h-3 w-3" />
              <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer stats */}
      <div className="border-brand-border/60 relative z-10 border-t pt-6">
        <div className="grid grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="tracking-editorial-wide text-brand-muted font-mono text-[9px] uppercase">
                {s.label}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-brand-text text-2xl font-bold tabular-nums">
                  {s.value}
                </span>
                {s.sub && (
                  <span className="tracking-editorial-wide text-brand-muted font-mono text-[9px] uppercase">
                    {s.sub}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
