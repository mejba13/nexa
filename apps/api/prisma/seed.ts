/**
 * Nexa — default agent seed
 *
 * Populates the Agent table with the four baseline agents defined in PRD §5.
 * System prompts here are stubs; production prompts land in Phase 2.
 */
import { PrismaClient, AgentType } from '@prisma/client';

const prisma = new PrismaClient();

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
      'Autonomous quant partner for trading strategy analysis and backtesting.',
    systemPrompt:
      'You are the Nexa Trading Analyst. NEVER fabricate performance numbers — always call the run_backtest and get_performance_metrics tools. Explain results in plain language and propose concrete improvements.',
    tools: [
      { name: 'upload_strategy', description: 'Store a strategy definition' },
      { name: 'upload_market_data', description: 'Store historical OHLCV data' },
      { name: 'run_backtest', description: 'Execute a backtest with strategy + data' },
      {
        name: 'get_performance_metrics',
        description: 'Compute P/L, win rate, drawdown, Sharpe ratio',
      },
      { name: 'compare_strategies', description: 'A/B compare two strategies' },
      { name: 'suggest_improvements', description: 'Analyze results and propose changes' },
    ],
  },
  {
    type: 'MUSIC',
    name: 'Music Producer',
    description: 'Creative collaborator for music creation, production, and mixing guidance.',
    systemPrompt:
      'You are the Nexa Music Producer. Offer concrete, genre-aware production advice. Use the reference and sample search tools to ground suggestions in real material.',
    tools: [
      { name: 'search_references', description: 'Spotify API for similar tracks' },
      { name: 'suggest_instruments', description: 'Instrument and sound palette suggestions' },
      { name: 'suggest_arrangement', description: 'Song structure / arrangement templates' },
      { name: 'generate_lyrics', description: 'Draft lyrics, hooks, or topline ideas' },
      { name: 'find_samples', description: 'Freesound.org sample search' },
      { name: 'mixing_guidance', description: 'Mixing & mastering guidance via KB' },
    ],
  },
  {
    type: 'CONTENT',
    name: 'Content Strategist',
    description:
      'Brand-voice-trained content agent for social, video, blog, and marketing content.',
    systemPrompt:
      'You are the Nexa Content Strategist. Always consult the brand voice KB via query_brand_voice before drafting. Produce publish-ready copy with hooks and CTAs.',
    tools: [
      { name: 'query_brand_voice', description: 'RAG over brand guideline docs' },
      { name: 'generate_social_post', description: 'Platform-specific post generation' },
      { name: 'generate_blog_post', description: 'Long-form SEO-structured posts' },
      { name: 'generate_video_script', description: 'Hook + body + CTA scripts' },
      { name: 'create_content_calendar', description: 'Multi-week planning' },
      { name: 'research_trends', description: 'Web-search trend lookup (Phase 2)' },
    ],
  },
  {
    type: 'LIFE_COACH',
    name: 'Life Coach',
    description: 'Personality-aware coach trained on user journals and personal data.',
    systemPrompt:
      'You are the Nexa Life Coach. Ground every reflection in the user\'s journals via query_past_reflections. Be warm, specific, and non-judgmental.',
    tools: [
      { name: 'ingest_journal', description: 'Parse, chunk, and embed journal entries' },
      { name: 'query_past_reflections', description: 'RAG over journal corpus' },
      { name: 'extract_themes', description: 'Identify patterns in journals' },
      { name: 'generate_reflection', description: 'Personalized reflection' },
      { name: 'mood_tracker', description: 'Daily mood logging (Phase 2)' },
      { name: 'decision_framework', description: 'Structured decision-making helper' },
    ],
  },
];

async function main() {
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
  // eslint-disable-next-line no-console
  console.log(`Seeded ${AGENTS.length} agents.`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
