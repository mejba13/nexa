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
export class SuggestImprovementsTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'suggest_improvements';
  readonly description =
    "Deterministic heuristics over a backtest's metrics. Returns a list of concrete rule-tweaks for the agent to narrate — never invent numbers outside this list.";
  readonly agents: readonly AgentType[] = ['TRADING'];
  readonly inputSchema = inputSchema;

  constructor(private readonly trading: TradingService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const row = await this.trading.getBacktest(ctx.userId, input.backtestId);
    const result = row.results as unknown as BacktestResult;
    return {
      backtestId: row.id,
      suggestions: this.trading.suggestImprovements(result),
      baselineMetrics: result.metrics,
    };
  }
}
