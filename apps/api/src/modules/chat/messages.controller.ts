import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Observable } from 'rxjs';

import type { StreamEvent } from '@nexa/types';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth.guard';
import { PrismaService } from '../../shared/prisma/prisma.service';

import { ClaudeOrchestratorService } from './claude-orchestrator.service';
import { UsageService } from './usage.service';

interface SendBody {
  content: string;
}

@ApiTags('messages')
@ApiBearerAuth()
@Controller('conversations/:id/messages')
export class MessagesController {
  constructor(
    private readonly orchestrator: ClaudeOrchestratorService,
    private readonly prisma: PrismaService,
    private readonly usage: UsageService,
  ) {}

  @Post()
  @Sse()
  async stream(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
    @Body() body: SendBody,
  ): Promise<Observable<{ data: StreamEvent }>> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
      select: { id: true },
    });
    if (!dbUser) throw new NotFoundException('User not found');

    const quota = await this.usage.canSpend(dbUser.id);
    if (!quota.allowed) {
      throw new ForbiddenException(
        `Monthly token limit reached (${quota.used}/${quota.limit}). Upgrade your plan.`,
      );
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId: dbUser.id },
      include: { agent: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    return this.orchestrator.run({
      userId: dbUser.id,
      agentType: conversation.agent.type,
      agentRow: {
        id: conversation.agent.id,
        name: conversation.agent.name,
        systemPrompt: conversation.agent.systemPrompt,
        modelId: conversation.agent.modelId,
      },
      conversationId,
      userMessage: body.content,
    });
  }
}
