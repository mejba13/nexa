import type { Bar } from './types';

/** Price for a bar by OHLC source. Defaults to close. */
export function priceOf(bar: Bar, source: 'o' | 'h' | 'l' | 'c' = 'c'): number {
  return bar[source];
}

/** Simple moving average. Returns NaN until `period` bars available. */
export function sma(prices: number[], period: number): number[] {
  const out: number[] = new Array(prices.length).fill(NaN);
  if (period <= 0 || prices.length < period) return out;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += prices[i];
  out[period - 1] = sum / period;

  for (let i = period; i < prices.length; i++) {
    sum += prices[i] - prices[i - period];
    out[i] = sum / period;
  }
  return out;
}

/** Exponential moving average. */
export function ema(prices: number[], period: number): number[] {
  const out: number[] = new Array(prices.length).fill(NaN);
  if (period <= 0 || prices.length === 0) return out;

  const k = 2 / (period + 1);
  // Seed with SMA of the first `period` bars.
  if (prices.length < period) return out;

  let seed = 0;
  for (let i = 0; i < period; i++) seed += prices[i];
  let prev = seed / period;
  out[period - 1] = prev;

  for (let i = period; i < prices.length; i++) {
    const v = prices[i] * k + prev * (1 - k);
    out[i] = v;
    prev = v;
  }
  return out;
}

/** Wilder-style RSI. */
export function rsi(prices: number[], period: number): number[] {
  const out: number[] = new Array(prices.length).fill(NaN);
  if (period <= 0 || prices.length <= period) return out;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

/** Bar-to-bar return. */
export function returns(prices: number[]): number[] {
  const out: number[] = new Array(prices.length).fill(0);
  for (let i = 1; i < prices.length; i++) {
    out[i] = prices[i - 1] === 0 ? 0 : (prices[i] - prices[i - 1]) / prices[i - 1];
  }
  return out;
}
