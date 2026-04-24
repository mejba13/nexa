/**
 * Platform authoring rules used by Content Strategist tools.
 * These are deterministic constraints the agent MUST respect — returning them
 * from a tool prevents the model from inventing char limits or structure.
 */

export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'threads' | 'facebook';

export type VideoPlatform = 'tiktok' | 'reels' | 'shorts' | 'youtube';

export interface SocialSpec {
  platform: SocialPlatform;
  maxChars: number;
  hashtagGuidance: string;
  mentionGuidance: string;
  hookPatterns: string[];
  ctaPatterns: string[];
  emojiGuidance: string;
  bestFor: string;
}

export interface VideoSpec {
  platform: VideoPlatform;
  durationSec: { min: number; ideal: number; max: number };
  structure: Array<{ section: string; seconds: number; purpose: string }>;
  hookTips: string[];
  ctaTips: string[];
}

export const SOCIAL_SPECS: Record<SocialPlatform, SocialSpec> = {
  twitter: {
    platform: 'twitter',
    maxChars: 280,
    hashtagGuidance: '0–2 hashtags; sparse use lifts reach',
    mentionGuidance: 'Lead with @mention only for replies; otherwise skip',
    hookPatterns: [
      'Contrarian take: "Everyone says X. Here\'s why that\'s wrong."',
      'Specific number: "I tested 47 X. Only 3 worked."',
      'Myth-bust: "X is a lie. Here\'s the truth:"',
    ],
    ctaPatterns: ['Reply with your take', 'RT if you agree', 'Bookmark for later'],
    emojiGuidance: 'One emoji max; avoid for B2B accounts',
    bestFor: 'Hot takes, short insights, threads (7–10 tweets).',
  },
  linkedin: {
    platform: 'linkedin',
    maxChars: 3000,
    hashtagGuidance: '3–5 hashtags at the end',
    mentionGuidance: 'Tag relevant people/companies once context is established',
    hookPatterns: [
      'Personal story: "Three years ago I..."',
      'Counter-intuitive claim: "The best X I made cost me..."',
      'Numbered list promise: "5 things I learned after X"',
    ],
    ctaPatterns: [
      'What would you add? Drop a comment.',
      'Follow for weekly lessons on X',
      'Save this post and share with your team',
    ],
    emojiGuidance: 'Use sparingly as bullet markers (→, ✅, ❌)',
    bestFor: 'Long-form stories, career insights, B2B thought leadership.',
  },
  instagram: {
    platform: 'instagram',
    maxChars: 2200,
    hashtagGuidance: '5–10 hashtags, mix popular + niche',
    mentionGuidance: 'Tag creators / brands relevant to the post',
    hookPatterns: [
      'Scroll-stop question: "Ever wonder why X?"',
      'Bold declaration on line 1',
      'Curiosity gap: "This changed how I X..."',
    ],
    ctaPatterns: ['Save this post', 'Share with a friend who needs this', 'Comment X'],
    emojiGuidance: 'Generous, native to platform; use as section breaks',
    bestFor: 'Visual-led storytelling, carousels, Reels companion copy.',
  },
  threads: {
    platform: 'threads',
    maxChars: 500,
    hashtagGuidance: '0–2 hashtags; culture is conversational, not SEO',
    mentionGuidance: 'Mention users to pull them into the thread',
    hookPatterns: ['Question format native to Threads culture', 'Take-first, context-later lines'],
    ctaPatterns: ['Reply with yours', 'Repost if real'],
    emojiGuidance: 'Casual — 1–3 per post',
    bestFor: 'Punchy takes, conversation starters, IG audience cross-over.',
  },
  facebook: {
    platform: 'facebook',
    maxChars: 63_206,
    hashtagGuidance: '1–3 hashtags at most; Facebook deprioritizes them',
    mentionGuidance: 'Tag pages / people to expand reach to their networks',
    hookPatterns: ['Relatable anecdote opener', 'Strong visual + 1-line framing'],
    ctaPatterns: ['Share if this resonates', 'Tag a friend who...'],
    emojiGuidance: 'Natural, aligns with audience age / demographic',
    bestFor: 'Community engagement, event promotion, long captions.',
  },
};

export const VIDEO_SPECS: Record<VideoPlatform, VideoSpec> = {
  tiktok: {
    platform: 'tiktok',
    durationSec: { min: 15, ideal: 30, max: 180 },
    structure: [
      { section: 'Hook', seconds: 3, purpose: 'Stop the scroll in under 3s' },
      { section: 'Promise', seconds: 5, purpose: "Tell viewer what they'll get" },
      { section: 'Value', seconds: 18, purpose: 'Deliver the goods in beats' },
      { section: 'CTA', seconds: 4, purpose: 'Comment / follow / save prompt' },
    ],
    hookTips: [
      'Pattern interrupt: unexpected visual or line',
      'Lead with the result, not the setup',
      'Ask a question that makes them need the answer',
    ],
    ctaTips: ['Ask for a specific comment word', 'Tease the next video', 'Pin the CTA comment'],
  },
  reels: {
    platform: 'reels',
    durationSec: { min: 15, ideal: 30, max: 90 },
    structure: [
      { section: 'Hook', seconds: 3, purpose: 'Stop scroll' },
      { section: 'Setup', seconds: 7, purpose: 'Context + tension' },
      { section: 'Payoff', seconds: 16, purpose: 'Deliver the promise visually' },
      { section: 'CTA', seconds: 4, purpose: 'Save / share prompt' },
    ],
    hookTips: ['Motion in first frame', 'Text overlay with 4-word promise', 'Trending audio'],
    ctaTips: ['Save for later', 'Send to a friend who...', 'Follow for part 2'],
  },
  shorts: {
    platform: 'shorts',
    durationSec: { min: 15, ideal: 45, max: 60 },
    structure: [
      { section: 'Hook', seconds: 3, purpose: 'Instant value claim' },
      { section: 'Body', seconds: 45, purpose: 'Tight value delivery' },
      { section: 'CTA', seconds: 7, purpose: 'Subscribe / like prompt' },
    ],
    hookTips: ['Clear audio in first 2s', 'Big on-screen text', 'Question > statement'],
    ctaTips: ['Subscribe for more', 'Like if useful', 'Watch the full vid on my channel'],
  },
  youtube: {
    platform: 'youtube',
    durationSec: { min: 300, ideal: 600, max: 1800 },
    structure: [
      { section: 'Cold open', seconds: 15, purpose: 'Strongest hook, curiosity gap' },
      { section: 'Promise + credibility', seconds: 30, purpose: 'Why you / why listen' },
      { section: 'Main content', seconds: 480, purpose: '3–5 meaty chapters' },
      { section: 'Summary + CTA', seconds: 60, purpose: 'Recap + subscribe ask' },
    ],
    hookTips: ['Show result first, then how', 'Ask the forbidden question', 'Start mid-action'],
    ctaTips: ['Link the next video at the end', 'End screen subscribe + related video'],
  },
};

export interface BlogSpec {
  targetWords: { min: number; ideal: number; max: number };
  headingStructure: string[];
  seoChecklist: string[];
  metaDescriptionMaxChars: number;
  titleMaxChars: number;
  keywordDensityTargetPct: { min: number; max: number };
}

export const BLOG_SEO_SPEC: BlogSpec = {
  targetWords: { min: 800, ideal: 1500, max: 3000 },
  headingStructure: [
    'H1: One primary keyword, 50–65 chars',
    'H2: Section leads, semantic variants of the keyword',
    'H3: Sub-points, 3–5 under each H2',
    'Intro: 60–80 words, state promise + credibility',
    'Conclusion: recap + single CTA',
  ],
  seoChecklist: [
    'Primary keyword in H1, first 100 words, and meta description',
    'Include 2–4 semantic variants in H2s',
    'Internal links to 2–3 related posts',
    'External link to 1 authoritative source',
    'Alt text on every image, including the primary keyword once',
    'Meta description rewritten per post — never auto-gen',
    'URL slug is the primary keyword, no stop words',
  ],
  metaDescriptionMaxChars: 155,
  titleMaxChars: 60,
  keywordDensityTargetPct: { min: 0.8, max: 1.5 },
};
