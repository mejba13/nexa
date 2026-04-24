import { Controller, Get, Header, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AdminGuard } from '../../common/guards/admin.guard';

import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('q') search?: string,
  ) {
    return this.admin.listUsers({
      cursor,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @Get('users/:id')
  userDetails(@Param('id') id: string) {
    return this.admin.userDetails(id);
  }

  @Get('users/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Res({ passthrough: true }) res: Response) {
    const csv = await this.admin.exportUsersCsv();
    res.setHeader('Content-Disposition', 'attachment; filename="nexa-users.csv"');
    return csv;
  }

  @Get('stats')
  stats(@Query('days') days?: string) {
    return this.admin.platformStats(days ? Number(days) : undefined);
  }

  @Get('agents/usage')
  agentUsage(@Query('days') days?: string) {
    return this.admin.agentUsage(days ? Number(days) : undefined);
  }
}
