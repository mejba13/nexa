import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

import type { AgentType } from '@nexa/types';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface ListUsersParams {
  cursor?: string;
  limit?: number;
  search?: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers({ cursor, limit = 25, search }: ListUsersParams) {
    const take = Math.min(Math.max(limit, 1), 100);
    const rows = await this.prisma.user.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      ...(search
        ? {
            where: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });

    const hasMore = rows.length > take;
    const items = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;
    return { items, nextCursor };
  }

  async userDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { conversations: true, documents: true, tradingStrategies: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const usage30d = await this.userUsageWindow(userId, 30);
    return { user, usage30d };
  }

  /** Aggregate token usage + cost for a user across the last N days. */
  async userUsageWindow(userId: string, days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const grouped = await this.prisma.usageRecord.groupBy({
      by: ['agentType'],
      where: { userId, createdAt: { gte: since } },
      _sum: { tokensInput: true, tokensOutput: true, costUsd: true },
    });
    return grouped.map((g) => ({
      agentType: g.agentType as AgentType,
      tokensInput: g._sum.tokensInput ?? 0,
      tokensOutput: g._sum.tokensOutput ?? 0,
      costUsd: (g._sum.costUsd ?? new Decimal(0)).toString(),
    }));
  }

  async platformStats(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const dau = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, paidUsers, dauCount, conversations30d, usage30d] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { plan: { not: 'FREE' } } }),
      this.prisma.conversation.count({ where: { updatedAt: { gte: dau } } }),
      this.prisma.conversation.count({ where: { createdAt: { gte: since } } }),
      this.prisma.usageRecord.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { tokensInput: true, tokensOutput: true, costUsd: true },
      }),
    ]);

    return {
      windowDays: days,
      totalUsers,
      paidUsers,
      dauApprox: dauCount, // unique-conversation proxy until we add a sessions table
      conversations30d,
      tokensInput30d: usage30d._sum.tokensInput ?? 0,
      tokensOutput30d: usage30d._sum.tokensOutput ?? 0,
      costUsd30d: (usage30d._sum.costUsd ?? new Decimal(0)).toString(),
    };
  }

  async agentUsage(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const grouped = await this.prisma.usageRecord.groupBy({
      by: ['agentType'],
      where: { createdAt: { gte: since } },
      _sum: { tokensInput: true, tokensOutput: true, costUsd: true },
      _count: { _all: true },
    });
    return grouped.map((g) => ({
      agentType: g.agentType as AgentType,
      calls: g._count._all,
      tokensInput: g._sum.tokensInput ?? 0,
      tokensOutput: g._sum.tokensOutput ?? 0,
      costUsd: (g._sum.costUsd ?? new Decimal(0)).toString(),
    }));
  }

  /** Stream-friendly CSV export for the user list (admin-only). */
  async exportUsersCsv(): Promise<string> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });
    const header = 'id,clerkId,email,name,plan,createdAt\n';
    const rows = users
      .map((u) =>
        [
          u.id,
          u.clerkId,
          u.email,
          (u.name ?? '').replace(/"/g, '""'),
          u.plan,
          u.createdAt.toISOString(),
        ]
          .map((v) => `"${v}"`)
          .join(','),
      )
      .join('\n');
    return header + rows;
  }
}
