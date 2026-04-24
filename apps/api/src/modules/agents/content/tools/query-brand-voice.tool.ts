import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { ContentService } from '../content.service';

const inputSchema = z.object({
  query: z.string().trim().min(1).max(500),
  topK: z.number().int().min(1).max(12).default(6),
});

@Injectable()
export class QueryBrandVoiceTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'query_brand_voice';
  readonly description =
    "Retrieve brand voice / style-guide excerpts from the user's uploaded CONTENT knowledge base. Call before drafting any copy so the voice is grounded, not invented.";
  readonly agents: readonly AgentType[] = ['CONTENT'];
  readonly inputSchema = inputSchema;

  constructor(private readonly content: ContentService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const chunks = await this.content.queryBrandVoice(ctx.userId, input.query, input.topK);
    return {
      hits: chunks.length,
      excerpts: chunks.map((c) => ({
        filename: c.filename,
        chunkIndex: c.chunkIndex,
        content: c.content,
        distance: c.distance,
      })),
    };
  }
}
