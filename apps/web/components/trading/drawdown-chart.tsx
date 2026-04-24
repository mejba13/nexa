'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { BacktestResult } from '@/lib/trading-types';

export function DrawdownChart({ result }: { result: BacktestResult }) {
  const data = result.equity.map((p) => ({
    t: p.t.slice(0, 10),
    drawdown: Number((p.drawdown * 100).toFixed(2)),
  }));

  return (
    <div className="border-brand-border bg-brand-elevated rounded-xl border p-4">
      <header className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold">Drawdown</h3>
        <span className="text-brand-danger font-mono text-xs">
          Max {result.metrics.maxDrawdownPct.toFixed(1)}%
        </span>
      </header>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dd" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="t" stroke="#8A8A8A" tick={{ fontSize: 10 }} minTickGap={24} />
            <YAxis stroke="#8A8A8A" tick={{ fontSize: 10 }} width={48} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #1F1F1F',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, 'Drawdown']}
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#EF4444"
              strokeWidth={1.5}
              fill="url(#dd)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
