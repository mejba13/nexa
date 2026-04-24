import { Controller, ForbiddenException, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AgentType } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth.guard';

import { AgentsService } from './agents.service';

@ApiTags('agents')
@ApiBearerAuth()
@Controller('agents')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  list() {
    return this.agents.listActive();
  }

  @Get(':type')
  getOne(@Param('type') type: AgentType) {
    return this.agents.getByType(type);
  }

  @Get(':type/status')
  async status(@Param('type') type: AgentType, @CurrentUser() user: AuthenticatedUser) {
    const access = await this.agents.userHasAccess(user.clerkId, type);
    if (!access.allowed) throw new ForbiddenException(access.reason);
    return { allowed: true, type };
  }
}
