import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { ChunkingService } from '../../shared/rag/chunking.service';
import { EmbeddingService } from '../../shared/rag/embedding.service';
import { R2StorageService } from '../../shared/storage/r2.service';

import { FileParserService } from './file-parser.service';
import { DOCUMENT_QUEUE, type ProcessDocumentJob } from './queue.constants';

/**
 * Background worker for the file-processing queue (PRD §F-004).
 *
 *   R2 download → text extract → 512/64 chunk → OpenAI embed (batch 20)
 *   → insert rows with pgvector values → flip status INDEXED.
 *
 * Retries 3× with exponential backoff (configured at enqueue time).
 * On terminal failure we mark the document FAILED so the UI can surface it.
 */
@Processor(DOCUMENT_QUEUE)
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: R2StorageService,
    private readonly parser: FileParserService,
    private readonly chunker: ChunkingService,
    private readonly embeddings: EmbeddingService,
  ) {
    super();
  }

  async process(job: Job<ProcessDocumentJob>): Promise<void> {
    const { documentId } = job.data;
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) throw new Error(`Document ${documentId} not found`);

    try {
      const meta = doc.metadata as { key?: string } | null;
      if (!meta?.key) throw new Error('Missing R2 key in document metadata');

      // TRADING CSVs are raw market data — the backtest engine consumes the full
      // buffer deterministically. Skip chunk/embed so we don't waste OpenAI calls
      // and don't leak bars into RAG retrieval.
      if (doc.agentType === 'TRADING' && doc.mimeType === 'text/csv') {
        await this.prisma.document.update({
          where: { id: documentId },
          data: { status: 'INDEXED' },
        });
        this.logger.log(`Registered TRADING CSV ${documentId} (no RAG indexing)`);
        return;
      }

      const buffer = await this.storage.getObject(meta.key);
      const text = await this.parser.parse(buffer, doc.mimeType);
      if (!text) throw new Error('Parser produced no text');

      const chunks = this.chunker.chunk(text);
      if (chunks.length === 0) throw new Error('No chunks produced');

      const vectors = await this.embeddings.embedMany(chunks.map((c) => c.content));

      // Insert chunks + embeddings. pgvector values are written as raw SQL since
      // Prisma doesn't model the `vector` type natively.
      await this.prisma.$transaction(async (tx) => {
        await tx.documentChunk.deleteMany({ where: { documentId } });
        for (let i = 0; i < chunks.length; i++) {
          const c = chunks[i];
          const vec = `[${vectors[i].join(',')}]`;
          await tx.$executeRawUnsafe(
            `INSERT INTO "DocumentChunk" (id, "documentId", "chunkIndex", content, embedding, metadata)
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4::vector, $5::jsonb)`,
            documentId,
            c.index,
            c.content,
            vec,
            JSON.stringify({ tokenCount: c.tokenCount }),
          );
        }
        await tx.document.update({
          where: { id: documentId },
          data: { status: 'INDEXED' },
        });
      });

      this.logger.log(`Indexed ${chunks.length} chunks for ${documentId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Processing failed for ${documentId}: ${message}`);

      // Only mark FAILED once all attempts exhausted.
      if ((job.attemptsMade ?? 0) + 1 >= (job.opts.attempts ?? 1)) {
        await this.prisma.document.update({
          where: { id: documentId },
          data: { status: 'FAILED', metadata: { ...(doc.metadata as object), error: message } },
        });
      }
      throw err;
    }
  }
}
