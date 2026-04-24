import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { LifeCoachService } from '../life-coach.service';

const inputSchema = z.object({
  sampleChunks: z.number().int().min(20).max(400).default(120),
  topK: z.number().int().min(3).max(25).default(10),
});

@Injectable()
export class ExtractThemesTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'extract_themes';
  readonly description =
    "Deterministic theme frequency analysis over the user's journal corpus (stopword-filtered word frequencies + a representative excerpt per top term). Agent synthesizes narrative themes ONLY from the returned terms — never invents themes absent from the data.";
  readonly agents: readonly AgentType[] = ['LIFE_COACH'];
  readonly inputSchema = inputSchema;

  constructor(private readonly coach: LifeCoachService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    return this.coach.extractJournalThemes(ctx.userId, {
      limit: input.sampleChunks,
      topK: input.topK,
    });
  }
}
