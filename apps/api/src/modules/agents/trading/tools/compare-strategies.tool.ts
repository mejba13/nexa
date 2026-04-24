import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { TradingService } from '../trading.service';

const inputSchema = z.object({
  strategyIdA: z.string().cuid(),
  strategyIdB: z.string().cuid(),
  initialCapital: z.number().positive(),
  csv: z.string().trim().max(500_000).optional(),
  documentId: z.string().cuid().optional(),
});

@Injectable()
export class CompareStrategiesTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'compare_strategies';
  readonly description =
    'Run two strategies on the same market data and return a side-by-side metrics diff. Both runs are persisted.';
  readonly agents: readonly AgentType[] = ['TRADING'];
  readonly inputSchema = inputSchema;

  constructor(private readonly trading: TradingService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const [a, b] = await Promise.all([
      this.trading.runBacktest(ctx.userId, {
        strategyId: input.strategyIdA,
        initialCapital: input.initialCapital,
        csv: input.csv,
        documentId: input.documentId,
      }),
      this.trading.runBacktest(ctx.userId, {
        strategyId: input.strategyIdB,
        initialCapital: input.initialCapital,
        csv: input.csv,
        documentId: input.documentId,
      }),
    ]);

    return {
      a: {
        backtestId: a.backtest.id,
        strategyId: input.strategyIdA,
        metrics: a.result.metrics,
      },
      b: {
        backtestId: b.backtest.id,
        strategyId: input.strategyIdB,
        metrics: b.result.metrics,
      },
      diff: {
        totalReturnPct: a.result.metrics.totalReturnPct - b.result.metrics.totalReturnPct,
        winRate: a.result.metrics.winRate - b.result.metrics.winRate,
        maxDrawdownPct: a.result.metrics.maxDrawdownPct - b.result.metrics.maxDrawdownPct,
      },
    };
  }
}
