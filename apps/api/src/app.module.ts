import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { envValidationSchema } from './config/env';
import { AgentsModule } from './modules/agents/agents.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { UsersModule } from './modules/users/users.module';
import { ClaudeModule } from './shared/claude/claude.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RagModule } from './shared/rag/rag.module';
import { RedisModule } from './shared/redis/redis.module';
import { StorageModule } from './shared/storage/storage.module';
import { ToolsModule } from './shared/tools/tools.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: envValidationSchema.parse,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 60 },
      { name: 'long', ttl: 60_000, limit: 100 },
    ]),
    // Global shared infra
    PrismaModule,
    RedisModule,
    StorageModule,
    ClaudeModule,
    RagModule,
    ToolsModule,
    // Feature modules
    AuthModule,
    UsersModule,
    AgentsModule,
    ChatModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
