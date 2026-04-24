import { randomUUID } from 'node:crypto';

import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { AgentType } from '@prisma/client';
import type { Queue } from 'bullmq';

import {
  MAX_FILE_SIZE_BYTES,
  PLAN_LIMITS,
  SUPPORTED_MIME_TYPES,
  type SupportedMimeType,
} from '@nexa/types';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { R2StorageService } from '../../shared/storage/r2.service';

import { DOCUMENT_QUEUE, type ProcessDocumentJob } from './queue.constants';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: R2StorageService,
    @InjectQueue(DOCUMENT_QUEUE) private readonly queue: Queue<ProcessDocumentJob>,
  ) {}

  private async userFromClerk(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, plan: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async list(clerkId: string, agentType?: AgentType) {
    const user = await this.userFromClerk(clerkId);
    return this.prisma.document.findMany({
      where: { userId: user.id, ...(agentType ? { agentType } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(clerkId: string, id: string) {
    const user = await this.userFromClerk(clerkId);
    const doc = await this.prisma.document.findFirst({ where: { id, userId: user.id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async upload(
    clerkId: string,
    params: {
      agentType: AgentType;
      filename: string;
      mimeType: string;
      buffer: Buffer;
    },
  ) {
    if (params.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException('File exceeds 50 MB');
    }
    if (!SUPPORTED_MIME_TYPES.includes(params.mimeType as SupportedMimeType)) {
      throw new BadRequestException(`Unsupported MIME: ${params.mimeType}`);
    }

    const user = await this.userFromClerk(clerkId);

    // Plan cap on file count.
    const fileLimit = PLAN_LIMITS[user.plan].maxFiles;
    if (Number.isFinite(fileLimit)) {
      const count = await this.prisma.document.count({ where: { userId: user.id } });
      if (count >= fileLimit) {
        throw new BadRequestException(`Plan limit reached: ${fileLimit} files`);
      }
    }

    const fileId = randomUUID();
    const ext = mimeToExt(params.mimeType);
    const key = this.storage.buildKey({
      userId: user.id,
      agentType: params.agentType,
      fileId,
      extension: ext,
    });

    await this.storage.putObject(key, params.buffer, params.mimeType);

    const doc = await this.prisma.document.create({
      data: {
        userId: user.id,
        agentType: params.agentType,
        filename: params.filename,
        mimeType: params.mimeType,
        fileSize: params.buffer.byteLength,
        storageUrl: this.storage.publicUrlFor(key),
        status: 'PROCESSING',
        metadata: { key, fileId },
      },
    });

    await this.queue.add(
      DOCUMENT_QUEUE,
      { documentId: doc.id, userId: user.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5_000 } },
    );

    return doc;
  }

  async remove(clerkId: string, id: string): Promise<void> {
    const user = await this.userFromClerk(clerkId);
    const doc = await this.prisma.document.findFirst({
      where: { id, userId: user.id },
    });
    if (!doc) throw new NotFoundException();

    const meta = doc.metadata as { key?: string } | null;
    if (meta?.key) {
      await this.storage
        .deleteObject(meta.key)
        .catch((err: Error) =>
          this.logger.warn(`R2 delete failed for ${meta.key}: ${err.message}`),
        );
    }
    await this.prisma.document.delete({ where: { id } });
  }

  async reindex(clerkId: string, id: string): Promise<void> {
    const doc = await this.get(clerkId, id);
    await this.prisma.documentChunk.deleteMany({ where: { documentId: doc.id } });
    await this.prisma.document.update({
      where: { id: doc.id },
      data: { status: 'PROCESSING' },
    });
    await this.queue.add(DOCUMENT_QUEUE, { documentId: doc.id, userId: doc.userId });
  }
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'application/pdf':
      return 'pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'text/plain':
      return 'txt';
    case 'text/markdown':
      return 'md';
    case 'text/csv':
      return 'csv';
    default:
      return 'bin';
  }
}
