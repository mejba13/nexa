import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { AgentType } from '@prisma/client';

import { MAX_FILE_SIZE_BYTES } from '@nexa/types';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth.guard';

import { DocumentsService } from './documents.service';

interface UploadedMulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly docs: DocumentsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('agentType') agentType?: AgentType) {
    return this.docs.list(user.clerkId, agentType);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: UploadedMulterFile | undefined,
    @Query('agentType') agentType: AgentType,
  ) {
    if (!file) throw new BadRequestException('file is required');
    if (!agentType) throw new BadRequestException('agentType is required');
    return this.docs.upload(user.clerkId, {
      agentType,
      filename: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.docs.get(user.clerkId, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.docs.remove(user.clerkId, id);
  }

  @Post(':id/reindex')
  reindex(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.docs.reindex(user.clerkId, id);
  }
}
