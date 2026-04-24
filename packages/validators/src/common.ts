import { z } from 'zod';

export const cuid = z.string().cuid();
export const iso = z.string().datetime();
export const nonEmpty = z.string().trim().min(1);

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export type Pagination = z.infer<typeof paginationSchema>;
