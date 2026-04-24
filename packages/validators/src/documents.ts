import { z } from 'zod';

import { MAX_FILE_SIZE_BYTES, SUPPORTED_MIME_TYPES } from '@nexa/types';

import { agentTypeSchema } from './agents.js';

export const uploadDocumentSchema = z.object({
  agentType: agentTypeSchema,
  filename: z.string().trim().min(1).max(255),
  mimeType: z.enum(SUPPORTED_MIME_TYPES),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
});
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const listDocumentsSchema = z.object({
  agentType: agentTypeSchema.optional(),
});
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
