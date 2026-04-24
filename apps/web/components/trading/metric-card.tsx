import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'positive' | 'negative' | 'primary';
}

export function MetricCard({ label, value, sub, tone = 'default' }: MetricCardProps) {
  return (
    <div className="border-brand-border bg-brand-elevated rounded-xl border p-4">
      <div className="text-brand-muted text-[11px] uppercase tracking-wider">{label}</div>
      <div
        className={cn(
          'font-display mt-1 text-2xl font-semibold tabular-nums',
          tone === 'positive' && 'text-brand-success',
          tone === 'negative' && 'text-brand-danger',
          tone === 'primary' && 'text-brand-primary',
        )}
      >
        {value}
      </div>
      {sub && <div className="text-brand-muted mt-1 text-xs">{sub}</div>}
    </div>
  );
}
