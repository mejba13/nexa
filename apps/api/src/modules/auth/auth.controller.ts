import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth.guard';

import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Idempotent sync of the Clerk user into our DB (called after sign-up). */
  @Post('sync')
  async sync(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.findByClerkId(user.clerkId);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.findByClerkId(user.clerkId);
  }

  @Delete('me')
  async deleteMe(@CurrentUser() user: AuthenticatedUser) {
    await this.auth.deleteByClerkId(user.clerkId);
    return { deleted: true };
  }
}
