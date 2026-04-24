import { Module, OnModuleInit } from '@nestjs/common';

import { ToolRegistry } from '../../../shared/tools/tool-registry.service';

import { FreesoundService } from './freesound.service';
import { MusicService } from './music.service';
import { SpotifyService } from './spotify.service';
import {
  FindSamplesTool,
  GenerateLyricsTool,
  MixingGuidanceTool,
  SearchReferencesTool,
  SuggestArrangementTool,
  SuggestInstrumentsTool,
} from './tools';

@Module({
  providers: [
    MusicService,
    SpotifyService,
    FreesoundService,
    SearchReferencesTool,
    SuggestInstrumentsTool,
    SuggestArrangementTool,
    GenerateLyricsTool,
    FindSamplesTool,
    MixingGuidanceTool,
  ],
  exports: [MusicService],
})
export class MusicModule implements OnModuleInit {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly searchReferences: SearchReferencesTool,
    private readonly suggestInstruments: SuggestInstrumentsTool,
    private readonly suggestArrangement: SuggestArrangementTool,
    private readonly generateLyrics: GenerateLyricsTool,
    private readonly findSamples: FindSamplesTool,
    private readonly mixingGuidance: MixingGuidanceTool,
  ) {}

  onModuleInit(): void {
    this.registry.register(this.searchReferences);
    this.registry.register(this.suggestInstruments);
    this.registry.register(this.suggestArrangement);
    this.registry.register(this.generateLyrics);
    this.registry.register(this.findSamples);
    this.registry.register(this.mixingGuidance);
  }
}
