import { Injectable } from '@nestjs/common';

import { IndicatorCache, evaluateGroup } from './evaluator';
import { computeMetrics } from './metrics';
import type { BacktestConfig, BacktestResult, EquityPoint, Trade } from './types';

/**
 * Deterministic long-only backtester.
 * Walks bars once, opens/closes a single position per the rule set, fills at
 * the close of the signal bar. Fees applied per fill. Equity curve recomputed
 * mark-to-market at each bar close.
 *
 * Simplifications (v1):
 *   - one symbol, long-only
 *   - no slippage model beyond flat `perTradePct` fee
 *   - no partial fills / position scaling
 *   - all-in / flat on fixed_fraction sizing (fraction acts on available capital)
 * Expand when a real user strategy needs more nuance.
 */
@Injectable()
export class BacktestEngine {
  run(cfg: BacktestConfig): BacktestResult {
    const { bars, rules, initialCapital } = cfg;
    if (bars.length === 0) throw new Error('No bars provided');
    if (initialCapital <= 0) throw new Error('initialCapital must be positive');

    const cache = new IndicatorCache(bars);
    const feePct = rules.fees?.perTradePct ?? 0;
    const fraction = Math.max(0, Math.min(rules.sizing.fraction ?? 1, 1));

    let cash = initialCapital;
    let qty = 0;
    let entryPrice = 0;
    let entryIdx = -1;
    let entryTime = '';

    const trades: Trade[] = [];
    const equity: EquityPoint[] = [];

    let peakEquity = initialCapital;

    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const price = bar.c;
      const inPosition = qty > 0;

      // Exit check runs first so we can flip same-bar if rules both fire.
      if (inPosition) {
        const exitTrue = evaluateGroup(rules.exit, cache, i);
        if (exitTrue) {
          const notional = qty * price;
          const fee = notional * feePct;
          cash += notional - fee;
          const entryNotional = qty * entryPrice;
          const pnlUsd = notional - entryNotional - fee - entryNotional * feePct;
          const pnlPct = entryNotional === 0 ? 0 : (pnlUsd / entryNotional) * 100;
          trades.push({
            entryIndex: entryIdx,
            entryTime,
            entryPrice,
            exitIndex: i,
            exitTime: bar.t,
            exitPrice: price,
            qty,
            pnlUsd,
            pnlPct,
            feesUsd: fee + entryNotional * feePct,
            win: pnlUsd > 0,
          });
          qty = 0;
          entryPrice = 0;
          entryIdx = -1;
          entryTime = '';
        }
      }

      if (qty === 0) {
        const entryTrue = evaluateGroup(rules.entry, cache, i);
        if (entryTrue) {
          const deploy = cash * fraction;
          const fee = deploy * feePct;
          const available = deploy - fee;
          const buyQty = price === 0 ? 0 : available / price;
          if (buyQty > 0) {
            cash -= deploy;
            qty = buyQty;
            entryPrice = price;
            entryIdx = i;
            entryTime = bar.t;
          }
        }
      }

      const markEquity = cash + qty * price;
      if (markEquity > peakEquity) peakEquity = markEquity;
      const dd = peakEquity === 0 ? 0 : (markEquity - peakEquity) / peakEquity;
      equity.push({ t: bar.t, equity: markEquity, drawdown: dd });
    }

    // Flatten any open position at the final bar so metrics close cleanly.
    if (qty > 0) {
      const last = bars[bars.length - 1];
      const notional = qty * last.c;
      const fee = notional * feePct;
      cash += notional - fee;
      const entryNotional = qty * entryPrice;
      const pnlUsd = notional - entryNotional - fee - entryNotional * feePct;
      const pnlPct = entryNotional === 0 ? 0 : (pnlUsd / entryNotional) * 100;
      trades.push({
        entryIndex: entryIdx,
        entryTime,
        entryPrice,
        exitIndex: bars.length - 1,
        exitTime: last.t,
        exitPrice: last.c,
        qty,
        pnlUsd,
        pnlPct,
        feesUsd: fee + entryNotional * feePct,
        win: pnlUsd > 0,
      });
      qty = 0;
      equity[equity.length - 1] = {
        t: last.t,
        equity: cash,
        drawdown: equity[equity.length - 1].drawdown,
      };
    }

    const metrics = computeMetrics({
      trades,
      equity,
      initialCapital,
      startDate: bars[0].t,
      endDate: bars[bars.length - 1].t,
    });

    return { metrics, trades, equity };
  }
}
