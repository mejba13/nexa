import { describe, expect, it } from 'vitest';

import { extractThemes } from './themes';

describe('extractThemes', () => {
  it('returns empty topTerms when no chunks supplied', () => {
    const out = extractThemes([], 5);
    expect(out.topTerms).toEqual([]);
    expect(out.totalTerms).toBe(0);
  });

  it('drops stopwords and short tokens', () => {
    const out = extractThemes(
      [
        { content: 'I am the the the and and not really thing', filename: 'a.md' },
        { content: 'just very much also know think feel', filename: 'a.md' },
      ],
      5,
    );
    expect(out.topTerms).toEqual([]);
    expect(out.totalTerms).toBe(0);
  });

  it('ranks by frequency and attaches an excerpt per top term', () => {
    const out = extractThemes(
      [
        { content: 'discipline discipline discipline gratitude', filename: 'jan.md' },
        { content: 'discipline gratitude focus focus', filename: 'feb.md' },
      ],
      3,
    );
    expect(out.topTerms[0]!.term).toBe('discipline');
    expect(out.topTerms[0]!.count).toBe(4);
    expect(out.topTerms[0]!.excerpt.startsWith('jan.md')).toBe(true);

    const gratitude = out.topTerms.find((t) => t.term === 'gratitude');
    expect(gratitude?.count).toBe(2);
  });

  it('caps the result list at topK', () => {
    const out = extractThemes(
      [
        {
          content: 'alpha bravo charlie delta echo foxtrot golf hotel india juliet',
          filename: 'a.md',
        },
      ],
      4,
    );
    expect(out.topTerms).toHaveLength(4);
  });
});
