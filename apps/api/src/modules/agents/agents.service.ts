import { Injectable, NotFoundException } from '@nestjs/common';
import { PLAN_LIMITS } from '@nexa/types';
import type { Agent, AgentType } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(): Promise<Agent[]> {
    return this.prisma.agent.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getByType(type: AgentType): Promise<Agent> {
    const agent = await this.prisma.agent.findUnique({ where: { type } });
    if (!agent) throw new NotFoundException(`Agent not found: ${type}`);
    return agent;
  }

  /**
   * Access check: the user's plan caps `maxAgents`. We resolve "which agents"
   * by picking those the user has already interacted with (via UserAgent);
   * if under cap, any agent is open. This stays simple for v1 — product can
   * add an explicit picker later if needed.
   */
  async userHasAccess(
    clerkId: string,
    type: AgentType,
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, plan: true },
    });
    if (!user) return { allowed: false, reason: 'User not found' };

    const limit = PLAN_LIMITS[user.plan].maxAgents;
    if (!Number.isFinite(limit)) return { allowed: true };

    const existing = await this.prisma.userAgent.findMany({
      where: { userId: user.id },
      select: { agent: { select: { type: true } } },
    });
    const claimed = new Set(existing.map((e) => e.agent.type));
    if (claimed.has(type)) return { allowed: true };
    if (claimed.size < limit) return { allowed: true };
    return {
      allowed: false,
      reason: `Plan allows ${limit} agent(s); upgrade to add more.`,
    };
  }

  async linkUserToAgent(clerkId: string, type: AgentType): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    const agent = await this.prisma.agent.findUnique({ where: { type } });
    if (!user || !agent) throw new NotFoundException();
    await this.prisma.userAgent.upsert({
      where: { userId_agentId: { userId: user.id, agentId: agent.id } },
      create: { userId: user.id, agentId: agent.id },
      update: {},
    });
  }
}
