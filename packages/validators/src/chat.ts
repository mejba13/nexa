import { z } from 'zod';

import { agentTypeSchema } from './agents.js';

export const createConversationSchema = z.object({
  agentType: agentTypeSchema,
  title: z.string().trim().max(200).optional(),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(32_000),
  attachments: z
    .array(
      z.object({
        documentId: z.string().cuid(),
        filename: z.string(),
      }),
    )
    .optional()
    .default([]),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const updateConversationSchema = z.object({
  title: z.string().trim().max(200).optional(),
  isStarred: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
