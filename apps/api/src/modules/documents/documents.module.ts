import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { DocumentProcessor } from './document.processor';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { FileParserService } from './file-parser.service';
import { DOCUMENT_QUEUE } from './queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: DOCUMENT_QUEUE })],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentProcessor, FileParserService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
