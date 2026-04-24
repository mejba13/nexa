import type { AgentType } from './agents.js';

export interface UsageRecord {
  id: string;
  userId: string;
  agentType: AgentType;
  tokensInput: number;
  tokensOutput: number;
  costUsd: string;
  conversationId: string | null;
  createdAt: string;
}

export interface UsageSummary {
  period: { start: string; end: string };
  tokensUsed: number;
  tokensLimit: number;
  costUsd: number;
  byAgent: Record<AgentType, { tokens: number; costUsd: number }>;
}
