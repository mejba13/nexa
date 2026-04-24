import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { MusicService } from '../music.service';

const inputSchema = z.object({
  genre: z.string().trim().min(1).max(60),
});

@Injectable()
export class SuggestInstrumentsTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'suggest_instruments';
  readonly description =
    'Returns a curated instrument + textural + percussion palette for a given genre, plus BPM range and stylistic characteristics. Palette is deterministic — agent does not invent genre conventions.';
  readonly agents: readonly AgentType[] = ['MUSIC'];
  readonly inputSchema = inputSchema;

  constructor(private readonly music: MusicService) {}

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    const palette = this.music.paletteFor(input.genre);
    if (!palette) {
      return {
        genre: input.genre,
        found: false,
        note: 'No curated palette for that genre label. Ask the user to describe the sonic reference or pick from: lo-fi hiphop, house, afrobeats, pop, drum & bass, indie rock.',
      };
    }
    return { found: true, palette };
  }
}
