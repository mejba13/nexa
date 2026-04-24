import type { Bar, BacktestResult, Trade } from './trading-types';

export type { Bar, BacktestResult, Trade };

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function authed<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface StrategyRow {
  id: string;
  name: string;
  description: string;
  rules: unknown;
  createdAt: string;
}

export interface BacktestRow {
  id: string;
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: string;
  finalCapital: string;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number | null;
  totalTrades: number;
  results: BacktestResult;
  createdAt: string;
}

export const tradingApi = {
  listStrategies: (token: string) => authed<StrategyRow[]>('/trading/strategies', token),
  createStrategy: (token: string, body: unknown) =>
    authed<StrategyRow>('/trading/strategies', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteStrategy: (token: string, id: string) =>
    authed<void>(`/trading/strategies/${id}`, token, { method: 'DELETE' }),
  listBacktests: (token: string, strategyId?: string) =>
    authed<BacktestRow[]>(
      `/trading/backtests${strategyId ? `?strategyId=${strategyId}` : ''}`,
      token,
    ),
  runBacktest: (token: string, body: unknown) =>
    authed<{ backtest: BacktestRow; result: BacktestResult }>('/trading/backtests', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
