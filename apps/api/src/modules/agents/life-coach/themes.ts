/**
 * Deterministic theme extraction helper.
 * Not LLM-powered — runs bag-of-words with stopword removal over journal chunks
 * so the Life Coach agent can never hallucinate themes that aren't actually in
 * the user's text. Claude synthesizes narrative themes from the frequency table
 * returned here + a representative excerpt per top term.
 */

// Small English stopword list. Kept local so the module stays zero-dep.
const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'but',
  'by',
  'do',
  'does',
  'for',
  'from',
  'had',
  'has',
  'have',
  'he',
  'her',
  'his',
  'i',
  'if',
  'im',
  'in',
  'is',
  'it',
  'its',
  'just',
  'like',
  'me',
  'my',
  'myself',
  'no',
  'not',
  'of',
  'on',
  'or',
  'our',
  'out',
  'over',
  'she',
  'so',
  'some',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'to',
  'too',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'who',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your',
  'about',
  'after',
  'again',
  'against',
  'all',
  'am',
  'any',
  'because',
  'before',
  'being',
  'between',
  'both',
  'can',
  'did',
  'doing',
  'down',
  'during',
  'each',
  'few',
  'further',
  'here',
  'how',
  'into',
  'more',
  'most',
  'off',
  'once',
  'only',
  'other',
  'own',
  'same',
  'should',
  'such',
  'through',
  'under',
  'until',
  'up',
  'don',
  'doesn',
  'didn',
  'now',
  'also',
  'get',
  'got',
  'going',
  'thing',
  'things',
  'really',
  'much',
  'way',
  'know',
  'think',
  'feel',
  'feeling',
  'felt',
]);

export interface ThemeTerm {
  term: string;
  count: number;
  excerpt: string;
}

export function extractThemes(
  chunks: Array<{ content: string; filename: string; createdAt?: string }>,
  topK = 10,
): { totalTerms: number; topTerms: ThemeTerm[] } {
  const counts = new Map<string, number>();
  const firstExcerpt = new Map<string, string>();

  for (const chunk of chunks) {
    const tokens = chunk.content
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !STOPWORDS.has(t));

    const seenThisChunk = new Set<string>();
    for (const t of tokens) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
      if (!firstExcerpt.has(t)) {
        const excerpt = truncateAt(chunk.content, 240);
        firstExcerpt.set(t, `${chunk.filename}: ${excerpt}`);
      }
      seenThisChunk.add(t);
    }
  }

  const topTerms: ThemeTerm[] = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([term, count]) => ({
      term,
      count,
      excerpt: firstExcerpt.get(term) ?? '',
    }));

  return { totalTerms: counts.size, topTerms };
}

function truncateAt(text: string, maxChars: number): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length <= maxChars ? compact : compact.slice(0, maxChars - 1) + '…';
}
