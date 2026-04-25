import Link from 'next/link';

import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Tone = 'default' | 'inverse';

interface Props {
  size?: Size;
  tone?: Tone;
  /** Render as a Link to "/". Set false for in-page header positions. */
  asLink?: boolean;
  /** Append a small monospace tag after the wordmark (e.g. "v0.1"). */
  suffix?: string;
  className?: string;
  /** Hide the wordmark — useful for tight rails or icon-only contexts. */
  iconOnly?: boolean;
}

const SIZES: Record<
  Size,
  {
    mark: string;
    core: string;
    ring: string;
    word: string;
    suffix: string;
    gap: string;
  }
> = {
  sm: {
    mark: 'h-5 w-5',
    core: 'h-2 w-2',
    ring: 'h-5 w-5',
    word: 'text-base',
    suffix: 'text-[9px]',
    gap: 'gap-2',
  },
  md: {
    mark: 'h-7 w-7',
    core: 'h-2.5 w-2.5',
    ring: 'h-7 w-7',
    word: 'text-xl',
    suffix: 'text-[10px]',
    gap: 'gap-2.5',
  },
  lg: {
    mark: 'h-9 w-9',
    core: 'h-3 w-3',
    ring: 'h-9 w-9',
    word: 'text-2xl',
    suffix: 'text-[11px]',
    gap: 'gap-3',
  },
  xl: {
    mark: 'h-12 w-12',
    core: 'h-3.5 w-3.5',
    ring: 'h-12 w-12',
    word: 'text-3xl',
    suffix: 'text-xs',
    gap: 'gap-4',
  },
};

/**
 * Editorial Nexa logo. Concentric pulse: solid orange core + animated ping +
 * static hairline ring. The mark scales with `size`; the wordmark is set in
 * Google Sans Display with tight tracking. `tone="inverse"` swaps the wordmark
 * to brand-bg for use on light surfaces (none today, but kept future-proof).
 */
export function Logo({
  size = 'md',
  tone = 'default',
  asLink = true,
  suffix,
  className,
  iconOnly = false,
}: Props) {
  const s = SIZES[size];
  const wordTone = tone === 'inverse' ? 'text-brand-bg' : 'text-brand-text';
  const suffixTone = tone === 'inverse' ? 'text-brand-bg/60' : 'text-brand-muted';

  const inner = (
    <span className={cn('group inline-flex items-center', s.gap, className)}>
      <span className={cn('relative inline-flex shrink-0 items-center justify-center', s.mark)}>
        {/* Outer hairline ring — gives the dot a halo even when motion is reduced */}
        <span
          className={cn('border-brand-primary/40 absolute inset-0 rounded-full border', s.ring)}
        />
        {/* Pulsing aura */}
        <span
          className={cn(
            'bg-brand-primary absolute inset-0 animate-ping rounded-full opacity-25',
            s.ring,
          )}
        />
        {/* Solid core with brand glow */}
        <span className={cn('bg-brand-primary shadow-glow rounded-full', s.core)} />
      </span>
      {!iconOnly && (
        <span className={cn('font-display font-semibold tracking-[-0.02em]', wordTone, s.word)}>
          Nexa
        </span>
      )}
      {!iconOnly && suffix && (
        <span className={cn('tracking-editorial-wide font-mono uppercase', suffixTone, s.suffix)}>
          · {suffix}
        </span>
      )}
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link
      href="/"
      aria-label="Nexa — home"
      className="focus-visible:ring-brand-primary/40 focus-visible:ring-offset-brand-bg inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      {inner}
    </Link>
  );
}
