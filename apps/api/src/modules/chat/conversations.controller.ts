import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AgentType } from '@prisma/client';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth.guard';

import { ConversationsService } from './conversations.service';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('agentType') agentType?: AgentType,
    @Query('archived') archived?: string,
  ) {
    return this.conversations.list(user.clerkId, {
      agentType,
      isArchived: archived === 'true',
    });
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { agentType: AgentType; title?: string },
  ) {
    return this.conversations.create(user.clerkId, body.agentType, body.title);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.conversations.getWithMessages(user.clerkId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { title?: string; isStarred?: boolean; isArchived?: boolean },
  ) {
    return this.conversations.update(user.clerkId, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.conversations.remove(user.clerkId, id);
  }

  @Get(':id/export')
  @Header('Content-Type', 'text/markdown; charset=utf-8')
  async export(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const md = await this.conversations.exportMarkdown(user.clerkId, id);
    res.setHeader('Content-Disposition', `attachment; filename="conversation-${id}.md"`);
    return md;
  }
}
