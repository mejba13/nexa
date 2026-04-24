import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { MusicService } from '../music.service';

const inputSchema = z.object({
  genre: z.string().trim().min(1).max(60),
});

@Injectable()
export class SuggestArrangementTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'suggest_arrangement';
  readonly description =
    "Returns matching song arrangement templates (section → bar count → purpose) for a genre. Agent adapts the template to the track's specific mood; template values are deterministic.";
  readonly agents: readonly AgentType[] = ['MUSIC'];
  readonly inputSchema = inputSchema;

  constructor(private readonly music: MusicService) {}

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    const templates = this.music.arrangementsFor(input.genre);
    if (templates.length === 0) {
      return {
        genre: input.genre,
        templates: [],
        note: 'No curated template for that genre. Offer to adapt pop-32 or club-dj depending on whether the track is song-form or DJ-friendly.',
      };
    }
    return { genre: input.genre, templates };
  }
}
