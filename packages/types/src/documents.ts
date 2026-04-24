import type { AgentType } from './agents.js';

export type DocStatus = 'PROCESSING' | 'INDEXED' | 'FAILED';

export interface DocumentSummary {
  id: string;
  userId: string;
  agentType: AgentType;
  filename: string;
  mimeType: string;
  fileSize: number;
  status: DocStatus;
  createdAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata?: Record<string, unknown> | null;
}

export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/csv',
] as const;
export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const EMBEDDING_DIMENSION = 1536; // text-embedding-3-small
export const CHUNK_SIZE_TOKENS = 512;
export const CHUNK_OVERLAP_TOKENS = 64;
