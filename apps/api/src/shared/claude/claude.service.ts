import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../../config/env';

import { CACHE_CONTROL, DEFAULT_MODEL, type ClaudeCallOptions, type ClaudeModel } from './types';

/**
 * Single Anthropic client for the whole API. Abstracts vendor calls so PRD §18
 * vendor-lock mitigation remains easy: swap this service to hit another provider
 * and the orchestrator stays untouched.
 */
@Injectable()
export class ClaudeService {
  private readonly logger = new Logger(ClaudeService.name);
  private readonly client: Anthropic;

  constructor(config: ConfigService<Env, true>) {
    this.client = new Anthropic({
      apiKey: config.get('ANTHROPIC_API_KEY', { infer: true }),
    });
  }

  /** Streaming creation. Caller consumes the SDK stream directly. */
  stream(opts: ClaudeCallOptions): ReturnType<Anthropic['messages']['stream']> {
    const model: ClaudeModel = opts.model ?? DEFAULT_MODEL;
    return this.client.messages.stream({
      model,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.7,
      system: [
        {
          type: 'text',
          text: opts.systemPrompt,
          cache_control: CACHE_CONTROL, // prompt-cache hot path
        },
      ],
      messages: opts.messages,
      ...(opts.tools?.length ? { tools: opts.tools } : {}),
    });
  }

  /** Non-streaming completion — used for offline tool-only tasks. */
  async complete(opts: ClaudeCallOptions): Promise<Anthropic.Messages.Message> {
    const model: ClaudeModel = opts.model ?? DEFAULT_MODEL;
    return this.client.messages.create({
      model,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.7,
      system: [{ type: 'text', text: opts.systemPrompt, cache_control: CACHE_CONTROL }],
      messages: opts.messages,
      ...(opts.tools?.length ? { tools: opts.tools } : {}),
    });
  }

  /**
   * Rough USD cost estimate. Rates here are placeholders — tune when Anthropic
   * publishes final pricing for 4.7. Called per-message from the usage tracker.
   */
  estimateCostUsd(model: ClaudeModel, tokensInput: number, tokensOutput: number): number {
    const rates: Record<ClaudeModel, { in: number; out: number }> = {
      'claude-opus-4-7': { in: 15 / 1e6, out: 75 / 1e6 },
      'claude-sonnet-4-6': { in: 3 / 1e6, out: 15 / 1e6 },
      'claude-haiku-4-5': { in: 0.8 / 1e6, out: 4 / 1e6 },
    };
    const r = rates[model];
    return tokensInput * r.in + tokensOutput * r.out;
  }
}
