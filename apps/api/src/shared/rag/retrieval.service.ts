import { Injectable, Logger } from '@nestjs/common';
import type { AgentType } from '@nexa/types';

import { PrismaService } from '../prisma/prisma.service';

import { EmbeddingService } from './embedding.service';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  filename: string;
  chunkIndex: number;
  content: string;
  distance: number;
}

/**
 * pgvector similarity search, always scoped by (userId, agentType) — PRD §12.
 * Uses the `<=>` cosine distance operator on DocumentChunk.embedding.
 */
@Injectable()
export class RetrievalService {
  private readonly logger = new Logger(RetrievalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingService,
  ) {}

  async retrieve(params: {
    userId: string;
    agentType: AgentType;
    query: string;
    topK?: number;
  }): Promise<RetrievedChunk[]> {
    const topK = params.topK ?? 6;
    const [queryVec] = await this.embeddings.embedMany([params.query]);
    const vec = `[${queryVec.join(',')}]`;

    // Raw query — Prisma doesn't natively type pgvector. Parameterized, so safe.
    const rows = await this.prisma.$queryRawUnsafe<
      Array<{
        id: string;
        documentId: string;
        filename: string;
        chunkIndex: number;
        content: string;
        distance: number;
      }>
    >(
      `
      SELECT c.id, c."documentId", d.filename, c."chunkIndex", c.content,
             (c.embedding <=> $1::vector) AS distance
      FROM "DocumentChunk" c
      JOIN "Document" d ON d.id = c."documentId"
      WHERE d."userId" = $2 AND d."agentType" = $3::"AgentType"
        AND d.status = 'INDEXED'
      ORDER BY c.embedding <=> $1::vector
      LIMIT $4
      `,
      vec,
      params.userId,
      params.agentType,
      topK,
    );

    return rows;
  }
}
