import type { BacktestMetrics, EquityPoint, Trade } from './types';

export function computeMetrics(params: {
  trades: Trade[];
  equity: EquityPoint[];
  initialCapital: number;
  startDate: string;
  endDate: string;
}): BacktestMetrics {
  const { trades, equity, initialCapital, startDate, endDate } = params;
  const finalCapital = equity.length ? equity[equity.length - 1].equity : initialCapital;
  const totalReturnPct = ((finalCapital - initialCapital) / initialCapital) * 100;

  const wins = trades.filter((t) => t.win);
  const losses = trades.filter((t) => !t.win);

  const winRate = trades.length === 0 ? 0 : wins.length / trades.length;
  const avgWinPct = avg(wins.map((t) => t.pnlPct));
  const avgLossPct = avg(losses.map((t) => t.pnlPct));
  const grossWin = sum(wins.map((t) => t.pnlUsd));
  const grossLoss = Math.abs(sum(losses.map((t) => t.pnlUsd)));
  const profitFactor = grossLoss === 0 ? (grossWin > 0 ? Infinity : 0) : grossWin / grossLoss;

  return {
    startDate,
    endDate,
    initialCapital,
    finalCapital,
    totalReturnPct,
    totalTrades: trades.length,
    winRate,
    avgWinPct,
    avgLossPct,
    profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
    maxDrawdownPct: maxDrawdownPct(equity),
    sharpeRatio: sharpeFromEquity(equity),
  };
}

function avg(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function maxDrawdownPct(equity: EquityPoint[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const p of equity) {
    if (p.equity > peak) peak = p.equity;
    const dd = peak === 0 ? 0 : (p.equity - peak) / peak;
    if (dd < worst) worst = dd;
  }
  return worst * 100;
}

/** Sharpe ratio on bar-to-bar equity returns, annualized assuming 252 bars/yr. */
function sharpeFromEquity(equity: EquityPoint[]): number | null {
  if (equity.length < 2) return null;
  const rets: number[] = [];
  for (let i = 1; i < equity.length; i++) {
    const prev = equity[i - 1].equity;
    if (prev === 0) continue;
    rets.push((equity[i].equity - prev) / prev);
  }
  if (rets.length < 2) return null;
  const mean = avg(rets);
  const variance = avg(rets.map((r) => (r - mean) ** 2));
  const stddev = Math.sqrt(variance);
  if (stddev === 0) return null;
  // Bar frequency is unknown here; use 252 (trading days) as a conservative default.
  return (mean / stddev) * Math.sqrt(252);
}
