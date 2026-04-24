import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import type { Plan } from '@nexa/types';

import type { Env } from '../../config/env';

/**
 * Thin Stripe client wrapper. All billing routes go through this service so
 * unconfigured environments throw a typed 503 instead of leaking nulls.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly client: Stripe | null;

  constructor(private readonly config: ConfigService<Env, true>) {
    const key = this.config.get('STRIPE_SECRET_KEY', { infer: true });
    this.client = key
      ? new Stripe(key, { apiVersion: '2024-04-10' as Stripe.LatestApiVersion })
      : null;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  client_(): Stripe {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Billing is not configured (STRIPE_SECRET_KEY missing).',
      );
    }
    return this.client;
  }

  /** Returns the Stripe price id mapped to a paid plan, or null for FREE. */
  priceIdFor(plan: Plan): string | null {
    switch (plan) {
      case 'STARTER':
        return this.config.get('STRIPE_PRICE_STARTER', { infer: true }) ?? null;
      case 'PRO':
        return this.config.get('STRIPE_PRICE_PRO', { infer: true }) ?? null;
      case 'BUSINESS':
        return this.config.get('STRIPE_PRICE_BUSINESS', { infer: true }) ?? null;
      case 'FREE':
      default:
        return null;
    }
  }

  /** Reverse lookup: given a Stripe price id, find which plan it represents. */
  planForPriceId(priceId: string): Plan | null {
    if (priceId === this.config.get('STRIPE_PRICE_STARTER', { infer: true })) return 'STARTER';
    if (priceId === this.config.get('STRIPE_PRICE_PRO', { infer: true })) return 'PRO';
    if (priceId === this.config.get('STRIPE_PRICE_BUSINESS', { infer: true })) return 'BUSINESS';
    return null;
  }

  webhookSecret(): string {
    const s = this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true });
    if (!s) throw new ServiceUnavailableException('STRIPE_WEBHOOK_SECRET missing');
    return s;
  }
}
