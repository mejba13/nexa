import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AgentType } from '@nexa/types';

import type { Env } from '../../config/env';

/**
 * Cloudflare R2 client. R2 speaks the S3 API, so @aws-sdk/client-s3 works with a
 * custom endpoint. Keys are always tenant-scoped per PRD §12:
 *
 *   users/{userId}/agents/{agentType}/{fileId}.{ext}
 */
@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;

  constructor(config: ConfigService<Env, true>) {
    const accountId = config.get('R2_ACCOUNT_ID', { infer: true });
    this.bucket = config.get('R2_BUCKET_NAME', { infer: true }) ?? '';
    this.publicUrl = config.get('R2_PUBLIC_URL', { infer: true });

    this.client = new S3Client({
      region: 'auto',
      endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
      credentials: {
        accessKeyId: config.get('R2_ACCESS_KEY_ID', { infer: true }) ?? '',
        secretAccessKey: config.get('R2_SECRET_ACCESS_KEY', { infer: true }) ?? '',
      },
    });
  }

  buildKey(params: {
    userId: string;
    agentType: AgentType;
    fileId: string;
    extension: string;
  }): string {
    return `users/${params.userId}/agents/${params.agentType}/${params.fileId}.${params.extension}`;
  }

  publicUrlFor(key: string): string {
    if (this.publicUrl) return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    return `r2://${this.bucket}/${key}`;
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async getObject(key: string): Promise<Buffer> {
    const out = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!out.Body) throw new Error(`R2 object has no body: ${key}`);
    return Buffer.from(await out.Body.transformToByteArray());
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** Presigned PUT URL — lets the client stream the upload straight to R2. */
  async presignUpload(key: string, contentType: string, expiresSec = 60 * 5): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: expiresSec },
    );
  }
}
