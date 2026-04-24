import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { TradingService } from '../trading.service';

const inputSchema = z.object({
  symbol: z.string().trim().min(1).max(32),
  csv: z
    .string()
    .trim()
    .max(500_000)
    .describe('Full CSV content with header date,open,high,low,close,volume')
    .optional(),
  documentId: z
    .string()
    .cuid()
    .describe('Existing TRADING document id (CSV previously uploaded via /documents/upload)')
    .optional(),
});

@Injectable()
export class UploadMarketDataTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'upload_market_data';
  readonly description =
    'Register OHLCV market data for a symbol. Either provide inline CSV (<=500KB) or reference a previously uploaded document. Returns a summary (bar count, start/end date) the agent can cite.';
  readonly agents: readonly AgentType[] = ['TRADING'];
  readonly inputSchema = inputSchema;

  constructor(private readonly trading: TradingService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const { bars, source } = await this.trading.loadBars(ctx.userId, {
      csv: input.csv,
      documentId: input.documentId,
    });
    return {
      symbol: input.symbol,
      source,
      bars: bars.length,
      startDate: bars[0]?.t,
      endDate: bars[bars.length - 1]?.t,
    };
  }
}
