import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { ContentService } from '../content.service';

const inputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  primaryKeyword: z.string().trim().min(1).max(80),
  audience: z.string().trim().max(200).optional(),
  outlineHints: z.array(z.string().trim().max(200)).max(20).optional(),
  brandVoiceQuery: z.string().trim().max(200).optional(),
});

@Injectable()
export class GenerateBlogPostTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'generate_blog_post';
  readonly description =
    'Returns SEO structure (word targets, H1/H2 conventions, keyword density, meta + title length caps) plus brand voice excerpts. The agent then drafts the post respecting the checklist exactly.';
  readonly agents: readonly AgentType[] = ['CONTENT'];
  readonly inputSchema = inputSchema;

  constructor(private readonly content: ContentService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    const spec = this.content.blogSpec();
    const voice = input.brandVoiceQuery
      ? await this.content.queryBrandVoice(ctx.userId, input.brandVoiceQuery, 4)
      : [];

    return {
      title: input.title,
      primaryKeyword: input.primaryKeyword,
      audience: input.audience ?? null,
      seo: spec,
      outlineHints: input.outlineHints ?? [],
      brandVoice: voice.map((c) => ({ filename: c.filename, content: c.content })),
    };
  }
}
