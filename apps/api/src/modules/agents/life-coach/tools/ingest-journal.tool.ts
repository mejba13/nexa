import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { LifeCoachService } from '../life-coach.service';

const inputSchema = z.object({
  documentId: z.string().cuid(),
});

@Injectable()
export class IngestJournalTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'ingest_journal';
  readonly description =
    'Report the indexing status of a previously-uploaded LIFE_COACH journal document. Journals are uploaded via /documents/upload; this tool confirms they are ready for RAG retrieval and returns chunk count.';
  readonly agents: readonly AgentType[] = ['LIFE_COACH'];
  readonly inputSchema = inputSchema;

  constructor(private readonly coach: LifeCoachService) {}

  async execute(input: z.infer<typeof inputSchema>, ctx: ToolContext) {
    return this.coach.journalStatus(ctx.userId, input.documentId);
  }
}
