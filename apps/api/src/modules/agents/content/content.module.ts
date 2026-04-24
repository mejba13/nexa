import { Module, OnModuleInit } from '@nestjs/common';

import { ToolRegistry } from '../../../shared/tools/tool-registry.service';

import { ContentService } from './content.service';
import {
  CreateContentCalendarTool,
  GenerateBlogPostTool,
  GenerateSocialPostTool,
  GenerateVideoScriptTool,
  QueryBrandVoiceTool,
  ResearchTrendsTool,
} from './tools';

@Module({
  providers: [
    ContentService,
    QueryBrandVoiceTool,
    GenerateSocialPostTool,
    GenerateBlogPostTool,
    GenerateVideoScriptTool,
    CreateContentCalendarTool,
    ResearchTrendsTool,
  ],
  exports: [ContentService],
})
export class ContentModule implements OnModuleInit {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly queryBrandVoice: QueryBrandVoiceTool,
    private readonly generateSocialPost: GenerateSocialPostTool,
    private readonly generateBlogPost: GenerateBlogPostTool,
    private readonly generateVideoScript: GenerateVideoScriptTool,
    private readonly createContentCalendar: CreateContentCalendarTool,
    private readonly researchTrends: ResearchTrendsTool,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.queryBrandVoice);
    this.registry.register(this.generateSocialPost);
    this.registry.register(this.generateBlogPost);
    this.registry.register(this.generateVideoScript);
    this.registry.register(this.createContentCalendar);
    this.registry.register(this.researchTrends);
  }
}
