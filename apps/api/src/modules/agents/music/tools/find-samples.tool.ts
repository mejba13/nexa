import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { MusicService } from '../music.service';

const inputSchema = z.object({
  query: z.string().trim().min(1).max(200),
  limit: z.number().int().min(1).max(20).default(10),
});

@Injectable()
export class FindSamplesTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'find_samples';
  readonly description =
    'Search Freesound.org for royalty-free samples (drums, foley, textures, one-shots). Returns real IDs + preview URLs + licenses — if not configured, returns a typed error.';
  readonly agents: readonly AgentType[] = ['MUSIC'];
  readonly inputSchema = inputSchema;

  constructor(private readonly music: MusicService) {}

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    const result = await this.music.findSamples(input.query, input.limit);
    return { query: input.query, ...result };
  }
}
