import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { ContentService } from '../content.service';

const inputSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  weeks: z.number().int().min(1).max(26),
  channels: z.array(z.string().trim().min(1).max(40)).min(1).max(8),
  themes: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  cadencePerWeek: z.number().int().min(1).max(7).default(3),
});

@Injectable()
export class CreateContentCalendarTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'create_content_calendar';
  readonly description =
    'Builds a deterministic content calendar grid — dates × channels × themes — for up to 26 weeks. Returns empty slots the agent then fills with titles/copy in follow-up turns. Theme rotation is round-robin over slots.';
  readonly agents: readonly AgentType[] = ['CONTENT'];
  readonly inputSchema = inputSchema;

  constructor(private readonly content: ContentService) {}

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    return this.content.buildCalendar(input);
  }
}
