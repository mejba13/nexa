import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { ContentService } from '../content.service';

const inputSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'instagram', 'threads', 'facebook']),
  topic: z.string().trim().min(1).max(300),
  goal: z
    .enum(['awareness', 'engagement', 'conversion', 'thought-leadership'])
    .default('engagement'),
  audience: z.string().trim().max(200).optional(),
  brandVoiceQuery: z.string().trim().max(200).optional(),
});

@Injectable()
export class GenerateSocialPostTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'generate_social_post';
  readonly description =
    'Returns platform-specific authoring constraints (char limits, hook/CTA patterns, hashtag + emoji guidance) plus brand voice excerpts. The agent then composes the post respecting these rules exactly — never exceed the char limit, never invent a pattern not listed.';
  readonly agents: readonly AgentType[] = ['CONTENT'];
  readonly inputSchema = inputSchema;

  constructor(private readonly content: ContentService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const spec = this.content.socialSpecFor(input.platform);
    const voice = input.brandVoiceQuery
      ? await this.content.queryBrandVoice(ctx.userId, input.brandVoiceQuery, 4)
      : [];

    return {
      platform: spec.platform,
      constraints: {
        maxChars: spec.maxChars,
        hashtagGuidance: spec.hashtagGuidance,
        mentionGuidance: spec.mentionGuidance,
        emojiGuidance: spec.emojiGuidance,
      },
      templates: {
        hookPatterns: spec.hookPatterns,
        ctaPatterns: spec.ctaPatterns,
      },
      bestFor: spec.bestFor,
      goal: input.goal,
      topic: input.topic,
      audience: input.audience ?? null,
      brandVoice: voice.map((c) => ({
        filename: c.filename,
        content: c.content,
      })),
    };
  }
}
