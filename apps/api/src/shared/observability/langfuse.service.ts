import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Langfuse } from 'langfuse';

import type { Env } from '../../config/env';

interface TraceInput {
  name: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

interface GenerationInput {
  name: string;
  model: string;
  input: unknown;
  output?: unknown;
  tokensInput?: number;
  tokensOutput?: number;
  costUsd?: number;
}

/**
 * Langfuse client wrapper. No-op when LANGFUSE_SECRET_KEY/PUBLIC_KEY are
 * absent — the orchestrator calls these methods unconditionally and pays no
 * runtime cost in dev environments without observability creds.
 */
@Injectable()
export class LangfuseService implements OnModuleDestroy {
  private readonly logger = new Logger(LangfuseService.name);
  private readonly client: Langfuse | null;

  constructor(config: ConfigService<Env, true>) {
    const secret = config.get('LANGFUSE_SECRET_KEY', { infer: true });
    const publicKey = config.get('LANGFUSE_PUBLIC_KEY', { infer: true });
    if (secret && publicKey) {
      this.client = new Langfuse({
        secretKey: secret,
        publicKey,
        baseUrl: config.get('LANGFUSE_HOST', { infer: true }),
      });
    } else {
      this.client = null;
    }
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  trace(input: TraceInput) {
    return this.client?.trace({
      name: input.name,
      userId: input.userId,
      metadata: input.metadata,
    });
  }

  recordGeneration(traceId: string | undefined, input: GenerationInput): void {
    if (!this.client || !traceId) return;
    try {
      this.client.generation({
        traceId,
        name: input.name,
        model: input.model,
        input: input.input,
        output: input.output,
        usage: {
          input: input.tokensInput,
          output: input.tokensOutput,
          totalCost: input.costUsd,
        },
      });
    } catch (err) {
      // Never fail an LLM response just because observability hiccupped.
      this.logger.warn(`Langfuse generation log failed: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.shutdownAsync();
  }
}
