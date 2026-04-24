import { Injectable, Logger } from '@nestjs/common';
import type { AgentType } from '@nexa/types';

import type { AnthropicToolDef, ITool, ToolContext } from './tool.interface';
import { zodToJsonSchema } from './zod-to-json-schema';

/**
 * Central registry. Modules register tools at bootstrap; the orchestrator reads
 * them via `listForAgent(agentType)` and serializes to Anthropic format.
 */
@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly byName = new Map<string, ITool>();

  register(tool: ITool): void {
    if (this.byName.has(tool.name)) {
      throw new Error(`Tool name collision: ${tool.name}`);
    }
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(tool.name)) {
      throw new Error(`Invalid tool name "${tool.name}" — must match ^[a-zA-Z0-9_-]{1,64}$`);
    }
    this.byName.set(tool.name, tool);
    this.logger.log(`Registered tool: ${tool.name} (agents: ${tool.agents.join(',')})`);
  }

  get(name: string): ITool | undefined {
    return this.byName.get(name);
  }

  listForAgent(agentType: AgentType): ITool[] {
    return Array.from(this.byName.values()).filter((t) => t.agents.includes(agentType));
  }

  /** Serialize tools to the exact shape Anthropic's messages.create expects. */
  toAnthropic(agentType: AgentType): AnthropicToolDef[] {
    return this.listForAgent(agentType).map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: zodToJsonSchema(t.inputSchema),
    }));
  }

  async execute(
    name: string,
    rawInput: unknown,
    ctx: ToolContext,
  ): Promise<{ ok: true; output: unknown } | { ok: false; error: string }> {
    const tool = this.get(name);
    if (!tool) return { ok: false, error: `Unknown tool: ${name}` };

    const parsed = tool.inputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: `Invalid input: ${parsed.error.message}` };
    }

    try {
      const output = await tool.execute(parsed.data, ctx);
      return { ok: true, output };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Tool ${name} failed: ${message}`);
      return { ok: false, error: message };
    }
  }
}
