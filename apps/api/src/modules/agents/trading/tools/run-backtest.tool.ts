import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { TradingService } from '../trading.service';

const inputSchema = z.object({
  strategyId: z.string().cuid(),
  initialCapital: z.number().positive().max(1_000_000_000),
  csv: z.string().trim().max(500_000).optional(),
  documentId: z.string().cuid().optional(),
});

@Injectable()
export class RunBacktestTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'run_backtest';
  readonly description =
    'Execute a deterministic backtest for a strategy over OHLCV bars. Returns metrics summary only; the agent MUST NOT invent numbers — refer to the returned fields. Full trade log is fetched via get_performance_metrics.';
  readonly agents: readonly AgentType[] = ['TRADING'];
  readonly inputSchema = inputSchema;

  constructor(private readonly trading: TradingService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const { backtest, result } = await this.trading.runBacktest(ctx.userId, input);
    return {
      backtestId: backtest.id,
      symbol: backtest.symbol,
      startDate: result.metrics.startDate,
      endDate: result.metrics.endDate,
      metrics: result.metrics,
    };
  }
}
