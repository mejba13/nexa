import type Anthropic from '@anthropic-ai/sdk';
import type { AgentType } from '@nexa/types';
import type { z } from 'zod';

/**
 * Tool execution context propagated down from the orchestrator.
 * Tools never see the raw request — only the vetted user identity and scope.
 */
export interface ToolContext {
  userId: string;
  agentType: AgentType;
  conversationId: string;
  messageId: string;
}

/**
 * Schemas with `.default()` widen their input type; ZodType<TOutput, _, unknown>
 * lets `inputSchema` accept any raw shape while parsed `input: TInput` is
 * narrow for the executor.
 */
export interface ITool<TInput = unknown, TOutput = unknown> {
  /** Must match Anthropic tool name regex: ^[a-zA-Z0-9_-]{1,64}$ */
  readonly name: string;
  readonly description: string;
  /** Which agent(s) this tool is available to. */
  readonly agents: readonly AgentType[];
  /** Zod schema — used for validation AND to derive Anthropic input_schema. */
  readonly inputSchema: z.ZodType<TInput, z.ZodTypeDef, unknown>;
  execute(input: TInput, ctx: ToolContext): Promise<TOutput>;
}

/** Narrow-ish projection of a tool as sent to Anthropic. */
export interface AnthropicToolDef extends Anthropic.Tool {
  name: string;
  description: string;
  input_schema: Anthropic.Tool.InputSchema;
}
