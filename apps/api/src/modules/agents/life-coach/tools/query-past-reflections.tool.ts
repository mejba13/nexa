import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { LifeCoachService } from '../life-coach.service';

const inputSchema = z.object({
  query: z.string().trim().min(1).max(500),
  topK: z.number().int().min(1).max(12).default(6),
});

@Injectable()
export class QueryPastReflectionsTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'query_past_reflections';
  readonly description =
    "Retrieve the most relevant excerpts from the user's past journals. Always call this before offering reflection-style advice so the response is grounded in the user's own history and voice, not invented.";
  readonly agents: readonly AgentType[] = ['LIFE_COACH'];
  readonly inputSchema = inputSchema;

  constructor(private readonly coach: LifeCoachService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const chunks = await this.coach.queryPastReflections(ctx.userId, input.query, input.topK);
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
