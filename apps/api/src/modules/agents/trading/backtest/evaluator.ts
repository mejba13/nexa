import { ema, priceOf, returns, rsi, sma } from './indicators';
import type { Bar, Condition, IndicatorRef, RuleGroup } from './types';

/**
 * Pre-compute every indicator series the ruleset references, then provide O(1)
 * per-bar lookup to the rule evaluator. Keyed by `name_period_source` so the
 * same (sma,20,c) used twice in a ruleset computes only once.
 */
export class IndicatorCache {
  private readonly series = new Map<string, number[]>();

  constructor(private readonly bars: Bar[]) {}

  private keyOf(ref: IndicatorRef): string {
    return `${ref.indicator}_${ref.period ?? 0}_${ref.source ?? 'c'}`;
  }

  get(ref: IndicatorRef): number[] {
    const key = this.keyOf(ref);
    const cached = this.series.get(key);
    if (cached) return cached;

    const source = ref.source ?? 'c';
    const prices = this.bars.map((b) => priceOf(b, source));
    let computed: number[];

    switch (ref.indicator) {
      case 'price':
        computed = prices;
        break;
      case 'sma':
        computed = sma(prices, ref.period ?? 20);
        break;
      case 'ema':
        computed = ema(prices, ref.period ?? 20);
        break;
      case 'rsi':
        computed = rsi(prices, ref.period ?? 14);
        break;
      case 'return':
        computed = returns(prices);
        break;
      default:
        throw new Error(`Unknown indicator: ${ref.indicator as string}`);
    }
    this.series.set(key, computed);
    return computed;
  }

  valueAt(ref: IndicatorRef, barIdx: number): number {
    return this.get(ref)[barIdx];
  }
}

export function evaluateGroup(group: RuleGroup, cache: IndicatorCache, barIdx: number): boolean {
  const values = group.conditions.map((c) =>
    'combinator' in c ? evaluateGroup(c, cache, barIdx) : evaluateCondition(c, cache, barIdx),
  );
  return group.combinator === 'all' ? values.every(Boolean) : values.some(Boolean);
}

function evaluateCondition(cond: Condition, cache: IndicatorCache, barIdx: number): boolean {
  const leftVal = cache.valueAt(cond.left, barIdx);
  const rightVal = typeof cond.right === 'number' ? cond.right : cache.valueAt(cond.right, barIdx);

  if (!Number.isFinite(leftVal) || !Number.isFinite(rightVal)) return false;

  switch (cond.op) {
    case '<':
      return leftVal < rightVal;
    case '<=':
      return leftVal <= rightVal;
    case '>':
      return leftVal > rightVal;
    case '>=':
      return leftVal >= rightVal;
    case '==':
      return leftVal === rightVal;
  }
}
