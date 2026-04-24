import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/guards/clerk-auth.guard';
import { PrismaService } from '../../../shared/prisma/prisma.service';

import { strategyRulesSchema, type StrategyRulesInput } from './backtest/schema';
import { TradingService } from './trading.service';

interface CreateStrategyBody {
  name: string;
  description: string;
  rules: StrategyRulesInput;
}

interface RunBacktestBody {
  strategyId: string;
  initialCapital: number;
  documentId?: string;
  csv?: string;
}

@ApiTags('trading')
@ApiBearerAuth()
@Controller('trading')
export class TradingController {
  constructor(
    private readonly trading: TradingService,
    private readonly prisma: PrismaService,
  ) {}

  private async dbUserId(clerkId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.id;
  }

  // ============ Strategies ============

  @Get('strategies')
  async listStrategies(@CurrentUser() u: AuthenticatedUser) {
    return this.trading.listStrategies(await this.dbUserId(u.clerkId));
  }

  @Post('strategies')
  async createStrategy(@CurrentUser() u: AuthenticatedUser, @Body() body: CreateStrategyBody) {
    // Validate the rules at the edge so a bad DTO never reaches the service.
    const rules = strategyRulesSchema.parse(body.rules);
    return this.trading.createStrategy(await this.dbUserId(u.clerkId), {
      name: body.name,
      description: body.description,
      rules,
    });
  }

  @Get('strategies/:id')
  async getStrategy(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    return this.trading.getStrategy(await this.dbUserId(u.clerkId), id);
  }

  @Delete('strategies/:id')
  async deleteStrategy(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    await this.trading.deleteStrategy(await this.dbUserId(u.clerkId), id);
    return { deleted: true };
  }

  // ============ Backtests ============

  @Post('backtests')
  async runBacktest(@CurrentUser() u: AuthenticatedUser, @Body() body: RunBacktestBody) {
    const { backtest, result } = await this.trading.runBacktest(
      await this.dbUserId(u.clerkId),
      body,
    );
    return { backtest, result };
  }

  @Get('backtests')
  async listBacktests(
    @CurrentUser() u: AuthenticatedUser,
    @Query('strategyId') strategyId?: string,
  ) {
    return this.trading.listBacktests(await this.dbUserId(u.clerkId), strategyId);
  }

  @Get('backtests/:id')
  async getBacktest(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    return this.trading.getBacktest(await this.dbUserId(u.clerkId), id);
  }

  @Get('backtests/:id/status')
  async backtestStatus(@CurrentUser() u: AuthenticatedUser, @Param('id') id: string) {
    // v1 backtests are synchronous (in-process). Status always reflects row existence.
    const row = await this.trading.getBacktest(await this.dbUserId(u.clerkId), id);
    return { status: 'COMPLETED', backtestId: row.id, createdAt: row.createdAt };
  }
}
