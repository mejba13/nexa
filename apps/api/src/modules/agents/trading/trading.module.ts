import { Module, OnModuleInit } from '@nestjs/common';

import { ToolRegistry } from '../../../shared/tools/tool-registry.service';

import { BacktestEngine } from './backtest/engine';
import {
  CompareStrategiesTool,
  GetPerformanceMetricsTool,
  RunBacktestTool,
  SuggestImprovementsTool,
  UploadMarketDataTool,
  UploadStrategyTool,
} from './tools';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';

@Module({
  controllers: [TradingController],
  providers: [
    TradingService,
    BacktestEngine,
    UploadStrategyTool,
    UploadMarketDataTool,
    RunBacktestTool,
    GetPerformanceMetricsTool,
    CompareStrategiesTool,
    SuggestImprovementsTool,
  ],
  exports: [TradingService],
})
export class TradingModule implements OnModuleInit {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly uploadStrategy: UploadStrategyTool,
    private readonly uploadMarketData: UploadMarketDataTool,
    private readonly runBacktest: RunBacktestTool,
    private readonly getPerformance: GetPerformanceMetricsTool,
    private readonly compareStrategies: CompareStrategiesTool,
    private readonly suggestImprovements: SuggestImprovementsTool,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.uploadStrategy);
    this.registry.register(this.uploadMarketData);
    this.registry.register(this.runBacktest);
    this.registry.register(this.getPerformance);
    this.registry.register(this.compareStrategies);
    this.registry.register(this.suggestImprovements);
  }
}
