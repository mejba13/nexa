/**
 * Editorial trust strip under the hero. Not a marquee — a deliberate grid of
 * verifiable facts. Each item has a mono label + display number so it reads
 * like newsprint statistics box, not a slapdash logo wall.
 */
const STATS = [
  { label: 'Agents', value: '04', sub: 'specialized' },
  { label: 'Tools', value: '24', sub: 'per session' },
  { label: 'Context', value: '1M', sub: 'tokens · Opus 4.7' },
  { label: 'Latency', value: '<2s', sub: 'first token' },
  { label: 'Isolation', value: 'RLS', sub: 'per user · per agent' },
];

export function StatStrip() {
  return (
    <div className="border-brand-border/60 bg-brand-surface/60 relative border-t">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-0 px-6 md:grid-cols-5">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`border-brand-border/60 py-6 ${
              i > 0 ? 'md:border-l' : ''
            } ${i >= 2 ? 'border-t md:border-t-0' : ''}`}
          >
            <div className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
              {s.label}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-brand-text text-3xl font-semibold tabular-nums">
                {s.value}
              </span>
              <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
                {s.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
