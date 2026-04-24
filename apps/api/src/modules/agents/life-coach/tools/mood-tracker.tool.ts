import { Injectable } from '@nestjs/common';
import type { AgentType } from '@nexa/types';
import { z } from 'zod';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';

const inputSchema = z.object({
  mood: z.enum(['terrible', 'low', 'neutral', 'good', 'great']),
  note: z.string().trim().max(500).optional(),
});

/** Phase 2 stub (PRD §5 Life Coach, §19). */
@Injectable()
export class MoodTrackerTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'mood_tracker';
  readonly description =
    'Log a daily mood entry. DEFERRED in v1 — always returns a not-implemented notice. Advise the user to journal the mood in plain text for now; it will still be retrievable via query_past_reflections.';
  readonly agents: readonly AgentType[] = ['LIFE_COACH'];
  readonly inputSchema = inputSchema;

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    return {
      available: false,
      submitted: input,
      note: 'Mood logging ships in v2 (PRD §19). In the meantime, write the mood as a journal entry and re-upload — query_past_reflections will surface it next time.',
    };
  }
}
