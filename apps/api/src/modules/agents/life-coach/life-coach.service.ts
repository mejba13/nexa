import { Injectable, NotFoundException } from '@nestjs/common';
import type { DocStatus } from '@prisma/client';

import { PrismaService } from '../../../shared/prisma/prisma.service';
import { RetrievalService, type RetrievedChunk } from '../../../shared/rag/retrieval.service';

import { buildDecisionFramework, type DecisionFramework } from './decision-framework';
import { extractThemes, type ThemeTerm } from './themes';

@Injectable()
export class LifeCoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieval: RetrievalService,
  ) {}

  async journalStatus(
    userId: string,
    documentId: string,
  ): Promise<{ status: DocStatus; chunks: number; filename: string }> {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, userId, agentType: 'LIFE_COACH' },
    });
    if (!doc) throw new NotFoundException('Journal document not found');
    const chunks = await this.prisma.documentChunk.count({
      where: { documentId: doc.id },
    });
    return { status: doc.status, chunks, filename: doc.filename };
  }

  async queryPastReflections(userId: string, query: string, topK = 6): Promise<RetrievedChunk[]> {
    return this.retrieval.retrieve({
      userId,
      agentType: 'LIFE_COACH',
      query,
      topK,
    });
  }

  /**
   * Pulls the most recent N chunks across all LIFE_COACH documents and runs
   * deterministic frequency analysis. Claude synthesizes narrative themes from
   * the returned terms + excerpts — never invents them.
   */
  async extractJournalThemes(
    userId: string,
    params: { limit?: number; topK?: number } = {},
  ): Promise<{
    sampledChunks: number;
    documents: number;
    totalTerms: number;
    topTerms: ThemeTerm[];
  }> {
    const limit = params.limit ?? 120;
    const rows = await this.prisma.$queryRawUnsafe<
      Array<{ content: string; filename: string; createdAt: Date }>
    >(
      `SELECT c.content, d.filename, c."createdAt"
         FROM "DocumentChunk" c
         JOIN "Document" d ON d.id = c."documentId"
        WHERE d."userId" = $1
          AND d."agentType" = 'LIFE_COACH'::"AgentType"
          AND d.status = 'INDEXED'
        ORDER BY c."createdAt" DESC
        LIMIT $2`,
      userId,
      limit,
    );

    const chunks = rows.map((r) => ({
      content: r.content,
      filename: r.filename,
      createdAt: r.createdAt?.toISOString?.() ?? '',
    }));
    const filenames = new Set(chunks.map((c) => c.filename));
    const { totalTerms, topTerms } = extractThemes(chunks, params.topK ?? 10);

    return {
      sampledChunks: chunks.length,
      documents: filenames.size,
      totalTerms,
      topTerms,
    };
  }

  decisionFramework(prompt: string): DecisionFramework {
    return buildDecisionFramework(prompt);
  }
}
