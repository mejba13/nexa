'use client';

import type { BacktestResult } from '@/lib/trading-types';

import { DrawdownChart } from './drawdown-chart';
import { EquityCurve } from './equity-curve';
import { MetricCard } from './metric-card';

interface BacktestSummaryProps {
  result: BacktestResult;
}

const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
const usd = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function BacktestSummary({ result }: BacktestSummaryProps) {
  const m = result.metrics;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Total return"
          value={pct(m.totalReturnPct)}
          sub={`${usd(m.initialCapital)} → ${usd(m.finalCapital)}`}
          tone={m.totalReturnPct >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Win rate"
          value={pct(m.winRate * 100)}
          sub={`${m.totalTrades} trades`}
          tone={m.winRate >= 0.5 ? 'positive' : 'default'}
        />
        <MetricCard label="Max drawdown" value={pct(m.maxDrawdownPct)} tone="negative" />
        <MetricCard
          label="Sharpe"
          value={m.sharpeRatio === null ? '—' : m.sharpeRatio.toFixed(2)}
          sub="annualized (252)"
          tone="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EquityCurve result={result} />
        </div>
        <DrawdownChart result={result} />
      </div>

      {result.trades.length > 0 && (
        <div className="border-brand-border bg-brand-elevated rounded-xl border p-4">
          <header className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-sm font-semibold">Trade log</h3>
            <span className="text-brand-muted font-mono text-xs">
              Avg win {pct(m.avgWinPct)} · Avg loss {pct(m.avgLossPct)} · PF{' '}
              {m.profitFactor.toFixed(2)}
            </span>
          </header>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-brand-elevated text-brand-muted sticky top-0">
                <tr>
                  <th className="py-1 pr-2">Entry</th>
                  <th className="py-1 pr-2">Exit</th>
                  <th className="py-1 pr-2 text-right">Entry $</th>
                  <th className="py-1 pr-2 text-right">Exit $</th>
                  <th className="py-1 pr-2 text-right">PnL %</th>
                </tr>
              </thead>
              <tbody>
                {result.trades.map((t, i) => (
                  <tr key={i} className="border-brand-border/40 border-t">
                    <td className="py-1 pr-2">{t.entryTime.slice(0, 10)}</td>
                    <td className="py-1 pr-2">{t.exitTime.slice(0, 10)}</td>
                    <td className="py-1 pr-2 text-right">{t.entryPrice.toFixed(2)}</td>
                    <td className="py-1 pr-2 text-right">{t.exitPrice.toFixed(2)}</td>
                    <td
                      className={
                        'py-1 pr-2 text-right ' +
                        (t.win ? 'text-brand-success' : 'text-brand-danger')
                      }
                    >
                      {t.pnlPct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
