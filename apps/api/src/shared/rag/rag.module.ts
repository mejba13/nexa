import { Global, Module } from '@nestjs/common';

import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { RetrievalService } from './retrieval.service';

@Global()
@Module({
  providers: [ChunkingService, EmbeddingService, RetrievalService],
  exports: [ChunkingService, EmbeddingService, RetrievalService],
})
export class RagModule {}
