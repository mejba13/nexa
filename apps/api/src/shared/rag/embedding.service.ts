import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMBEDDING_DIMENSION } from '@nexa/types';
import OpenAI from 'openai';

import type { Env } from '../../config/env';

/**
 * OpenAI embeddings only (per PRD §7). Model fixed to text-embedding-3-small
 * because the Prisma schema declares `vector(1536)` — changing models means
 * a schema migration.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: OpenAI;
  private readonly model = 'text-embedding-3-small';
  private readonly batchSize = 20;

  constructor(config: ConfigService<Env, true>) {
    this.client = new OpenAI({ apiKey: config.get('OPENAI_API_KEY', { infer: true }) });
  }

  async embedOne(text: string): Promise<number[]> {
    const [v] = await this.embedMany([text]);
    return v;
  }

  /** Returns 1536-dim vectors aligned with `texts` by index. Batches by 20. */
  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const out: number[][] = new Array(texts.length);

    for (let i = 0; i < texts.length; i += this.batchSize) {
      const slice = texts.slice(i, i + this.batchSize);
      const res = await this.client.embeddings.create({
        model: this.model,
        input: slice,
      });
      res.data.forEach((d, k) => {
        if (d.embedding.length !== EMBEDDING_DIMENSION) {
          throw new Error(`Embedding dim ${d.embedding.length} != ${EMBEDDING_DIMENSION}`);
        }
        out[i + k] = d.embedding;
      });
    }
    return out;
  }
}
