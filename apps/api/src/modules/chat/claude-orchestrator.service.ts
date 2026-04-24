import type Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';
import type { AgentType } from '@prisma/client';
import type { InputJsonValue } from '@prisma/client/runtime/library';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { StreamEvent, ToolCall } from '@nexa/types';

import { ClaudeService } from '../../shared/claude/claude.service';
import { MAX_TOOL_ITERATIONS } from '../../shared/claude/types';
import { RetrievalService } from '../../shared/rag/retrieval.service';
import { ToolRegistry } from '../../shared/tools/tool-registry.service';

import { ConversationsService } from './conversations.service';
import { UsageService } from './usage.service';

interface RunOptions {
  userId: string; // DB id, not Clerk id
  agentType: AgentType;
  agentRow: {
    id: string;
    name: string;
    systemPrompt: string;
    modelId: string;
  };
  conversationId: string;
  userMessage: string;
}

/**
 * Core agent loop (PRD §6).
 *   load history → RAG retrieve → Claude stream → on tool_use execute → loop
 * Streams StreamEvent frames over an rxjs Subject that the SSE controller pipes.
 * Hard cap: MAX_TOOL_ITERATIONS (10) to keep costs bounded (PRD §F-005).
 */
@Injectable()
export class ClaudeOrchestratorService {
  private readonly logger = new Logger(ClaudeOrchestratorService.name);

  constructor(
    private readonly claude: ClaudeService,
    private readonly tools: ToolRegistry,
    private readonly retrieval: RetrievalService,
    private readonly conversations: ConversationsService,
    private readonly usage: UsageService,
  ) {}

  run(opts: RunOptions): Observable<{ data: StreamEvent }> {
    const subject = new Subject<{ data: StreamEvent }>();
    void this.execute(opts, subject).catch((err: Error) => {
      this.logger.error(`Orchestrator failed: ${err.message}`, err.stack);
      subject.next({ data: { type: 'error', message: err.message } });
      subject.complete();
    });
    return subject.asObservable();
  }

  private async execute(opts: RunOptions, out: Subject<{ data: StreamEvent }>): Promise<void> {
    // 1. Persist the user message first so reloads stay consistent.
    const userMsg = await this.conversations.appendMessage(opts.conversationId, {
      role: 'USER',
      content: opts.userMessage,
    });

    out.next({ data: { type: 'message_start', messageId: userMsg.id } });

    // 2. Retrieve RAG context (userId + agentType scoped — PRD §12).
    const chunks = await this.retrieval
      .retrieve({
        userId: opts.userId,
        agentType: opts.agentType,
        query: opts.userMessage,
        topK: 6,
      })
      .catch((err) => {
        this.logger.warn(`RAG retrieval failed: ${(err as Error).message}`);
        return [];
      });

    const ragBlock =
      chunks.length > 0
        ? `\n\n# Retrieved context (knowledge base)\n${chunks
            .map((c, i) => `[${i + 1}] ${c.filename} (chunk ${c.chunkIndex}):\n${c.content}`)
            .join('\n\n')}\n`
        : '';

    const systemPrompt = `${opts.agentRow.systemPrompt}${ragBlock}`;

    // 3. Build Anthropic message history from DB.
    const history = await this.conversations.historyForClaude(opts.conversationId);
    const messages = historyToAnthropic(history);

    // 4. Agent loop.
    let totalIn = 0;
    let totalOut = 0;
    const aggregatedToolCalls: ToolCall[] = [];
    const aggregatedToolResults: Array<{
      toolCallId: string;
      output: unknown;
      isError?: boolean;
    }> = [];
    let finalText = '';

    const anthropicTools = this.tools.toAnthropic(opts.agentType);

    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      const stream = this.claude.stream({
        model: opts.agentRow.modelId as Parameters<ClaudeService['stream']>[0]['model'],
        systemPrompt,
        messages,
        tools: anthropicTools.length ? anthropicTools : undefined,
      });

      stream.on('text', (delta: string) => {
        finalText += delta;
        out.next({ data: { type: 'content_delta', delta } });
      });

      const final = await stream.finalMessage();
      totalIn += final.usage.input_tokens ?? 0;
      totalOut += final.usage.output_tokens ?? 0;

      const toolUses = final.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
      );

      if (toolUses.length === 0 || (final.stop_reason as string) !== 'tool_use') {
        // Finished — assistant answered with plain text.
        break;
      }

      // Append assistant turn (contains tool_use blocks) into running history.
      messages.push({ role: 'assistant', content: final.content });

      // Execute each tool, emit events, collect tool_result blocks for next turn.
      const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const call: ToolCall = {
          id: tu.id,
          name: tu.name,
          input: tu.input as Record<string, unknown>,
        };
        aggregatedToolCalls.push(call);
        out.next({ data: { type: 'tool_use', toolCall: call } });

        const result = await this.tools.execute(tu.name, tu.input, {
          userId: opts.userId,
          agentType: opts.agentType,
          conversationId: opts.conversationId,
          messageId: userMsg.id,
        });

        let resultValue: unknown;
        let isError: boolean;
        if (result.ok) {
          resultValue = result.output;
          isError = false;
        } else {
          resultValue = { error: result.error };
          isError = true;
        }
        const payload = JSON.stringify(resultValue ?? {});

        aggregatedToolResults.push({ toolCallId: tu.id, output: resultValue, isError });
        out.next({
          data: { type: 'tool_result', toolCallId: tu.id, result: resultValue, isError },
        });

        toolResultBlocks.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: payload,
          is_error: !result.ok,
        });
      }

      messages.push({ role: 'user', content: toolResultBlocks });
    }

    // 5. Persist assistant message.
    const costUsd = this.claude.estimateCostUsd(
      opts.agentRow.modelId as 'claude-opus-4-7',
      totalIn,
      totalOut,
    );

    await this.conversations.appendMessage(opts.conversationId, {
      role: 'ASSISTANT',
      content: finalText,
      toolCalls: aggregatedToolCalls as unknown as InputJsonValue,
      toolResults: aggregatedToolResults as unknown as InputJsonValue,
      tokensInput: totalIn,
      tokensOutput: totalOut,
    });

    await this.usage.record({
      userId: opts.userId,
      agentType: opts.agentType,
      tokensInput: totalIn,
      tokensOutput: totalOut,
      costUsd,
      conversationId: opts.conversationId,
    });

    out.next({
      data: {
        type: 'message_end',
        tokensInput: totalIn,
        tokensOutput: totalOut,
        costUsd,
      },
    });
    out.complete();
  }
}

/** Convert our DB rows into Anthropic MessageParam[]. */
function historyToAnthropic(
  rows: Array<{
    role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
    content: string;
  }>,
): Anthropic.Messages.MessageParam[] {
  return rows
    .filter((r) => r.role === 'USER' || r.role === 'ASSISTANT')
    .map((r) => ({
      role: r.role === 'USER' ? 'user' : 'assistant',
      content: r.content,
    }));
}
