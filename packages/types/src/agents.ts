export const AGENT_TYPES = ['TRADING', 'MUSIC', 'CONTENT', 'LIFE_COACH'] as const;
export type AgentType = (typeof AGENT_TYPES)[number];

export interface AgentConfig {
  id: string;
  type: AgentType;
  name: string;
  description: string;
  modelId: string;
  tools: ToolDefinition[];
  isActive: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AgentMetadata {
  icon: string;
  accentColor: string;
  tagline: string;
}

export const AGENT_METADATA: Record<AgentType, AgentMetadata> = {
  TRADING: {
    icon: 'TrendingUp',
    accentColor: '#FF9100',
    tagline: 'Autonomous quant partner — backtest, analyze, iterate.',
  },
  MUSIC: {
    icon: 'Music',
    accentColor: '#FFB74D',
    tagline: 'Creative collaborator for production, mixing, and ideas.',
  },
  CONTENT: {
    icon: 'PenTool',
    accentColor: '#FFA726',
    tagline: 'Brand-voice-trained content across every channel.',
  },
  LIFE_COACH: {
    icon: 'Compass',
    accentColor: '#FB8C00',
    tagline: 'Personality-aware coach that learns from your journals.',
  },
};

export const AGENT_TYPE_TO_SLUG: Record<AgentType, string> = {
  TRADING: 'trading',
  MUSIC: 'music',
  CONTENT: 'content',
  LIFE_COACH: 'life-coach',
};

export const AGENT_SLUG_TO_TYPE: Record<string, AgentType> = {
  trading: 'TRADING',
  music: 'MUSIC',
  content: 'CONTENT',
  'life-coach': 'LIFE_COACH',
};
