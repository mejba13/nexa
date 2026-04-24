import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import type { AgentType } from '@nexa/types';

import type { ITool, ToolContext } from '../../../../shared/tools/tool.interface';
import { LifeCoachService } from '../life-coach.service';

const inputSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
});

@Injectable()
export class DecisionFrameworkTool implements ITool<z.infer<typeof inputSchema>> {
  readonly name = 'decision_framework';
  readonly description =
    "Returns a fixed structured decision-making scaffold (Frame → Gather → Score → Commit) plus helper tools (pre-mortem, 10-10-10, reversibility check). Agent fills each stage's answers with the user's specifics, ideally grounded by query_past_reflections.";
  readonly agents: readonly AgentType[] = ['LIFE_COACH'];
  readonly inputSchema = inputSchema;

  constructor(private readonly coach: LifeCoachService) {}

  async execute(input: z.infer<typeof inputSchema>, _ctx: ToolContext) {
    return this.coach.decisionFramework(input.prompt);
  }
}
