import { describe, expect, it } from 'vitest';

import { ChunkingService } from './chunking.service';

const chunker = new ChunkingService();

describe('ChunkingService', () => {
  it('returns no chunks for empty input', () => {
    expect(chunker.chunk('')).toEqual([]);
  });

  it('produces a single chunk when content fits in one window', () => {
    const out = chunker.chunk('Just a short sentence.', { size: 512, overlap: 64 });
    expect(out).toHaveLength(1);
    expect(out[0]!.index).toBe(0);
    expect(out[0]!.tokenCount).toBeGreaterThan(0);
    expect(out[0]!.tokenCount).toBeLessThan(512);
  });

  it('overlaps consecutive chunks by the configured token count', () => {
    const long = 'word '.repeat(2000);
    const out = chunker.chunk(long, { size: 100, overlap: 20 });
    expect(out.length).toBeGreaterThan(1);
    for (let i = 0; i < out.length - 1; i++) {
      expect(out[i]!.tokenCount).toBeLessThanOrEqual(100);
    }
    // Indices increase monotonically and start at 0.
    expect(out.map((c) => c.index)).toEqual(out.map((_, i) => i));
  });

  it('rejects overlap >= size', () => {
    expect(() => chunker.chunk('hello', { size: 50, overlap: 50 })).toThrow(/overlap/);
    expect(() => chunker.chunk('hello', { size: 50, overlap: 60 })).toThrow(/overlap/);
  });
});
