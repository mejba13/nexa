import { describe, expect, it } from 'vitest';

import { ema, returns, rsi, sma } from './indicators';

describe('sma', () => {
  it('returns NaN until the period is satisfied', () => {
    const out = sma([1, 2, 3, 4, 5], 3);
    expect(out[0]).toBeNaN();
    expect(out[1]).toBeNaN();
    expect(out[2]).toBeCloseTo(2);
    expect(out[3]).toBeCloseTo(3);
    expect(out[4]).toBeCloseTo(4);
  });

  it('handles equal-length and shorter series', () => {
    expect(sma([1, 2], 3).every(Number.isNaN)).toBe(true);
    expect(sma([], 5)).toEqual([]);
  });

  it('rolls correctly across a longer series', () => {
    const prices = [10, 12, 14, 16, 18, 20];
    const out = sma(prices, 4);
    expect(out[3]).toBeCloseTo((10 + 12 + 14 + 16) / 4);
    expect(out[5]).toBeCloseTo((14 + 16 + 18 + 20) / 4);
  });
});

describe('ema', () => {
  it('seeds from the first SMA bucket and decays toward later prices', () => {
    const out = ema([5, 5, 5, 5, 10, 10, 10], 3);
    // First three bars have no value; bar 2 (index 2) is the seed (= mean of first 3 = 5)
    expect(out[2]).toBeCloseTo(5);
    // Bar 3 onward should drift up toward 10
    expect(out[6]).toBeGreaterThan(out[3]!);
    expect(out[6]).toBeLessThan(10);
  });
});

describe('rsi', () => {
  it('reports 100 when there are no losses across the lookback', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + i);
    const out = rsi(prices, 14);
    expect(out[14]).toBeCloseTo(100);
  });

  it('reports near 0 when prices fall continuously', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 200 - i);
    const out = rsi(prices, 14);
    expect(out[14]).toBeLessThan(5);
  });

  it('produces values within [0, 100]', () => {
    const prices = [44, 47, 45, 50, 48, 52, 49, 51, 53, 50, 47, 49, 52, 55, 53, 56];
    const out = rsi(prices, 14);
    for (const v of out) {
      if (Number.isFinite(v)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('returns', () => {
  it('zero for the first bar', () => {
    expect(returns([100, 110])[0]).toBe(0);
  });

  it('matches the algebraic definition', () => {
    expect(returns([100, 110])[1]).toBeCloseTo(0.1);
    expect(returns([100, 90])[1]).toBeCloseTo(-0.1);
  });
});
