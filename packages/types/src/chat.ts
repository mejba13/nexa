import type { AgentType } from './agents';

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  output: unknown;
  isError?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[] | null;
  toolResults?: ToolResult[] | null;
  tokensInput?: number | null;
  tokensOutput?: number | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  agentType: AgentType;
  title: string;
  isStarred: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

/** Server-Sent Event contract between API and web. */
export type StreamEvent =
  | { type: 'message_start'; messageId: string }
  | { type: 'content_delta'; delta: string }
  | { type: 'tool_use'; toolCall: ToolCall }
  | { type: 'tool_result'; toolCallId: string; result: unknown; isError?: boolean }
  | { type: 'message_end'; tokensInput: number; tokensOutput: number; costUsd?: number }
  | { type: 'error'; message: string; code?: string };
