import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ToolRegistry } from './tool-registry.service';
import type { ITool, ToolContext } from './tool.interface';

const ctx: ToolContext = {
  userId: 'u1',
  agentType: 'TRADING',
  conversationId: 'c1',
  messageId: 'm1',
};

const echoSchema = z.object({ value: z.string().min(1) });

class EchoTool implements ITool<z.infer<typeof echoSchema>> {
  readonly name = 'echo';
  readonly description = 'echoes input';
  readonly agents = ['TRADING'] as const;
  readonly inputSchema = echoSchema;
  async execute(input: z.infer<typeof echoSchema>) {
    return { echoed: input.value };
  }
}

class MusicTool implements ITool<{ q: string }> {
  readonly name = 'music_search';
  readonly description = 'search music';
  readonly agents = ['MUSIC'] as const;
  readonly inputSchema = z.object({ q: z.string() });
  async execute(input: { q: string }) {
    return { ok: input.q };
  }
}

class ThrowingTool implements ITool<{ x: number }> {
  readonly name = 'broken';
  readonly description = 'throws';
  readonly agents = ['CONTENT'] as const;
  readonly inputSchema = z.object({ x: z.number() });
  async execute(): Promise<{ x: number }> {
    throw new Error('boom');
  }
}

describe('ToolRegistry', () => {
  it('registers and looks up by name', () => {
    const reg = new ToolRegistry();
    const t = new EchoTool();
    reg.register(t);
    expect(reg.get('echo')).toBe(t);
  });

  it('rejects duplicate names', () => {
    const reg = new ToolRegistry();
    reg.register(new EchoTool());
    expect(() => reg.register(new EchoTool())).toThrow(/collision/);
  });

  it('rejects names that violate the Anthropic regex', () => {
    const reg = new ToolRegistry();
    const bad: ITool = {
      name: 'has spaces',
      description: 'd',
      agents: ['TRADING'],
      inputSchema: z.object({}),
      async execute() {
        return null;
      },
    };
    expect(() => reg.register(bad)).toThrow(/Invalid tool name/);
  });

  it('lists tools per agent', () => {
    const reg = new ToolRegistry();
    reg.register(new EchoTool());
    reg.register(new MusicTool());
    expect(reg.listForAgent('TRADING').map((t) => t.name)).toEqual(['echo']);
    expect(reg.listForAgent('MUSIC').map((t) => t.name)).toEqual(['music_search']);
    expect(reg.listForAgent('LIFE_COACH')).toEqual([]);
  });

  it('serializes to Anthropic tool format with input_schema derived from Zod', () => {
    const reg = new ToolRegistry();
    reg.register(new EchoTool());
    const [tool] = reg.toAnthropic('TRADING');
    expect(tool!.name).toBe('echo');
    expect(tool!.input_schema.type).toBe('object');
    expect(tool!.input_schema.properties).toHaveProperty('value');
  });

  it('returns ok=false on validation failure', async () => {
    const reg = new ToolRegistry();
    reg.register(new EchoTool());
    const out = await reg.execute('echo', { wrong: true }, ctx);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toMatch(/Invalid input/);
  });

  it('returns ok=false on unknown tool', async () => {
    const reg = new ToolRegistry();
    const out = await reg.execute('missing', {}, ctx);
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toMatch(/Unknown tool/);
  });

  it('catches thrown errors and returns ok=false', async () => {
    const reg = new ToolRegistry();
    reg.register(new ThrowingTool());
    const out = await reg.execute('broken', { x: 1 }, { ...ctx, agentType: 'CONTENT' });
    expect(out.ok).toBe(false);
    if (!out.ok) expect(out.error).toBe('boom');
  });

  it('returns ok=true with output on success', async () => {
    const reg = new ToolRegistry();
    reg.register(new EchoTool());
    const out = await reg.execute('echo', { value: 'hi' }, ctx);
    expect(out.ok).toBe(true);
    if (out.ok) expect(out.output).toEqual({ echoed: 'hi' });
  });
});
