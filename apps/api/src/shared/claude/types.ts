import type Anthropic from '@anthropic-ai/sdk';

export type ClaudeModel = 'claude-opus-4-7' | 'claude-sonnet-4-6' | 'claude-haiku-4-5';

export const DEFAULT_MODEL: ClaudeModel = 'claude-opus-4-7';
export const FALLBACK_MODEL: ClaudeModel = 'claude-haiku-4-5';

/** Max tool-call iterations per user message (PRD §F-005). */
export const MAX_TOOL_ITERATIONS = 10;

/** How long to make Anthropic remember the cacheable system prompt. */
export const CACHE_CONTROL: Anthropic.Messages.CacheControlEphemeral = {
  type: 'ephemeral',
};

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface ClaudeCallOptions {
  model?: ClaudeModel;
  systemPrompt: string;
  messages: Anthropic.Messages.MessageParam[];
  tools?: Anthropic.Messages.Tool[];
  maxTokens?: number;
  temperature?: number;
}
