import { Module } from '@nestjs/common';

import { ClaudeOrchestratorService } from './claude-orchestrator.service';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { MessagesController } from './messages.controller';
import { UsageService } from './usage.service';

@Module({
  controllers: [ConversationsController, MessagesController],
  providers: [ConversationsService, ClaudeOrchestratorService, UsageService],
  exports: [ConversationsService, ClaudeOrchestratorService, UsageService],
})
export class ChatModule {}
