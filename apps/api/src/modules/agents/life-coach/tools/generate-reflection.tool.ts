import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { LifeCoachService } from '../life-coach.service';

const inputSchema = z.object({
  situation: z
    .string()
    .trim()
    .min(1)
    .max(1500)
    .describe('What the user is reflecting on right now.'),
  voiceAnchor: z
    .string()
    .trim()
    .max(300)
    .describe(
      'A short phrase describing the tone the user prefers (e.g. "direct, warm, grounded").',
    )
    .optional(),
  topK: z.number().int().min(3).max(12).default(6),
});

@Injectable()
export class GenerateReflectionTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'generate_reflection';
  readonly description =
    "Pulls the past journal excerpts most related to the stated situation, plus an optional voice anchor. Agent composes the reflection in the user's own voice, grounded in the returned excerpts — never invents past events.";
  readonly agents: readonly AgentType[] = ['LIFE_COACH'];
  readonly inputSchema = inputSchema;

  constructor(private readonly coach: LifeCoachService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const chunks = await this.coach.queryPastReflections(ctx.userId, input.situation, input.topK);
    return {
      situation: input.situation,
      voiceAnchor: input.voiceAnchor ?? null,
      pastExcerpts: chunks.map((c) => ({
        filename: c.filename,
        chunkIndex: c.chunkIndex,
        content: c.content,
      })),
      guidance: [
        "Open with a restatement of the situation in the user's own words (use the excerpts).",
        'Name the pattern if one appears across ≥2 excerpts.',
        'Offer ONE concrete next step. Never more than one.',
        'Match the voice anchor if provided; otherwise mirror the cadence of the excerpts.',
      ],
    };
  }
}
