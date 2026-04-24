import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { MusicService } from '../music.service';

const inputSchema = z.object({
  query: z.string().trim().min(1).max(300),
  topK: z.number().int().min(1).max(12).default(6),
});

@Injectable()
export class MixingGuidanceTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'mixing_guidance';
  readonly description =
    "Retrieve relevant excerpts from the user's MUSIC knowledge base (mixing tutorials, reference notes, preset docs). Agent narrates guidance grounded in these excerpts — no invented frequency ranges or plugin settings.";
  readonly agents: readonly AgentType[] = ['MUSIC'];
  readonly inputSchema = inputSchema;

  constructor(private readonly music: MusicService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const chunks = await this.music.mixingGuidance(ctx.userId, input.query, input.topK);
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
