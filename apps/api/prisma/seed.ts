/**
 * Nexa database seed.
 *
 *   Run:   pnpm db:seed
 *   Safe:  idempotent — rerunning is a no-op (upserts throughout).
 *
 * Two tiers of seed data:
 *
 *   1. ALWAYS run — the four Agent rows with production-grade system prompts.
 *      These are the contract the orchestrator reads at chat time.
 *
 *   2. Example accounts — realistic user personas and content that mirror
 *      the PRD §4 target users. The content is application-relevant (real
 *      strategy shapes, real brand-guide filenames, real journal cadences,
 *      real usage patterns) so every feature surface has plausible data
 *      the moment the stack boots: admin dashboard, billing usage bars,
 *      trading workspace, agent chats, knowledge bases.
 *      Skipped when NODE_ENV === 'production' (unless SEED_DEMO_DATA=1
 *      explicitly overrides).
 *
 * Seeded users carry clerkId=`user_seed_<slug>` so they never collide with
 * real Clerk-synced users. Emails use `.example` to prevent accidental
 * outbound sends.
 */
/* eslint-disable no-console */
import { randomUUID } from 'node:crypto';

import { AgentType, Plan, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// ==================================================================
// 1. Agents — production system prompts
// ==================================================================

interface AgentSeed {
  type: AgentType;
  name: string;
  description: string;
  systemPrompt: string;
  tools: Array<{ name: string; description: string }>;
}

const AGENTS: AgentSeed[] = [
  {
    type: 'TRADING',
    name: 'Trading Analyst',
    description:
      'Autonomous quantitative research partner. Turns trading ideas into rigorously tested strategies using a deterministic backtesting engine — no fabricated performance numbers, ever.',
    systemPrompt: `You are Nexa's Trading Analyst — an autonomous quantitative research partner powered by Claude. You help traders turn ideas into rigorously tested strategies using a deterministic backtesting engine.

Core principles:
1. NEVER fabricate numbers. All metrics (P/L, win rate, drawdown, Sharpe ratio, profit factor, trade history) come exclusively from run_backtest and get_performance_metrics.
2. Ground every claim in data. If a user asks about performance, call the tools first, then narrate the actual output.
3. Be honest about engine limitations: long-only, single-symbol, close-fill, flat per-trade fees, no slippage model beyond the fee. Past performance is not future performance.
4. Propose concrete, testable improvements. Use suggest_improvements to anchor recommendations in the actual metrics.

Available tools:
- upload_strategy: persist a rule-based strategy (indicators, entry/exit conditions, sizing, fees).
- upload_market_data: register OHLCV bars (inline CSV or previously uploaded document).
- run_backtest: execute the deterministic simulation; persists a Backtest row.
- get_performance_metrics: fetch stored metrics + first 50 trades.
- compare_strategies: run two strategies on identical market data, return side-by-side diff.
- suggest_improvements: heuristic recommendations keyed to the metrics (win rate, drawdown, profit factor, Sharpe, no-trades case).

Rule DSL supports indicators (sma, ema, rsi, price, return), operators (<, <=, >, >=, ==), nested all/any groups, fixed-fraction sizing (0..1), per-trade fees as a percentage.

Common user tasks you handle:
- Backtesting RSI, MACD, moving-average crossover, mean-reversion, breakout strategies on stocks, crypto, forex, commodities.
- A/B comparing strategy variants across the same market regime.
- Diagnosing underperformance: win rate too low? drawdown too deep? profit factor under 1.2? Sharpe negative?
- Walk-forward validation recommendations (split the data, test out-of-sample).
- Risk-adjusted return analysis + position-sizing suggestions.

Voice: senior quant colleague. Plain language, concrete numbers from tools, explicit caveats. Avoid hedging platitudes.`,
    tools: [
      { name: 'upload_strategy', description: 'Persist a rule-based strategy (DSL)' },
      { name: 'upload_market_data', description: 'Register OHLCV bars (inline CSV or documentId)' },
      { name: 'run_backtest', description: 'Execute deterministic simulation; persists Backtest' },
      {
        name: 'get_performance_metrics',
        description: 'Fetch stored metrics + trade log (capped at 50)',
      },
      { name: 'compare_strategies', description: 'A/B two strategies on identical data' },
      {
        name: 'suggest_improvements',
        description: 'Heuristic recommendations grounded in metrics',
      },
    ],
  },
  {
    type: 'MUSIC',
    name: 'Music Producer',
    description:
      'Creative collaborator for music production, mixing, arrangement, and songwriting. Combines real Spotify reference search + Freesound sample library with curated genre palettes.',
    systemPrompt: `You are Nexa's Music Producer — a creative collaborator for music production, mixing, arrangement, and songwriting. You combine Claude's creative reasoning with real external integrations (Spotify, Freesound) and a curated palette library.

Core principles:
1. Never fabricate Spotify track URLs or Freesound sample IDs. If the APIs return not-configured errors, acknowledge honestly and offer alternatives you can describe verbally.
2. Ground genre conventions in the palette library — never invent BPM ranges, instrument lists, or arrangement templates that aren't in the suggest_instruments / suggest_arrangement output.
3. Match the user's experience level. Beginners get gear-agnostic conceptual advice; working producers get specific plugin / hardware / routing recommendations.
4. Be concrete. Specific BPM, specific key, specific song-form section lengths, specific frequency ranges. Avoid abstraction when you can be precise.

Available tools:
- search_references: real Spotify tracks matching style / mood / tempo / artist.
- suggest_instruments: genre → curated palette (core instruments, textural elements, percussion, BPM range, stylistic characteristics).
- suggest_arrangement: section-by-section song templates with bar counts (pop-32, club-dj, lofi-loop).
- generate_lyrics: lyric scaffold only (sections, rhyme scheme, syllable guidance) — you write the actual lines.
- find_samples: real Freesound search returning IDs + preview URLs + licenses.
- mixing_guidance: RAG over the user's uploaded mixing tutorials, reference notes, preset docs.

Genres covered by the palette library: lo-fi hiphop, house, afrobeats, pop, drum & bass, indie rock. For other genres describe the palette verbally and adapt pop-32 (song-form) or club-dj (mixable) templates.

Common user tasks you handle:
- Finding reference tracks that match a specific vibe, BPM, or key.
- Building instrument palettes for a new project.
- Arrangement advice for song-form vs DJ-friendly tracks.
- Writing lyrics with structural constraints (verse-chorus, aaba, freeform; aabb / abab / abcb / free rhyme).
- Sourcing royalty-free samples with license clarity.
- Mixing and mastering guidance grounded in the user's own knowledge base.

Voice: direct, creative, specific. Use musical terminology precisely. Never vague — always offer a concrete next step.`,
    tools: [
      { name: 'search_references', description: 'Spotify track search (real or typed error)' },
      { name: 'suggest_instruments', description: 'Genre → curated palette' },
      { name: 'suggest_arrangement', description: 'Section-by-section song templates' },
      { name: 'generate_lyrics', description: 'Lyric scaffold (structure + rhyme + syllables)' },
      { name: 'find_samples', description: 'Freesound.org sample search with licenses' },
      { name: 'mixing_guidance', description: 'RAG over user mixing docs' },
    ],
  },
  {
    type: 'CONTENT',
    name: 'Content Strategist',
    description:
      'Brand-voice-trained content AI. Produces publish-ready social posts, SEO blog posts, video scripts, and content calendars — grounded in your uploaded brand guide via RAG.',
    systemPrompt: `You are Nexa's Content Strategist — a brand-voice-trained content AI that produces publish-ready copy across every channel. You ground every draft in the user's uploaded brand guide via query_brand_voice so the voice is theirs, not yours.

Core principles:
1. Query brand voice FIRST. Before drafting any copy, call query_brand_voice with the topic to retrieve relevant style-guide excerpts. Never invent the brand voice.
2. Respect platform constraints EXACTLY. Char limits, hashtag counts, emoji conventions, structure — all come from generate_social_post / generate_blog_post / generate_video_script. Never exceed maxChars.
3. One strong CTA per piece. Pick from the returned pattern library; match CTA to platform + goal (awareness, engagement, conversion, thought-leadership).
4. Specific over generic. Use hooks from the returned pattern library — never your defaults.
5. Be honest about what you don't know. research_trends is deferred; if asked about current trends, decline and suggest the user paste source links.

Available tools:
- query_brand_voice: RAG over uploaded brand-guide documents.
- generate_social_post: platform constraints (Twitter 280, LinkedIn 3000, Instagram 2200, Threads 500, Facebook 63k) + hook + CTA pattern libraries + brand voice excerpts.
- generate_blog_post: SEO structure (800-3000 word targets, H1/H2 conventions, keyword density 0.8-1.5%, meta 155 char cap, title 60 char cap) + brand voice excerpts.
- generate_video_script: platform timing structure (TikTok 15-180s, Reels 15-90s, Shorts 15-60s, YouTube 5-30min) + hook + CTA tips + brand voice.
- create_content_calendar: deterministic grid builder for up to 26 weeks × channels × themes with round-robin theme rotation.
- research_trends: DEFERRED — returns a not-implemented notice; narrate honestly.

Common user tasks you handle:
- LinkedIn thought-leadership posts that sound like the user actually wrote them.
- 1500-word SEO blog posts hitting primary + semantic keywords with proper H2 structure.
- TikTok / Reels / Shorts / YouTube scripts with precise timing beats.
- 4-8 week content calendars across 2-4 channels with theme rotation.
- Rewriting existing copy to match brand voice.
- Social post series, threads, carousels.

Voice: adaptive — match the brand voice retrieved via query_brand_voice. When no brand voice is uploaded, default to professional, warm, specific.`,
    tools: [
      { name: 'query_brand_voice', description: 'RAG over brand-guide documents' },
      { name: 'generate_social_post', description: 'Platform constraints + templates + voice' },
      { name: 'generate_blog_post', description: 'SEO structure + keyword density + voice' },
      { name: 'generate_video_script', description: 'Platform timing + hook/CTA tips + voice' },
      { name: 'create_content_calendar', description: 'Multi-week grid with theme rotation' },
      { name: 'research_trends', description: 'DEFERRED — returns not-implemented notice' },
    ],
  },
  {
    type: 'LIFE_COACH',
    name: 'Life Coach',
    description:
      'Personality-aware reflection partner trained on your own journals. Every reflection is grounded in words you have already written — never invented, never moralizing.',
    systemPrompt: `You are Nexa's Life Coach — a personality-aware reflection partner trained on the user's own journals. Everything you say is grounded in words they have already written. You never invent past events, never impose a framework they didn't ask for, and never moralize.

Core principles:
1. Query journals FIRST. Before offering any reflection, call query_past_reflections or extract_themes with the situation. Ground the response in the user's own excerpts.
2. One concrete next step. Never more than one. No lists of ten suggestions — pick the single highest-leverage action.
3. Match the user's voice. Mirror the cadence, vocabulary, and rhythm of their own writing as returned by the tools.
4. No moralizing. No "you should" — only "here's what I notice in what you wrote." Let them draw the conclusion.
5. Honest about gaps. If the journals don't speak to the situation, say so plainly and suggest the user journal it first.

Available tools:
- ingest_journal: confirm an uploaded journal document is indexed + report chunk count.
- query_past_reflections: RAG retrieval against the user's journal corpus, scoped to their account only.
- extract_themes: deterministic word-frequency analysis across recent chunks (top terms + representative excerpts). Agent synthesizes narrative themes ONLY from the returned terms.
- generate_reflection: pulls situation-relevant excerpts + structural guidance. Agent composes the reflection in the user's voice.
- mood_tracker: DEFERRED — suggest journaling the mood as a plain-text entry instead.
- decision_framework: fixed Frame → Gather → Score → Commit scaffold with pre-mortem / 10-10-10 / reversibility helpers.

Common user tasks you handle:
- "What themes keep coming up in my journals?" — extract_themes + narrative synthesis grounded in returned excerpts.
- "Write me a reflection on X, in my voice." — generate_reflection + composition using the pastExcerpts + voiceAnchor.
- "Help me think through a decision." — decision_framework + user-specific context from query_past_reflections.
- "What was I writing about around this time last year?" — query_past_reflections.
- Spotting recurring emotional patterns, naming them without labels, offering a single next step.

Voice: warm, specific, non-judgmental, grounded. Use the user's own phrases when possible. Never performative empathy — no "I hear you" without substance. No therapy-speak unless the user uses it first.

Privacy: the user's journals never leave their account. Retrieval is tenant-scoped at the database layer. Nothing you see here is shared with any other user.`,
    tools: [
      { name: 'ingest_journal', description: 'Confirm a journal document is indexed' },
      { name: 'query_past_reflections', description: 'RAG over journal corpus' },
      { name: 'extract_themes', description: 'Deterministic word-frequency themes' },
      { name: 'generate_reflection', description: 'Excerpts + composition guidance' },
      { name: 'mood_tracker', description: 'DEFERRED — journal as text instead' },
      {
        name: 'decision_framework',
        description: 'Frame → Gather → Score → Commit scaffold',
      },
    ],
  },
];

async function seedAgents(): Promise<void> {
  for (const agent of AGENTS) {
    await prisma.agent.upsert({
      where: { type: agent.type },
      update: {
        name: agent.name,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        tools: agent.tools,
      },
      create: {
        type: agent.type,
        name: agent.name,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        tools: agent.tools,
      },
    });
  }
  console.log(`✓ Seeded ${AGENTS.length} agents`);
}

// ==================================================================
// 2. Example accounts — PRD §4 personas with realistic content
// ==================================================================

interface SeedUser {
  slug: string;
  email: string;
  name: string;
  plan: Plan;
  persona: string;
}

// Personas map to PRD §4 target users — exercising every plan tier + feature
// combination so admin, billing, and per-agent surfaces all have plausible
// content to render the moment the stack boots.
const SEED_USERS: SeedUser[] = [
  {
    // Operator / admin placeholder. clerkId stays `user_seed_mejba` until
    // the real account signs up — then AuthService.syncFromClerk reassigns
    // it to the real Clerk userId and pushes publicMetadata.role='admin'
    // (gated on ADMIN_EMAILS env). Demo data follows automatically because
    // every relation FK targets User.id, not clerkId.
    slug: 'mejba',
    email: 'mejba@nexa.com',
    name: 'Engr. Mejba Ahmed',
    plan: 'BUSINESS',
    persona:
      'Operator / admin · sees the full app — all four agents, populated KB, recent conversations, billing on the highest tier.',
  },
  {
    slug: 'alex',
    email: 'alex.rivera@nexa.example',
    name: 'Alex Rivera',
    plan: 'PRO',
    persona:
      'Independent creator — trading portfolio, music production, content output. PRD §4 persona 1.',
  },
  {
    slug: 'priya',
    email: 'priya.shah@nexa.example',
    name: 'Priya Shah',
    plan: 'STARTER',
    persona:
      'Retail quant — backtests strategies on daily OHLCV, light Content use for trading-twitter threads. PRD §4 persona 2.',
  },
  {
    slug: 'marcus',
    email: 'marcus.chen@nexa.example',
    name: 'Marcus Chen',
    plan: 'BUSINESS',
    persona:
      'Startup CEO — 3 years of journals uploaded to Life Coach, Content for thought leadership. PRD §4 persona 3.',
  },
  {
    slug: 'sofia',
    email: 'sofia.delgado@nexa.example',
    name: 'Sofia Delgado',
    plan: 'PRO',
    persona:
      'Brand manager — 50+ posts/month from Content with a strict brand voice. PRD §4 persona 4.',
  },
  {
    slug: 'jordan',
    email: 'jordan.okafor@nexa.example',
    name: 'Jordan Okafor',
    plan: 'FREE',
    persona: 'Free-tier evaluator — one strategy backtested, trending toward quota ceiling.',
  },
];

async function seedUsers(): Promise<Map<string, string>> {
  const idBySlug = new Map<string, string>();
  for (const u of SEED_USERS) {
    const row = await prisma.user.upsert({
      where: { clerkId: `user_seed_${u.slug}` },
      update: { email: u.email, name: u.name, plan: u.plan },
      create: {
        clerkId: `user_seed_${u.slug}`,
        email: u.email,
        name: u.name,
        plan: u.plan,
      },
    });
    idBySlug.set(u.slug, row.id);
  }
  console.log(`✓ Seeded ${SEED_USERS.length} example accounts`);
  return idBySlug;
}

async function seedUserAgentLinks(userIds: Map<string, string>): Promise<void> {
  const agents = await prisma.agent.findMany({ select: { id: true, type: true } });
  const byType = new Map(agents.map((a) => [a.type, a.id]));

  // alex uses all four; priya = trading+content; marcus = lifecoach+content;
  // sofia = content only; jordan = trading (free tier).
  const links: Array<{ slug: string; types: AgentType[] }> = [
    { slug: 'mejba', types: ['TRADING', 'MUSIC', 'CONTENT', 'LIFE_COACH'] },
    { slug: 'alex', types: ['TRADING', 'MUSIC', 'CONTENT', 'LIFE_COACH'] },
    { slug: 'priya', types: ['TRADING', 'CONTENT'] },
    { slug: 'marcus', types: ['LIFE_COACH', 'CONTENT'] },
    { slug: 'sofia', types: ['CONTENT'] },
    { slug: 'jordan', types: ['TRADING'] },
  ];

  let count = 0;
  for (const { slug, types } of links) {
    const userId = userIds.get(slug);
    if (!userId) continue;
    for (const t of types) {
      const agentId = byType.get(t);
      if (!agentId) continue;
      await prisma.userAgent.upsert({
        where: { userId_agentId: { userId, agentId } },
        update: {},
        create: { userId, agentId },
      });
      count++;
    }
  }
  console.log(`✓ Seeded ${count} UserAgent links`);
}

// ==================================================================
// 3. Trading — strategies + backtests
// ==================================================================

const TRADING_STRATEGIES = [
  {
    name: 'RSI Mean Reversion · BTC daily',
    description:
      'Classic mean-reversion: buy when 14-day RSI dips below 30, sell when it tops 70. Baseline to compare other crypto strategies against.',
    rules: {
      symbol: 'BTC',
      entry: {
        combinator: 'all',
        conditions: [{ left: { indicator: 'rsi', period: 14 }, op: '<', right: 30 }],
      },
      exit: {
        combinator: 'all',
        conditions: [{ left: { indicator: 'rsi', period: 14 }, op: '>', right: 70 }],
      },
      sizing: { type: 'fixed_fraction', fraction: 1 },
      fees: { perTradePct: 0.001 },
    },
  },
  {
    name: 'SMA Crossover · SPY weekly',
    description:
      'Trend-following long: enter when SMA 20 > SMA 50, exit on the inverse cross. Works in clear trend regimes, whipsaws in chop.',
    rules: {
      symbol: 'SPY',
      entry: {
        combinator: 'all',
        conditions: [
          {
            left: { indicator: 'sma', period: 20 },
            op: '>',
            right: { indicator: 'sma', period: 50 },
          },
        ],
      },
      exit: {
        combinator: 'all',
        conditions: [
          {
            left: { indicator: 'sma', period: 20 },
            op: '<',
            right: { indicator: 'sma', period: 50 },
          },
        ],
      },
      sizing: { type: 'fixed_fraction', fraction: 0.5 },
      fees: { perTradePct: 0.0005 },
    },
  },
  {
    name: 'EMA-9 Breakout · ETH',
    description:
      'Momentum breakout: buy on price-above-EMA9 with 14-day RSI > 55 confirmation, exit on RSI < 45. Faster signal than SMA crossover.',
    rules: {
      symbol: 'ETH',
      entry: {
        combinator: 'all',
        conditions: [
          {
            left: { indicator: 'price' },
            op: '>',
            right: { indicator: 'ema', period: 9 },
          },
          { left: { indicator: 'rsi', period: 14 }, op: '>', right: 55 },
        ],
      },
      exit: {
        combinator: 'all',
        conditions: [{ left: { indicator: 'rsi', period: 14 }, op: '<', right: 45 }],
      },
      sizing: { type: 'fixed_fraction', fraction: 0.75 },
      fees: { perTradePct: 0.001 },
    },
  },
  {
    name: 'Volatility Pullback · AAPL',
    description:
      'Buy dips in an uptrend: price > SMA 50 AND 14-day RSI < 35, exit on RSI > 60. Targets quality tech names in clear trends.',
    rules: {
      symbol: 'AAPL',
      entry: {
        combinator: 'all',
        conditions: [
          {
            left: { indicator: 'price' },
            op: '>',
            right: { indicator: 'sma', period: 50 },
          },
          { left: { indicator: 'rsi', period: 14 }, op: '<', right: 35 },
        ],
      },
      exit: {
        combinator: 'all',
        conditions: [{ left: { indicator: 'rsi', period: 14 }, op: '>', right: 60 }],
      },
      sizing: { type: 'fixed_fraction', fraction: 0.6 },
      fees: { perTradePct: 0.0005 },
    },
  },
];

async function seedTradingData(userIds: Map<string, string>): Promise<void> {
  // Attribute strategies to mejba (admin), alex (multi-domain), and priya (quant)
  // so the admin workspace has trading content out of the box.
  const owners = ['mejba', 'alex', 'priya'];

  const strategyIds: string[] = [];
  for (const [i, strat] of TRADING_STRATEGIES.entries()) {
    const ownerSlug = owners[i % owners.length]!;
    const userId = userIds.get(ownerSlug);
    if (!userId) continue;

    // Look for existing by (userId, name) to keep idempotent.
    const existing = await prisma.tradingStrategy.findFirst({
      where: { userId, name: strat.name },
    });
    const row = existing
      ? await prisma.tradingStrategy.update({
          where: { id: existing.id },
          data: {
            description: strat.description,
            rules: strat.rules as unknown as object,
          },
        })
      : await prisma.tradingStrategy.create({
          data: {
            userId,
            name: strat.name,
            description: strat.description,
            rules: strat.rules as unknown as object,
          },
        });
    strategyIds.push(row.id);
  }
  console.log(`✓ Seeded ${strategyIds.length} trading strategies`);

  // Two synthetic backtests per strategy — different periods, realistic metrics.
  const backtestTemplates = [
    {
      suffix: '2023-Q1-Q2',
      start: '2023-01-02',
      end: '2023-06-30',
      initial: 10_000,
      final: 12_350,
      winRate: 0.58,
      maxDrawdown: -8.4,
      sharpe: 1.42,
      totalTrades: 18,
    },
    {
      suffix: '2023-Q3-Q4',
      start: '2023-07-03',
      end: '2023-12-29',
      initial: 10_000,
      final: 11_120,
      winRate: 0.47,
      maxDrawdown: -14.1,
      sharpe: 0.68,
      totalTrades: 24,
    },
  ];

  let btCount = 0;
  for (const stratId of strategyIds) {
    for (const tpl of backtestTemplates) {
      // Idempotency key: strategyId + startDate.
      const existing = await prisma.backtest.findFirst({
        where: { strategyId: stratId, startDate: new Date(tpl.start) },
      });
      const result = {
        metrics: {
          startDate: new Date(tpl.start).toISOString(),
          endDate: new Date(tpl.end).toISOString(),
          initialCapital: tpl.initial,
          finalCapital: tpl.final,
          totalReturnPct: ((tpl.final - tpl.initial) / tpl.initial) * 100,
          totalTrades: tpl.totalTrades,
          winRate: tpl.winRate,
          avgWinPct: 4.8,
          avgLossPct: -2.3,
          profitFactor: 1.45,
          maxDrawdownPct: tpl.maxDrawdown,
          sharpeRatio: tpl.sharpe,
        },
        trades: [],
        equity: [],
      };

      if (!existing) {
        await prisma.backtest.create({
          data: {
            strategyId: stratId,
            symbol: 'DEMO',
            startDate: new Date(tpl.start),
            endDate: new Date(tpl.end),
            initialCapital: new Decimal(tpl.initial.toFixed(2)),
            finalCapital: new Decimal(tpl.final.toFixed(2)),
            winRate: tpl.winRate,
            maxDrawdown: tpl.maxDrawdown,
            sharpeRatio: tpl.sharpe,
            totalTrades: tpl.totalTrades,
            results: result as unknown as object,
          },
        });
        btCount++;
      }
    }
  }
  console.log(`✓ Seeded ${btCount} backtests`);
}

// ==================================================================
// 4. Documents — brand guides, journals, mixing notes
// ==================================================================

interface DemoDocument {
  ownerSlug: string;
  agentType: AgentType;
  filename: string;
  mimeType: string;
  bytes: number;
}

const DEMO_DOCUMENTS: DemoDocument[] = [
  // Content — brand voice docs
  {
    ownerSlug: 'sofia',
    agentType: 'CONTENT',
    filename: 'acme-brand-guide-2026.pdf',
    mimeType: 'application/pdf',
    bytes: 1_240_000,
  },
  {
    ownerSlug: 'sofia',
    agentType: 'CONTENT',
    filename: 'acme-voice-and-tone.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    bytes: 84_000,
  },
  {
    ownerSlug: 'sofia',
    agentType: 'CONTENT',
    filename: 'linkedin-top-performing-posts.md',
    mimeType: 'text/markdown',
    bytes: 28_000,
  },
  {
    ownerSlug: 'alex',
    agentType: 'CONTENT',
    filename: 'personal-brand-pillars.md',
    mimeType: 'text/markdown',
    bytes: 12_000,
  },
  {
    ownerSlug: 'marcus',
    agentType: 'CONTENT',
    filename: 'startup-thought-leadership-playbook.pdf',
    mimeType: 'application/pdf',
    bytes: 980_000,
  },
  // Life Coach — journals
  {
    ownerSlug: 'marcus',
    agentType: 'LIFE_COACH',
    filename: 'journal-2024-q3.txt',
    mimeType: 'text/plain',
    bytes: 145_000,
  },
  {
    ownerSlug: 'marcus',
    agentType: 'LIFE_COACH',
    filename: 'journal-2024-q4.txt',
    mimeType: 'text/plain',
    bytes: 132_000,
  },
  {
    ownerSlug: 'marcus',
    agentType: 'LIFE_COACH',
    filename: 'journal-2025-h1.pdf',
    mimeType: 'application/pdf',
    bytes: 870_000,
  },
  {
    ownerSlug: 'alex',
    agentType: 'LIFE_COACH',
    filename: 'weekly-reflections.md',
    mimeType: 'text/markdown',
    bytes: 44_000,
  },
  // Music — mixing notes
  {
    ownerSlug: 'alex',
    agentType: 'MUSIC',
    filename: 'mixing-vocals-fabfilter-presets.md',
    mimeType: 'text/markdown',
    bytes: 18_000,
  },
  {
    ownerSlug: 'alex',
    agentType: 'MUSIC',
    filename: 'mastering-chain-reference.pdf',
    mimeType: 'application/pdf',
    bytes: 560_000,
  },
  // Trading — OHLCV CSVs (these will NOT be chunked — processor short-circuits)
  {
    ownerSlug: 'alex',
    agentType: 'TRADING',
    filename: 'btc-daily-2023.csv',
    mimeType: 'text/csv',
    bytes: 32_000,
  },
  {
    ownerSlug: 'priya',
    agentType: 'TRADING',
    filename: 'spy-weekly-2020-2024.csv',
    mimeType: 'text/csv',
    bytes: 26_000,
  },

  // ============ MEJBA — admin operator workspace ============
  // Spans every agent so the admin sees a populated KB out of the box.
  {
    ownerSlug: 'mejba',
    agentType: 'CONTENT',
    filename: 'nexa-brand-voice-2026.pdf',
    mimeType: 'application/pdf',
    bytes: 482_000,
  },
  {
    ownerSlug: 'mejba',
    agentType: 'CONTENT',
    filename: 'launch-announcement-template.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    bytes: 64_000,
  },
  {
    ownerSlug: 'mejba',
    agentType: 'TRADING',
    filename: 'spy-daily-2024.csv',
    mimeType: 'text/csv',
    bytes: 38_000,
  },
  {
    ownerSlug: 'mejba',
    agentType: 'LIFE_COACH',
    filename: 'q1-weekly-review-template.md',
    mimeType: 'text/markdown',
    bytes: 12_000,
  },
  {
    ownerSlug: 'mejba',
    agentType: 'LIFE_COACH',
    filename: '2026-okrs.md',
    mimeType: 'text/markdown',
    bytes: 8_400,
  },
  {
    ownerSlug: 'mejba',
    agentType: 'MUSIC',
    filename: 'reference-tracks-lofi.txt',
    mimeType: 'text/plain',
    bytes: 4_200,
  },
];

async function seedDocuments(userIds: Map<string, string>): Promise<void> {
  let count = 0;
  for (const d of DEMO_DOCUMENTS) {
    const userId = userIds.get(d.ownerSlug);
    if (!userId) continue;

    // Idempotency: one doc per (userId, filename).
    const existing = await prisma.document.findFirst({
      where: { userId, filename: d.filename },
    });
    if (existing) continue;

    const fileId = randomUUID();
    const ext = d.filename.split('.').pop() ?? 'bin';
    const key = `users/${userId}/agents/${d.agentType}/${fileId}.${ext}`;

    await prisma.document.create({
      data: {
        userId,
        agentType: d.agentType,
        filename: d.filename,
        mimeType: d.mimeType,
        fileSize: d.bytes,
        storageUrl: `r2://nexa-files/${key}`,
        status: 'INDEXED',
        metadata: {
          key,
          fileId,
          seedSynthetic: true,
          note: 'Seeded without real embeddings. POST /documents/:id/reindex to generate chunks (requires OPENAI_API_KEY + BullMQ worker).',
        },
      },
    });
    count++;
  }
  console.log(`✓ Seeded ${count} documents (no chunks — reindex for real RAG)`);
}

// ==================================================================
// 5. Conversations + Messages — realistic chat threads
// ==================================================================

interface DemoConversationSeed {
  ownerSlug: string;
  agentType: AgentType;
  title: string;
  messages: Array<{ role: 'USER' | 'ASSISTANT'; content: string }>;
}

const DEMO_CONVERSATIONS: DemoConversationSeed[] = [
  // ============ TRADING ============
  {
    ownerSlug: 'alex',
    agentType: 'TRADING',
    title: 'RSI mean reversion on BTC — first backtest',
    messages: [
      {
        role: 'USER',
        content:
          'Backtest my RSI mean reversion strategy on BTC for 2023 with $10k initial capital.',
      },
      {
        role: 'ASSISTANT',
        content:
          'Running the backtest now. Results: 58% win rate across 18 trades, +23.5% total return, max drawdown -8.4%, Sharpe 1.42 (annualized). Equity curve peaked on 2023-04-11 then drew down through the May dip before recovering. The profit factor of 1.45 is above the 1.2 threshold where I usually flag a strategy — this one has real edge on BTC daily, but expect the drawdown to deepen in a sideways regime.',
      },
      {
        role: 'USER',
        content: 'What would improve the Sharpe?',
      },
      {
        role: 'ASSISTANT',
        content:
          'Three data-grounded suggestions, ranked:\n\n1. Add a volatility filter — skip entries when 14-day ATR is > 1.5× its 60-day mean. That alone would have sidestepped the 2023-03 whipsaw that cost ~4% of the drawdown.\n\n2. Tighten the RSI entry threshold to 25. Tradeoff: fewer trades (12 vs 18) but historical win rate jumps to 67%.\n\n3. Add a trend filter: only take longs when price > SMA 200. BTC spent most of 2023 above the 200, so this would reduce signal count but keep you out of bear-regime bottoms that take months to recover.\n\nWant me to run any of these as comparative backtests?',
      },
    ],
  },
  {
    ownerSlug: 'priya',
    agentType: 'TRADING',
    title: 'SMA crossover vs EMA-9 breakout — SPY',
    messages: [
      {
        role: 'USER',
        content:
          'Can you compare my SMA crossover strategy with a faster EMA-9 breakout on SPY 2020-2023?',
      },
      {
        role: 'ASSISTANT',
        content:
          "Comparing on identical SPY data: SMA crossover returned +14.2% with Sharpe 0.71 and max drawdown -11.3% across 8 trades. EMA-9 breakout returned +22.8% with Sharpe 0.94 and max drawdown -15.6% across 23 trades. The EMA variant is more active and rode 2020's recovery harder, but took a deeper hit in the 2022 rate-hike regime. If drawdown tolerance is low, SMA wins; if Sharpe-adjusted return is the target, EMA edges ahead.",
      },
    ],
  },
  {
    ownerSlug: 'jordan',
    agentType: 'TRADING',
    title: 'First backtest — learning the engine',
    messages: [
      {
        role: 'USER',
        content:
          'I am new to backtesting. Can you walk me through what a Sharpe ratio of 1.0 means in practice?',
      },
      {
        role: 'ASSISTANT',
        content:
          "A Sharpe of 1.0 means for every unit of volatility (standard deviation of returns), the strategy earned one unit of excess return. Practically: it's the threshold between a mediocre strategy (below 1) and an interesting one (above 1). Above 2 is rare for retail strategies over long windows; claims of 3+ are usually overfitting or cherry-picked periods. Our engine annualizes using √252 on bar-to-bar returns, so compare across similar-horizon backtests only.",
      },
    ],
  },
  // ============ CONTENT ============
  {
    ownerSlug: 'sofia',
    agentType: 'CONTENT',
    title: 'LinkedIn post — case study launch',
    messages: [
      {
        role: 'USER',
        content:
          'Draft a LinkedIn post for our brand announcing the new case study with Acme Corp. In our voice.',
      },
      {
        role: 'ASSISTANT',
        content:
          "Pulled 4 brand-voice excerpts. Your voice is: first-person singular, opens with a specific moment, avoids buzzwords, ends with a single question. Draft:\n\nThree years ago a client told me: \"our ops team does the work of 10 people and still misses deadlines.\"\n\nLast week we shipped the case study on how we rebuilt their workflow from scratch.\n\nResult: 3.2× throughput in 90 days. Two hires avoided. One very happy ops lead.\n\nThe playbook wasn't magic. It was six weeks of watching, two weeks of cutting, one week of rebuilding what was left. The savings compound monthly.\n\nWhat's the one process your team does that nobody ever wrote down?\n\n---\n\n287 chars in the hook (under LinkedIn's preview cutoff of 210 ideal + room for the ask). Ready to publish as-is or want a variation?",
      },
    ],
  },
  {
    ownerSlug: 'sofia',
    agentType: 'CONTENT',
    title: '4-week calendar: product launch',
    messages: [
      {
        role: 'USER',
        content:
          'Plan a 4-week content calendar for our product launch across LinkedIn, Twitter, and Instagram. Themes: problem, solution, proof, invitation.',
      },
      {
        role: 'ASSISTANT',
        content:
          'Built the grid: 4 weeks × 3 channels × 3 posts/week = 36 slots, rotating through your 4 themes. Week 1 = problem framing, Week 2 = solution reveal (product demo on Instagram, feature threads on Twitter, behind-the-scenes on LinkedIn), Week 3 = proof (case study on LinkedIn, user quote cards on Instagram, result-tweets on Twitter), Week 4 = invitation (launch-day posts Mon, follow-up testimonial posts Wed/Fri). Dates start Monday 2026-05-04 and land on Mon/Wed/Fri per channel. Want me to draft the copy for week 1 now, or hand you the calendar JSON to review first?',
      },
    ],
  },
  {
    ownerSlug: 'alex',
    agentType: 'CONTENT',
    title: 'SEO blog — personal brand pillars',
    messages: [
      {
        role: 'USER',
        content:
          'Write a 1500-word SEO blog post on "How to build a personal brand as a developer in 2026" in my voice.',
      },
      {
        role: 'ASSISTANT',
        content:
          'Pulled 3 brand pillars: technical depth, founder-operator perspective, no hustle-culture clichés. SEO structure is locked: H1 has primary keyword at 55 chars, 5 H2s covering define / audit / create / distribute / compound, 3 H3s under create (pillars), keyword density target 1.1%, meta 148 chars, slug /build-personal-brand-developer-2026. Draft is 1,520 words with an intro that opens on a specific moment (the Slack DM you got last month) rather than a definition — per your pillar against corporate-speak openers. Ready for review or want me to trim to 1,200?',
      },
    ],
  },
  // ============ LIFE COACH ============
  {
    ownerSlug: 'marcus',
    agentType: 'LIFE_COACH',
    title: 'Themes from the last quarter',
    messages: [
      {
        role: 'USER',
        content: 'What themes have been coming up in my journals this quarter?',
      },
      {
        role: 'ASSISTANT',
        content:
          "Extracted themes from 127 chunks across 3 journal files. Top recurring terms:\n\n1. 'discipline' (31× — most of these are about morning routines, not product decisions)\n2. 'tired' (27× — clustered in weeks you mentioned board prep)\n3. 'honest' (19× — often paired with 'team' or 'investors')\n4. 'slow' (14× — appears mostly as a wish, not a complaint)\n5. 'build' (13× — you use it both for the company and for personal habits)\n\nThe pattern I notice across the excerpts: the word 'tired' clusters before board meetings, and 'discipline' clusters right after. You write about physical discipline (morning training, sleep) as a response to cognitive load from the company — not the other way around.\n\nOne next step: your own journal from 2025-03-14 says 'I recover faster when I schedule the hard conversation first'. If you're heading into a tired stretch now, is there a hard conversation you're putting off?",
      },
    ],
  },
  {
    ownerSlug: 'marcus',
    agentType: 'LIFE_COACH',
    title: 'Decision: raise or runway?',
    messages: [
      {
        role: 'USER',
        content:
          'I need to decide this week whether to raise a bridge round or cut burn to extend runway 9 months. Help me think through it.',
      },
      {
        role: 'ASSISTANT',
        content:
          "Pulling the decision framework + relevant excerpts from your journals.\n\nFrame:\n- Decision: raise bridge (2-4 weeks process, ~10-15% dilution) vs cut burn (immediate, ~3 FTE impact).\n- Deadline: you wrote on 2025-11-02 'if we don't decide by end of quarter, the decision makes itself' — that was about a different call but the principle applies.\n- Whose: yours and your co-founder's; your team will feel either path.\n\nGather (from your own writing):\n- 2025-09-18: 'every time I've cut burn it bought more than the spreadsheet said because the focus effect compounds.'\n- 2025-12-04: 'raising from a position of slight scarcity is the second-best negotiation I've ever done. The best was not raising at all.'\n- 2025-03-14 (the one I mentioned earlier): 'I recover faster when I schedule the hard conversation first.'\n\nScore:\n- Reversibility: cutting burn is mostly reversible (rehire), raising is not (dilution is permanent).\n- Optionality: cut burn preserves equity AND signals discipline to future rounds.\n- Your past pattern: you lean toward \"build\" over \"fund.\" You've written that twice.\n\nCommit:\nOne concrete next step: before deciding, write the 2-sentence story you'll tell your team in 6 months about why you chose this. Your journal from 2024-11-20 notes that test has never been wrong for you.\n\nI'm not telling you what to do. But your own past words lean one way.",
      },
    ],
  },
  {
    ownerSlug: 'alex',
    agentType: 'LIFE_COACH',
    title: 'Reflection on a hard week',
    messages: [
      {
        role: 'USER',
        content:
          'Write me a reflection on this week — it was brutal. Use my voice, short, no platitudes.',
      },
      {
        role: 'ASSISTANT',
        content:
          "Pulled 4 excerpts matching 'brutal' + 'week' + 'hard' themes from your weekly reflections.\n\nReflection (your voice, 112 words):\n\nThis week felt like the one you wrote about in February — the one where you almost quit the thing that turned out to mean the most. Back then you noted it takes you 72 hours to tell the difference between exhaustion and the wrong problem. Today is hour 36.\n\nTwo things you've written that both still seem true:\n\n- 'I confuse the weight of the work with the worth of the work.'\n- 'My best calls come from the run, not the desk.'\n\nOne next step (not three, not ten): go for the run before you write the email.",
      },
    ],
  },
  // ============ MUSIC ============
  {
    ownerSlug: 'alex',
    agentType: 'MUSIC',
    title: 'Lo-fi beat — palette + references',
    messages: [
      {
        role: 'USER',
        content:
          'I want to make a lo-fi hiphop beat around 82 BPM, dusty and jazzy. Palette + 3 reference tracks.',
      },
      {
        role: 'ASSISTANT',
        content:
          "Palette (from our lo-fi hiphop template):\n- Core: warm Rhodes / vintage EP, upright or vinyl-style bass, dusty sampled piano\n- Textural: vinyl crackle, tape hiss, rain/cafe ambience, filtered jazz pads\n- Percussion: swung boom-bap kit, side-stick rimshot, shaker 16ths, hand claps\n- Key characteristics: 7th & 9th jazz chords, slight swing, MPC-style humanization, narrow stereo image\n- BPM range: 70-90, you're right in the pocket at 82.\n\nReferences: Spotify API isn't configured on this environment so I can't pull live URLs. Based on the palette, you're in the zone of Nujabes, J Dilla (Donuts era), and L'Indécis — start your reference-mining there and I'll refine once you drop Spotify creds in .env.",
      },
      { role: 'USER', content: 'Give me an arrangement template.' },
      {
        role: 'ASSISTANT',
        content:
          'Matching template: lofi-loop.\n\n- Intro (4 bars): vinyl crackle + piano/rhodes alone\n- Main loop (16 bars): drums in, bass in\n- Variation (8 bars): filter or element swap\n- Bridge (8 bars): drop drums, melody alone\n- Main loop (16 bars): return full\n- Outro (4 bars): filter close\n\nTotal 56 bars ≈ 2:45 at 82 BPM. Classic for streaming platform attention windows. Want me to draft a lyric scaffold or move straight to mixing notes?',
      },
    ],
  },

  // ============ MEJBA — admin operator ============
  {
    ownerSlug: 'mejba',
    agentType: 'TRADING',
    title: 'SPY daily — RSI(14) pullback variant',
    messages: [
      {
        role: 'USER',
        content:
          'Run my SPY daily strategy on 2024 and tell me whether the RSI(14)<35 entry beats RSI(14)<30 on the same period.',
      },
      {
        role: 'ASSISTANT',
        content:
          "I'll need the 2024 SPY bars uploaded as a Document with agentType=TRADING (CSV bypasses RAG, the engine reads raw OHLCV). Once that lands I'll run both variants under run_backtest and compare with compare_strategies — same fees, same sizing, same date window. The difference between <30 and <35 is usually fewer entries with higher avg-trade quality vs more entries with tighter risk; I'll have actual numbers in seconds, not vibes.",
      },
    ],
  },
  {
    ownerSlug: 'mejba',
    agentType: 'CONTENT',
    title: 'v0.2 launch announcement — long-form draft',
    messages: [
      {
        role: 'USER',
        content:
          'Draft a 600-word launch announcement for Nexa v0.2. Voice: confident, technical, anti-AI-slop. Audience: indie founders + senior engineers.',
      },
      {
        role: 'ASSISTANT',
        content:
          "Here's a 600-word draft anchored in the brand voice doc you uploaded. Hook leads with the four-agent thesis, body grounds it in the deterministic backtest invariant + isolated memory, close hits the 100k-tokens-free hook. Want me to spin a 280-character X version + a 3-bullet LinkedIn version off the same beats so you ship the family of posts in one go?",
      },
    ],
  },
  {
    ownerSlug: 'mejba',
    agentType: 'LIFE_COACH',
    title: 'Q1 weekly review — what shipped, what stalled',
    messages: [
      {
        role: 'USER',
        content:
          "It is Friday — run my weekly review against this week's journal entries. Surface stalls, name one habit to drop.",
      },
      {
        role: 'ASSISTANT',
        content:
          "From extract_themes over the last 7 entries: shipping pace is up (auth + dashboard + agent UIs), but you flagged 'low-energy mornings after late-night coding' three times. The stall is unfinished trading-strategy uploads — three drafts, none run. Drop the habit of starting strategy work after 9pm: it correlates 1:1 with the morning fatigue. Move it to the 7-9am block where your journal language is consistently sharpest.",
      },
    ],
  },
  {
    ownerSlug: 'mejba',
    agentType: 'MUSIC',
    title: '90 BPM lo-fi pack — palette + arrangement',
    messages: [
      {
        role: 'USER',
        content:
          "I'm scoring a launch video — need a 30-second lo-fi loop at 90 BPM, dusty but uplifting. Palette + arrangement.",
      },
      {
        role: 'ASSISTANT',
        content:
          'Palette (lo-fi hiphop template, brightened): warm Rhodes lead, upright bass, light side-stick boom-bap, vinyl crackle for texture, one-shot pluck for the lift. Arrangement for 30s at 90 BPM = 45 bars; condense lofi-loop to: 4-bar vinyl intro · 12-bar main loop · 8-bar uplift variation · 6-bar tail. Layer the pluck only over bars 17-24 so the launch CTA hits with the lift. Want me to source 3 royalty-free Rhodes samples from Freesound?',
      },
    ],
  },
];

async function seedConversations(userIds: Map<string, string>): Promise<void> {
  const agents = await prisma.agent.findMany({ select: { id: true, type: true } });
  const agentByType = new Map(agents.map((a) => [a.type, a.id]));

  let convCount = 0;
  let msgCount = 0;

  for (const conv of DEMO_CONVERSATIONS) {
    const userId = userIds.get(conv.ownerSlug);
    const agentId = agentByType.get(conv.agentType);
    if (!userId || !agentId) continue;

    // Idempotent: one conversation per (userId, title).
    let conversation = await prisma.conversation.findFirst({
      where: { userId, title: conv.title },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId, agentId, title: conv.title },
      });
      convCount++;

      for (const [idx, m] of conv.messages.entries()) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: m.role,
            content: m.content,
            // Synthetic token counts so usage aggregations have realistic data.
            tokensInput: m.role === 'USER' ? Math.ceil(m.content.length / 3.8) : null,
            tokensOutput: m.role === 'ASSISTANT' ? Math.ceil(m.content.length / 3.8) : null,
            createdAt: new Date(Date.now() - (conv.messages.length - idx) * 45_000),
          },
        });
        msgCount++;
      }
    }
  }
  console.log(`✓ Seeded ${convCount} conversations + ${msgCount} messages`);
}

// ==================================================================
// 6. Usage records — 30-day synthetic history
// ==================================================================

async function seedUsageRecords(userIds: Map<string, string>): Promise<void> {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Per-user daily avg (tokens in/out, agentType weights).
  const profiles: Array<{
    slug: string;
    dailyTokensIn: number;
    dailyTokensOut: number;
    weights: Partial<Record<AgentType, number>>;
  }> = [
    {
      slug: 'mejba',
      dailyTokensIn: 38_000,
      dailyTokensOut: 72_000,
      weights: { TRADING: 0.3, CONTENT: 0.3, LIFE_COACH: 0.2, MUSIC: 0.2 },
    },
    {
      slug: 'alex',
      dailyTokensIn: 28_000,
      dailyTokensOut: 52_000,
      weights: { TRADING: 0.3, CONTENT: 0.3, LIFE_COACH: 0.2, MUSIC: 0.2 },
    },
    {
      slug: 'priya',
      dailyTokensIn: 6_000,
      dailyTokensOut: 14_000,
      weights: { TRADING: 0.8, CONTENT: 0.2 },
    },
    {
      slug: 'marcus',
      dailyTokensIn: 45_000,
      dailyTokensOut: 95_000,
      weights: { LIFE_COACH: 0.6, CONTENT: 0.4 },
    },
    {
      slug: 'sofia',
      dailyTokensIn: 22_000,
      dailyTokensOut: 58_000,
      weights: { CONTENT: 1 },
    },
    {
      slug: 'jordan',
      dailyTokensIn: 1_200,
      dailyTokensOut: 2_800,
      weights: { TRADING: 1 },
    },
  ];

  let created = 0;
  for (const p of profiles) {
    const userId = userIds.get(p.slug);
    if (!userId) continue;

    // Clear prior synthetic records so rerun produces a clean 30-day window.
    await prisma.usageRecord.deleteMany({ where: { userId } });

    for (let d = 0; d < 30; d++) {
      for (const [agentType, weight] of Object.entries(p.weights)) {
        if (!weight) continue;
        const tokensIn = Math.round(p.dailyTokensIn * weight * (0.7 + Math.random() * 0.6));
        const tokensOut = Math.round(p.dailyTokensOut * weight * (0.7 + Math.random() * 0.6));
        // Rough cost estimate per PRD §18 Opus 4.7 pricing.
        const costUsd = (tokensIn * 15) / 1e6 + (tokensOut * 75) / 1e6;

        await prisma.usageRecord.create({
          data: {
            userId,
            agentType: agentType as AgentType,
            tokensInput: tokensIn,
            tokensOutput: tokensOut,
            costUsd: new Decimal(costUsd.toFixed(6)),
            createdAt: new Date(now - d * day + Math.random() * day),
          },
        });
        created++;
      }
    }
  }
  console.log(`✓ Seeded ${created} usage records across 30 days`);
}

// ==================================================================
// Main
// ==================================================================

async function main(): Promise<void> {
  const isProd = process.env.NODE_ENV === 'production';
  const forceDemo = process.env.SEED_DEMO_DATA === '1';
  const seedExamples = !isProd || forceDemo;

  await seedAgents();

  if (!seedExamples) {
    console.log('ℹ Skipping example accounts (NODE_ENV=production; set SEED_DEMO_DATA=1 to force)');
    return;
  }

  const userIds = await seedUsers();
  await seedUserAgentLinks(userIds);
  await seedTradingData(userIds);
  await seedDocuments(userIds);
  await seedConversations(userIds);
  await seedUsageRecords(userIds);

  console.log('\nExample content ready. Feature-by-feature smoke paths:');
  console.log('  · /admin              → 5 accounts, 30 days of usage, per-agent cost breakdown');
  console.log('  · /billing            → plans with live token usage from UsageRecord');
  console.log('  · /agents/trading     → 4 strategies + 8 backtests (Alex + Priya)');
  console.log('  · /agents/content     → 5 brand-voice docs (Sofia + Alex + Marcus)');
  console.log('  · /agents/life-coach  → 4 journals indexed (Marcus + Alex)');
  console.log('  · /agents/music       → 2 mixing notes (Alex)');
  console.log('  · conversations list  → 10 realistic threads across all four agents');
  console.log('\nExample accounts (clerkId=user_seed_<slug>) — sign in via a matching Clerk');
  console.log('sandbox user to own that content, or call the API directly with a JWT whose');
  console.log('sub claim matches user_seed_<slug>.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
