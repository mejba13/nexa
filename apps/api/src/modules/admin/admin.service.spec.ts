import { NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminService } from './admin.service';

function makePrisma() {
  return {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    conversation: { count: vi.fn() },
    usageRecord: { groupBy: vi.fn(), aggregate: vi.fn() },
  };
}

function makeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'u1',
    clerkId: 'user_clerk',
    email: 'a@b.com',
    name: 'Alice',
    plan: 'FREE',
    createdAt: new Date('2026-04-01T00:00:00Z'),
    ...overrides,
  };
}

describe('AdminService.listUsers', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let admin: AdminService;

  beforeEach(() => {
    prisma = makePrisma();
    admin = new AdminService(prisma as never);
  });

  it('returns items with nextCursor=null when fewer rows than page size', async () => {
    prisma.user.findMany.mockResolvedValue([makeRow({ id: 'a' }), makeRow({ id: 'b' })]);
    const out = await admin.listUsers({ limit: 25 });
    expect(out.items).toHaveLength(2);
    expect(out.nextCursor).toBeNull();
    // Prisma must be asked for take+1 to detect end-of-page cleanly.
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 26 }));
  });

  it('clamps limit to [1, 100]', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    await admin.listUsers({ limit: 500 });
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 101 }));

    prisma.user.findMany.mockClear();
    await admin.listUsers({ limit: -5 });
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 2 }));
  });

  it('advances cursor when rows overflow take+1', async () => {
    const rows = Array.from({ length: 11 }, (_, i) => makeRow({ id: `u${i}` }));
    prisma.user.findMany.mockResolvedValue(rows);
    const out = await admin.listUsers({ limit: 10 });
    expect(out.items).toHaveLength(10);
    expect(out.nextCursor).toBe('u9'); // id of the 10th item (last kept)
  });

  it('applies search as an OR across email + name, case-insensitive', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    await admin.listUsers({ search: 'alice' });
    const call = prisma.user.findMany.mock.calls[0]![0];
    expect(call.where).toEqual({
      OR: [
        { email: { contains: 'alice', mode: 'insensitive' } },
        { name: { contains: 'alice', mode: 'insensitive' } },
      ],
    });
  });

  it('passes cursor + skip:1 when cursor provided', async () => {
    prisma.user.findMany.mockResolvedValue([]);
    await admin.listUsers({ cursor: 'u5', limit: 10 });
    const call = prisma.user.findMany.mock.calls[0]![0];
    expect(call.cursor).toEqual({ id: 'u5' });
    expect(call.skip).toBe(1);
  });
});

describe('AdminService.userDetails', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let admin: AdminService;

  beforeEach(() => {
    prisma = makePrisma();
    admin = new AdminService(prisma as never);
  });

  it('throws NotFoundException when user is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(admin.userDetails('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns user + 30d usage window', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...makeRow(),
      _count: { conversations: 3, documents: 2, tradingStrategies: 1 },
    });
    prisma.usageRecord.groupBy.mockResolvedValue([
      {
        agentType: 'TRADING',
        _sum: { tokensInput: 100, tokensOutput: 200, costUsd: new Decimal('0.50') },
      },
    ]);

    const out = await admin.userDetails('u1');
    expect(out.user._count.conversations).toBe(3);
    expect(out.usage30d).toEqual([
      {
        agentType: 'TRADING',
        tokensInput: 100,
        tokensOutput: 200,
        costUsd: '0.5',
      },
    ]);
  });

  it('coerces null aggregate values to 0 / "0"', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...makeRow(),
      _count: { conversations: 0, documents: 0, tradingStrategies: 0 },
    });
    prisma.usageRecord.groupBy.mockResolvedValue([
      {
        agentType: 'CONTENT',
        _sum: { tokensInput: null, tokensOutput: null, costUsd: null },
      },
    ]);

    const out = await admin.userDetails('u1');
    expect(out.usage30d[0]).toMatchObject({
      tokensInput: 0,
      tokensOutput: 0,
      costUsd: '0',
    });
  });
});

describe('AdminService.platformStats', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let admin: AdminService;

  beforeEach(() => {
    prisma = makePrisma();
    admin = new AdminService(prisma as never);
  });

  it('parallelizes the five queries and returns a combined stat row', async () => {
    prisma.user.count.mockResolvedValueOnce(120).mockResolvedValueOnce(18);
    prisma.conversation.count.mockResolvedValueOnce(42).mockResolvedValueOnce(300);
    prisma.usageRecord.aggregate.mockResolvedValue({
      _sum: { tokensInput: 1_000_000, tokensOutput: 2_000_000, costUsd: new Decimal('12.34') },
    });

    const out = await admin.platformStats(30);
    expect(out).toEqual({
      windowDays: 30,
      totalUsers: 120,
      paidUsers: 18,
      dauApprox: 42,
      conversations30d: 300,
      tokensInput30d: 1_000_000,
      tokensOutput30d: 2_000_000,
      costUsd30d: '12.34',
    });
  });

  it('honors a custom window', async () => {
    prisma.user.count.mockResolvedValue(0);
    prisma.conversation.count.mockResolvedValue(0);
    prisma.usageRecord.aggregate.mockResolvedValue({
      _sum: { tokensInput: 0, tokensOutput: 0, costUsd: null },
    });
    const out = await admin.platformStats(7);
    expect(out.windowDays).toBe(7);
    expect(out.costUsd30d).toBe('0');
  });
});

describe('AdminService.agentUsage', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let admin: AdminService;

  beforeEach(() => {
    prisma = makePrisma();
    admin = new AdminService(prisma as never);
  });

  it('returns one row per agent with calls + tokens + cost', async () => {
    prisma.usageRecord.groupBy.mockResolvedValue([
      {
        agentType: 'TRADING',
        _count: { _all: 50 },
        _sum: { tokensInput: 10_000, tokensOutput: 20_000, costUsd: new Decimal('1.23') },
      },
      {
        agentType: 'MUSIC',
        _count: { _all: 7 },
        _sum: { tokensInput: 500, tokensOutput: 800, costUsd: null },
      },
    ]);

    const out = await admin.agentUsage();
    expect(out).toEqual([
      {
        agentType: 'TRADING',
        calls: 50,
        tokensInput: 10_000,
        tokensOutput: 20_000,
        costUsd: '1.23',
      },
      {
        agentType: 'MUSIC',
        calls: 7,
        tokensInput: 500,
        tokensOutput: 800,
        costUsd: '0',
      },
    ]);
  });
});

describe('AdminService.exportUsersCsv', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let admin: AdminService;

  beforeEach(() => {
    prisma = makePrisma();
    admin = new AdminService(prisma as never);
  });

  it('emits a header row followed by one CSV line per user', async () => {
    prisma.user.findMany.mockResolvedValue([
      makeRow({ id: 'u1', name: 'Alice' }),
      makeRow({ id: 'u2', email: 'c@d.com', name: null }),
    ]);
    const csv = await admin.exportUsersCsv();
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('id,clerkId,email,name,plan,createdAt');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"u1"');
    expect(lines[1]).toContain('"Alice"');
    // null name becomes empty string, never the literal "null".
    expect(lines[2]).toContain('""');
    expect(lines[2]).not.toMatch(/,null,/);
  });

  it('escapes embedded double quotes in name', async () => {
    prisma.user.findMany.mockResolvedValue([makeRow({ name: 'Al "Ace" Smith' })]);
    const csv = await admin.exportUsersCsv();
    expect(csv).toContain('"Al ""Ace"" Smith"');
  });
});
