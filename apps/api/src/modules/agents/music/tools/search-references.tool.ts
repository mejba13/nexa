import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { MusicService } from '../music.service';

const inputSchema = z.object({
  query: z.string().trim().min(1).max(200),
  limit: z.number().int().min(1).max(20).default(10),
});

@Injectable()
export class SearchReferencesTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'search_references';
  readonly description =
    'Spotify Web API track search for reference tunes by style/mood/tempo/artist. Returns real tracks with URLs — if not configured, returns a typed error; never fabricate URLs.';
  readonly agents: readonly AgentType[] = ['MUSIC'];
  readonly inputSchema = inputSchema;

  constructor(private readonly music: MusicService) {}

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    const result = await this.music.searchReferences(input.query, input.limit);
    return { query: input.query, ...result };
  }
}
