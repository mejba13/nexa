import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import type { BacktestResult } from '../backtest/types';
import { TradingService } from '../trading.service';

const inputSchema = z.object({
  backtestId: z.string().cuid(),
});

@Injectable()
export class GetPerformanceMetricsTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'get_performance_metrics';
  readonly description =
    'Fetch stored metrics + trade log for a prior backtest. Use when summarising or diagnosing an earlier run.';
  readonly agents: readonly AgentType[] = ['TRADING'];
  readonly inputSchema = inputSchema;

  constructor(private readonly trading: TradingService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const row = await this.trading.getBacktest(ctx.userId, input.backtestId);
    const result = row.results as unknown as BacktestResult;
    return {
      backtestId: row.id,
      symbol: row.symbol,
      metrics: result.metrics,
      trades: result.trades.slice(0, 50), // cap so we don't blow context
      totalTrades: result.trades.length,
    };
  }
}
