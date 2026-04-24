import { Injectable } from '@nestjs/common';
import { getEncoding, type Tiktoken } from 'js-tiktoken';

import { CHUNK_OVERLAP_TOKENS, CHUNK_SIZE_TOKENS } from '@nexa/types';

export interface Chunk {
  index: number;
  content: string;
  tokenCount: number;
}

/**
 * Token-accurate chunker. 512-token chunks with 64-token overlap (PRD §F-004).
 * Uses cl100k_base encoding — matches OpenAI's text-embedding-3-small.
 */
@Injectable()
export class ChunkingService {
  private encoding: Tiktoken | null = null;

  private enc(): Tiktoken {
    if (!this.encoding) this.encoding = getEncoding('cl100k_base');
    return this.encoding;
  }

  chunk(text: string, opts: { size?: number; overlap?: number } = {}): Chunk[] {
    const size = opts.size ?? CHUNK_SIZE_TOKENS;
    const overlap = opts.overlap ?? CHUNK_OVERLAP_TOKENS;
    if (overlap >= size) throw new Error('overlap must be < size');

    const enc = this.enc();
    const tokens = enc.encode(text);
    if (tokens.length === 0) return [];

    const chunks: Chunk[] = [];
    let start = 0;
    let index = 0;
    while (start < tokens.length) {
      const end = Math.min(start + size, tokens.length);
      const slice = tokens.slice(start, end);
      chunks.push({
        index: index++,
        content: enc.decode(slice),
        tokenCount: slice.length,
      });
      if (end === tokens.length) break;
      start = end - overlap;
    }
    return chunks;
  }
}
