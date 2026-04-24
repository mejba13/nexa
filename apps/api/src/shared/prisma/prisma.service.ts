import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client as a NestJS service.
 * Use `runAsUser(userId, fn)` to scope a transaction for RLS —
 * sets `app.current_user_id` so Postgres row-level-security policies apply.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Executes `fn` inside a transaction with the current user id bound to the session,
   * so Postgres RLS policies referencing `current_setting('app.current_user_id')` apply.
   */
  async runAsUser<T>(userId: string, fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_user_id', $1, true)`, userId);
      return fn(tx as unknown as PrismaClient);
    });
  }
}
