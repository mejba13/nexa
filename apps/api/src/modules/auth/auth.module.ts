import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkWebhookController } from './clerk-webhook.controller';

@Module({
  controllers: [AuthController, ClerkWebhookController],
  providers: [AuthService, { provide: APP_GUARD, useClass: ClerkAuthGuard }],
  exports: [AuthService],
})
export class AuthModule {}
