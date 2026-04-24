import { z } from 'zod';

import { PLANS } from '@nexa/types';

export const planSchema = z.enum(PLANS);

export const checkoutSchema = z.object({
  plan: planSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
