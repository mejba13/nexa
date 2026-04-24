import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { ContentService } from '../content.service';

const inputSchema = z.object({
  platform: z.enum(['tiktok', 'reels', 'shorts', 'youtube']),
  topic: z.string().trim().min(1).max(300),
  goal: z.enum(['awareness', 'engagement', 'conversion', 'education']).default('engagement'),
  audience: z.string().trim().max(200).optional(),
  brandVoiceQuery: z.string().trim().max(200).optional(),
});

@Injectable()
export class GenerateVideoScriptTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'generate_video_script';
  readonly description =
    'Returns platform timing structure (hook/setup/payoff/CTA beats in seconds), hook and CTA tips, plus brand voice excerpts. The agent drafts the script beat-by-beat without exceeding the target duration.';
  readonly agents: readonly AgentType[] = ['CONTENT'];
  readonly inputSchema = inputSchema;

  constructor(private readonly content: ContentService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const spec = this.content.videoSpecFor(input.platform);
    const voice = input.brandVoiceQuery
      ? await this.content.queryBrandVoice(ctx.userId, input.brandVoiceQuery, 4)
      : [];

    return {
      platform: spec.platform,
      duration: spec.durationSec,
      structure: spec.structure,
      hookTips: spec.hookTips,
      ctaTips: spec.ctaTips,
      topic: input.topic,
      goal: input.goal,
      audience: input.audience ?? null,
      brandVoice: voice.map((c) => ({ filename: c.filename, content: c.content })),
    };
  }
}
