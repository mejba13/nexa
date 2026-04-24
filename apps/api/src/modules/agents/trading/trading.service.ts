import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Backtest, TradingStrategy } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { PrismaService } from '../../../shared/prisma/prisma.service';
import { R2StorageService } from '../../../shared/storage/r2.service';

import { BacktestEngine } from './backtest/engine';
import { parseOhlcvCsv } from './backtest/csv';
import type { BacktestResult } from './backtest/types';
import { strategyRulesSchema, type StrategyRulesInput } from './backtest/schema';

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: R2StorageService,
    private readonly engine: BacktestEngine,
  ) {}

  // ==================================================================
  // Strategies
  // ==================================================================

  async listStrategies(userId: string): Promise<TradingStrategy[]> {
    return this.prisma.tradingStrategy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStrategy(
    userId: string,
    input: { name: string; description: string; rules: StrategyRulesInput },
  ): Promise<TradingStrategy> {
    // Validate rule shape eagerly so bad strategies never sit in the DB.
    const rules = strategyRulesSchema.parse(input.rules);
    return this.prisma.tradingStrategy.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        rules: rules as unknown as object,
      },
    });
  }

  async getStrategy(userId: string, id: string): Promise<TradingStrategy> {
    const row = await this.prisma.tradingStrategy.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Strategy not found');
    return row;
  }

  async deleteStrategy(userId: string, id: string): Promise<void> {
    const row = await this.getStrategy(userId, id);
    await this.prisma.tradingStrategy.delete({ where: { id: row.id } });
  }

  // ==================================================================
  // Market data
  // ==================================================================

  /**
   * Loads CSV bar data. Either an already-uploaded Document (R2-backed) or an
   * inline CSV blob supplied directly. Returns normalized Bar[] + summary.
   */
  async loadBars(
    userId: string,
    input: { documentId?: string; csv?: string },
  ): Promise<{ bars: ReturnType<typeof parseOhlcvCsv>; source: string }> {
    if (input.csv) {
      const bars = parseOhlcvCsv(input.csv);
      return { bars, source: 'inline-csv' };
    }
    if (!input.documentId) {
      throw new BadRequestException('Provide either documentId or inline csv');
    }

    const doc = await this.prisma.document.findFirst({
      where: { id: input.documentId, userId, agentType: 'TRADING' },
    });
    if (!doc) throw new NotFoundException('Market data document not found');
    if (doc.mimeType !== 'text/csv') {
      throw new BadRequestException('Document is not a CSV');
    }
    const meta = doc.metadata as { key?: string } | null;
    if (!meta?.key) throw new BadRequestException('Document has no R2 key');
    const buf = await this.storage.getObject(meta.key);
    const bars = parseOhlcvCsv(buf.toString('utf8'));
    return { bars, source: `document:${doc.id}` };
  }

  // ==================================================================
  // Backtests
  // ==================================================================

  async runBacktest(
    userId: string,
    params: {
      strategyId: string;
      initialCapital: number;
      documentId?: string;
      csv?: string;
    },
  ): Promise<{ backtest: Backtest; result: BacktestResult }> {
    const strategy = await this.getStrategy(userId, params.strategyId);
    const { bars } = await this.loadBars(userId, {
      documentId: params.documentId,
      csv: params.csv,
    });
    if (bars.length < 2) throw new BadRequestException('Need at least 2 bars to backtest');

    const rules = strategyRulesSchema.parse(strategy.rules);
    const result = this.engine.run({
      bars,
      rules,
      initialCapital: params.initialCapital,
    });

    const backtest = await this.prisma.backtest.create({
      data: {
        strategyId: strategy.id,
        symbol: rules.symbol,
        startDate: new Date(result.metrics.startDate),
        endDate: new Date(result.metrics.endDate),
        initialCapital: new Decimal(result.metrics.initialCapital.toFixed(2)),
        finalCapital: new Decimal(result.metrics.finalCapital.toFixed(2)),
        winRate: result.metrics.winRate,
        maxDrawdown: result.metrics.maxDrawdownPct,
        sharpeRatio: result.metrics.sharpeRatio ?? null,
        totalTrades: result.metrics.totalTrades,
        results: result as unknown as object,
      },
    });

    return { backtest, result };
  }

  async getBacktest(userId: string, id: string): Promise<Backtest> {
    const row = await this.prisma.backtest.findFirst({
      where: { id, strategy: { userId } },
      include: { strategy: true },
    });
    if (!row) throw new NotFoundException('Backtest not found');
    return row;
  }

  async listBacktests(userId: string, strategyId?: string): Promise<Backtest[]> {
    return this.prisma.backtest.findMany({
      where: {
        strategy: { userId },
        ...(strategyId ? { strategyId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==================================================================
  // Analysis helpers
  // ==================================================================

  /**
   * Deterministic improvement suggestions derived from the metrics.
   * Claude only narrates these — it never invents numeric recommendations.
   */
  suggestImprovements(result: BacktestResult): string[] {
    const s: string[] = [];
    const m = result.metrics;
    if (m.totalTrades === 0) {
      s.push('No trades triggered. Loosen entry conditions or extend the data range.');
      return s;
    }
    if (m.winRate < 0.45) {
      s.push(
        `Win rate ${(m.winRate * 100).toFixed(1)}% is below 45% — tighten entry filters or add a trend confirmation indicator.`,
      );
    }
    if (m.maxDrawdownPct < -25) {
      s.push(
        `Max drawdown ${m.maxDrawdownPct.toFixed(1)}% is severe — add a stop-loss rule or reduce sizing fraction.`,
      );
    }
    if (m.profitFactor < 1.2 && Number.isFinite(m.profitFactor)) {
      s.push(
        `Profit factor ${m.profitFactor.toFixed(2)} leaves little margin — widen take-profit or filter losing-regime entries.`,
      );
    }
    if (m.sharpeRatio !== null && m.sharpeRatio < 0.5) {
      s.push(
        `Sharpe ${m.sharpeRatio.toFixed(2)} suggests unfavourable risk/reward — reduce trade frequency or size smaller in volatile regimes.`,
      );
    }
    if (s.length === 0) {
      s.push('Metrics look solid. Consider walk-forward validation on an out-of-sample slice.');
    }
    return s;
  }
}
