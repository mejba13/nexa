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

interface EquityCurveProps {
  result: BacktestResult;
}

export function EquityCurve({ result }: EquityCurveProps) {
  const data = result.equity.map((p) => ({
    t: p.t.slice(0, 10),
    equity: Number(p.equity.toFixed(2)),
  }));

  return (
    <div className="border-brand-border bg-brand-elevated rounded-xl border p-4">
      <header className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold">Equity curve</h3>
        <span className="text-brand-muted font-mono text-xs">
          {result.metrics.startDate.slice(0, 10)} → {result.metrics.endDate.slice(0, 10)}
        </span>
      </header>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9100" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FF9100" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
            <XAxis dataKey="t" stroke="#8A8A8A" tick={{ fontSize: 10 }} minTickGap={24} />
            <YAxis stroke="#8A8A8A" tick={{ fontSize: 10 }} width={64} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #1F1F1F',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#8A8A8A' }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Equity']}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#FF9100"
              strokeWidth={2}
              fill="url(#equity)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
