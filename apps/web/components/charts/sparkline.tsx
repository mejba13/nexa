'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface Props {
  data: ReadonlyArray<number>;
  height?: number;
  /** Hex/CSS color for the stroke + gradient. Defaults to brand orange. */
  color?: string;
  className?: string;
}

/**
 * Tiny inline sparkline. No axes, no tooltip, no legend — just the line.
 * Reads better in tight UI contexts (cards, table cells, sidebar widgets)
 * than a full chart. Pairs with editorial usage strips on dashboard/billing.
 */
export function Sparkline({ data, height = 40, color = '#FF9100', className }: Props) {
  const series = data.map((v, i) => ({ i, v }));
  const id = `spark-${data.length}-${data[0] ?? 0}`;
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
