import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type { Env } from '../../config/env';

export const REDIS_CLIENT = 'REDIS_CLIENT';

/**
 * Single IORedis client + a BullMQ bootstrap bound to the same URL.
 * Queue consumers register their own `BullModule.registerQueue` inside their module.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const url = new URL(config.get('REDIS_URL', { infer: true }));
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port || 6379),
            password: url.password || undefined,
            username: url.username || undefined,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Redis(config.get('REDIS_URL', { infer: true }), {
          maxRetriesPerRequest: null,
        }),
    },
  ],
  exports: [BullModule, REDIS_CLIENT],
})
export class RedisModule {}
