import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';

const inputSchema = z.object({
  topic: z.string().trim().min(1).max(200),
});

/**
 * Stub. Real web-search integration lands in v2 (PRD §5, §19). The tool is
 * exposed so Claude knows the capability exists and can tell the user it's not
 * yet available rather than hallucinating search results.
 */
@Injectable()
export class ResearchTrendsTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'research_trends';
  readonly description =
    "Web search for current trends on a topic. DEFERRED in v1 — always returns a not-implemented notice. Use brand voice + the user's own context instead.";
  readonly agents: readonly AgentType[] = ['CONTENT'];
  readonly inputSchema = inputSchema;

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    return {
      topic: input.topic,
      available: false,
      note: 'Web trend search is a v2 feature (PRD §5 Content Agent, §19). Suggest the user paste relevant source links into the conversation and the agent will synthesize from them.',
    };
  }
}
