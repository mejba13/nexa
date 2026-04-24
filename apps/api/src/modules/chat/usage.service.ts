import { Injectable, Logger } from '@nestjs/common';
import { PLAN_LIMITS } from '@nexa/types';
import type { AgentType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    userId: string;
    agentType: AgentType;
    tokensInput: number;
    tokensOutput: number;
    costUsd: number;
    conversationId?: string;
  }): Promise<void> {
    await this.prisma.usageRecord.create({
      data: {
        userId: params.userId,
        agentType: params.agentType,
        tokensInput: params.tokensInput,
        tokensOutput: params.tokensOutput,
        costUsd: new Decimal(params.costUsd.toFixed(6)),
        conversationId: params.conversationId ?? null,
      },
    });
  }

  /** Returns true if the user still has tokens left this month. PRD §F-009. */
  async canSpend(userId: string): Promise<{
    allowed: boolean;
    used: number;
    limit: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user) return { allowed: false, used: 0, limit: 0 };

    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);

    const agg = await this.prisma.usageRecord.aggregate({
      where: { userId, createdAt: { gte: start } },
      _sum: { tokensInput: true, tokensOutput: true },
    });
    const used = (agg._sum.tokensInput ?? 0) + (agg._sum.tokensOutput ?? 0);
    const limit = PLAN_LIMITS[user.plan].tokensPerMonth;
    return { allowed: used < limit, used, limit };
  }
}
