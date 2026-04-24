import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { strategyRulesSchema } from '../backtest/schema';
import { TradingService } from '../trading.service';

const inputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(''),
  rules: strategyRulesSchema,
});

@Injectable()
export class UploadStrategyTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'upload_strategy';
  readonly description =
    'Store a trading strategy for later backtesting. Rules are declarative: entry/exit condition trees over SMA, EMA, RSI, price, or return indicators. Returns the created strategyId.';
  readonly agents: readonly AgentType[] = ['TRADING'];
  readonly inputSchema = inputSchema;

  constructor(private readonly trading: TradingService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const strategy = await this.trading.createStrategy(ctx.userId, {
      name: input.name,
      description: input.description,
      rules: input.rules,
    });
    return {
      strategyId: strategy.id,
      name: strategy.name,
      symbol: input.rules.symbol,
    };
  }
}
