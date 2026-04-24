import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PLAN_LIMITS, type Plan } from '@nexa/types';
import type Stripe from 'stripe';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { UsageService } from '../chat/usage.service';

import { StripeService } from './stripe.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly usage: UsageService,
  ) {}

  // ==================================================================
  // Plan catalogue (read-only)
  // ==================================================================

  plans() {
    return (Object.keys(PLAN_LIMITS) as Plan[]).map((plan) => ({
      plan,
      limits: PLAN_LIMITS[plan],
      priceId: this.stripe.priceIdFor(plan),
    }));
  }

  // ==================================================================
  // Checkout / portal
  // ==================================================================

  async createCheckoutSession(
    clerkId: string,
    plan: Exclude<Plan, 'FREE'>,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const priceId = this.stripe.priceIdFor(plan);
    if (!priceId) throw new BadRequestException(`Stripe price not configured for ${plan}`);

    const customerId = await this.ensureStripeCustomer(clerkId);
    const session = await this.stripe.client_().checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      // Idempotency on the client side prevents duplicate subscriptions if the
      // user double-clicks; subscriptionData metadata aids the webhook reconciler.
      subscription_data: { metadata: { clerkId, plan } },
    });
    if (!session.url) throw new BadRequestException('Stripe did not return a session URL');
    return { url: session.url };
  }

  async createPortalSession(clerkId: string, returnUrl: string): Promise<{ url: string }> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) throw new BadRequestException('No Stripe customer for user');

    const session = await this.stripe.client_().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });
    return { url: session.url };
  }

  // ==================================================================
  // Usage view
  // ==================================================================

  async usageForUser(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, plan: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const quota = await this.usage.canSpend(user.id);
    return {
      plan: user.plan,
      limits: PLAN_LIMITS[user.plan],
      tokensUsed: quota.used,
      tokensLimit: quota.limit,
      allowed: quota.allowed,
    };
  }

  // ==================================================================
  // Webhook reconciliation
  // ==================================================================

  /**
   * Idempotent: maps Stripe events → user.plan. Anything we don't recognise is
   * logged and acked (200) to avoid Stripe retry storms.
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Stripe event ${event.id} type=${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && typeof session.subscription === 'string') {
          await this.syncSubscription(session.subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await this.applySubscription(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        await this.prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'FREE' },
        });
        break;
      }
      case 'invoice.payment_failed': {
        // No plan change yet — Stripe sends subscription.updated with status=past_due.
        // Hook for future email notification.
        break;
      }
      default:
        this.logger.debug(`Ignored Stripe event: ${event.type}`);
    }
  }

  // ==================================================================
  // Private
  // ==================================================================

  private async ensureStripeCustomer(clerkId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripe.client_().customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { clerkId, userId: user.id },
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }

  private async syncSubscription(subscriptionId: string): Promise<void> {
    const sub = await this.stripe.client_().subscriptions.retrieve(subscriptionId);
    await this.applySubscription(sub);
  }

  private async applySubscription(sub: Stripe.Subscription): Promise<void> {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const priceId = sub.items.data[0]?.price.id;
    if (!priceId) {
      this.logger.warn(`Subscription ${sub.id} has no price item`);
      return;
    }
    const plan = this.stripe.planForPriceId(priceId);
    if (!plan) {
      this.logger.warn(`Subscription ${sub.id} priceId ${priceId} not in catalogue`);
      return;
    }

    // active / trialing → grant plan; anything else → downgrade to FREE
    const grantsAccess = sub.status === 'active' || sub.status === 'trialing';
    const targetPlan: Plan = grantsAccess ? plan : 'FREE';

    await this.prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: { plan: targetPlan },
    });
  }
}
