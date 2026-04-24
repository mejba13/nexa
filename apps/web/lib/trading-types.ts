/** Mirrors apps/api/src/modules/agents/trading/backtest/types.ts. Kept lightweight here
 *  so the web app doesn't have to depend on server types. If these drift, lift into
 *  @nexa/types.
 */
export interface Bar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Trade {
  entryIndex: number;
  entryTime: string;
  entryPrice: number;
  exitIndex: number;
  exitTime: string;
  exitPrice: number;
  qty: number;
  pnlUsd: number;
  pnlPct: number;
  feesUsd: number;
  win: boolean;
}

export interface EquityPoint {
  t: string;
  equity: number;
  drawdown: number;
}

export interface BacktestMetrics {
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturnPct: number;
  totalTrades: number;
  winRate: number;
  avgWinPct: number;
  avgLossPct: number;
  profitFactor: number;
  maxDrawdownPct: number;
  sharpeRatio: number | null;
}

export interface BacktestResult {
  metrics: BacktestMetrics;
  trades: Trade[];
  equity: EquityPoint[];
}
