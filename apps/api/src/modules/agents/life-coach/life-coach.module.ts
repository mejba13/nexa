import { Module, OnModuleInit } from '@nestjs/common';

import { ToolRegistry } from '../../../shared/tools/tool-registry.service';

import { LifeCoachService } from './life-coach.service';
import {
  DecisionFrameworkTool,
  ExtractThemesTool,
  GenerateReflectionTool,
  IngestJournalTool,
  MoodTrackerTool,
  QueryPastReflectionsTool,
} from './tools';

@Module({
  providers: [
    LifeCoachService,
    IngestJournalTool,
    QueryPastReflectionsTool,
    ExtractThemesTool,
    GenerateReflectionTool,
    MoodTrackerTool,
    DecisionFrameworkTool,
  ],
  exports: [LifeCoachService],
})
export class LifeCoachModule implements OnModuleInit {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly ingestJournal: IngestJournalTool,
    private readonly queryPast: QueryPastReflectionsTool,
    private readonly extractThemes: ExtractThemesTool,
    private readonly generateReflection: GenerateReflectionTool,
    private readonly moodTracker: MoodTrackerTool,
    private readonly decisionFramework: DecisionFrameworkTool,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.ingestJournal);
    this.registry.register(this.queryPast);
    this.registry.register(this.extractThemes);
    this.registry.register(this.generateReflection);
    this.registry.register(this.moodTracker);
    this.registry.register(this.decisionFramework);
  }
}
