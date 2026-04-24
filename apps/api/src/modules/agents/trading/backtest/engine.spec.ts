import { describe, expect, it } from 'vitest';

import { BacktestEngine } from './engine';
import type { Bar, StrategyRules } from './types';

const engine = new BacktestEngine();

function bars(closes: number[], startDate = '2024-01-02'): Bar[] {
  const start = new Date(startDate);
  return closes.map((c, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    return { t: d.toISOString(), o: c, h: c, l: c, c, v: 0 };
  });
}

const buyAndSell30Strategy: StrategyRules = {
  symbol: 'TEST',
  // Enter when price closes below 50, exit when price closes above 100.
  entry: {
    combinator: 'all',
    conditions: [{ left: { indicator: 'price' }, op: '<', right: 50 }],
  },
  exit: {
    combinator: 'all',
    conditions: [{ left: { indicator: 'price' }, op: '>', right: 100 }],
  },
  sizing: { type: 'fixed_fraction', fraction: 1 },
};

describe('BacktestEngine.run', () => {
  it('rejects empty bar series', () => {
    expect(() =>
      engine.run({ bars: [], rules: buyAndSell30Strategy, initialCapital: 1000 }),
    ).toThrow(/No bars/);
  });

  it('rejects non-positive capital', () => {
    expect(() =>
      engine.run({ bars: bars([100, 110]), rules: buyAndSell30Strategy, initialCapital: 0 }),
    ).toThrow(/initialCapital/);
  });

  it('records a single profitable round-trip and matches arithmetic', () => {
    // Buy when below 50, sell when above 100.
    // Path: 40 (entry) → 60 → 110 (exit)
    const result = engine.run({
      bars: bars([40, 60, 110]),
      rules: buyAndSell30Strategy,
      initialCapital: 1000,
    });

    expect(result.trades).toHaveLength(1);
    const trade = result.trades[0]!;
    expect(trade.entryPrice).toBe(40);
    expect(trade.exitPrice).toBe(110);
    expect(trade.win).toBe(true);
    expect(result.metrics.winRate).toBe(1);
    expect(result.metrics.totalTrades).toBe(1);
    // 1000 → buys 25 shares at 40 → sells 25 * 110 = 2750
    expect(result.metrics.finalCapital).toBeCloseTo(2750);
    expect(result.metrics.totalReturnPct).toBeCloseTo(175);
  });

  it('flattens an open position at the final bar', () => {
    // Entry condition fires but exit never does — engine should still close the trade.
    const result = engine.run({
      bars: bars([40, 60, 80]),
      rules: buyAndSell30Strategy,
      initialCapital: 1000,
    });
    expect(result.trades).toHaveLength(1);
    expect(result.trades[0]!.exitPrice).toBe(80);
  });

  it('reports max drawdown as a negative percentage', () => {
    // Always-in strategy: enter immediately, never exit during run.
    const alwaysIn: StrategyRules = {
      ...buyAndSell30Strategy,
      entry: {
        combinator: 'all',
        conditions: [{ left: { indicator: 'price' }, op: '>', right: 0 }],
      },
      exit: {
        combinator: 'all',
        // Impossible — never triggers
        conditions: [{ left: { indicator: 'price' }, op: '<', right: -1 }],
      },
    };
    // Equity peaks at bar 2 (price 200) then halves. Mark-to-market drawdown ≈ -50%.
    const result = engine.run({
      bars: bars([100, 150, 200, 100]),
      rules: alwaysIn,
      initialCapital: 1000,
    });
    expect(result.metrics.maxDrawdownPct).toBeLessThan(0);
    expect(result.metrics.maxDrawdownPct).toBeGreaterThanOrEqual(-50.01);
    // Equity curve should have one entry per bar.
    expect(result.equity).toHaveLength(4);
  });

  it('honors the per-trade fee on both legs', () => {
    const withFees: StrategyRules = {
      ...buyAndSell30Strategy,
      fees: { perTradePct: 0.01 }, // 100 bps each leg
    };
    const result = engine.run({
      bars: bars([40, 110]),
      rules: withFees,
      initialCapital: 1000,
    });
    // 1000 * 0.99 = 990 deployed → 24.75 shares at 40
    // Sell at 110: 24.75 * 110 = 2722.5; fee = 27.225 → 2695.275
    expect(result.metrics.finalCapital).toBeCloseTo(2695.275, 1);
  });

  it('produces no trades when entry never fires', () => {
    const result = engine.run({
      bars: bars([200, 250, 300]),
      rules: buyAndSell30Strategy,
      initialCapital: 1000,
    });
    expect(result.trades).toHaveLength(0);
    expect(result.metrics.winRate).toBe(0);
    expect(result.metrics.totalTrades).toBe(0);
    expect(result.metrics.finalCapital).toBe(1000);
  });
});
