/**
 * Deterministic backtesting contract.
 * Tools call into this module with fully-typed inputs and receive results that
 * Claude only narrates — numbers are never fabricated (PRD §5 Agent 01, §18).
 */

export interface Bar {
  /** ISO timestamp. */
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

/** Generic comparison ops used in strategy rules. */
export type CompareOp = '<' | '<=' | '>' | '>=' | '==';

export type IndicatorName = 'sma' | 'ema' | 'rsi' | 'price' | 'return';

export interface IndicatorRef {
  indicator: IndicatorName;
  /** Lookback period for sma/ema/rsi; ignored for price/return. */
  period?: number;
  /** Which OHLC field to sample. Default: close. */
  source?: 'o' | 'h' | 'l' | 'c';
}

export interface Condition {
  left: IndicatorRef;
  op: CompareOp;
  /** Either a fixed number or another indicator. */
  right: number | IndicatorRef;
}

export interface RuleGroup {
  /** Boolean combinator — all must be true OR any must be true. */
  combinator: 'all' | 'any';
  conditions: Array<Condition | RuleGroup>;
}

export interface Sizing {
  type: 'fixed_fraction';
  /** 0..1. 1 = all-in on each entry. */
  fraction: number;
}

export interface FeeConfig {
  /** Percentage taken off notional on each fill (0.001 = 10 bps). */
  perTradePct: number;
}

export interface StrategyRules {
  /** Human label — purely informational. */
  symbol: string;
  entry: RuleGroup;
  exit: RuleGroup;
  sizing: Sizing;
  fees?: FeeConfig;
}

export interface BacktestConfig {
  rules: StrategyRules;
  bars: Bar[];
  initialCapital: number;
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
