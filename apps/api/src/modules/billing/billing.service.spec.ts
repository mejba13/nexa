import type Stripe from 'stripe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BillingService } from './billing.service';
import type { StripeService } from './stripe.service';

interface MockUserStore {
  findUnique: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
}

interface MockPrisma {
  user: MockUserStore;
}

interface MockStripeClient {
  subscriptions: { retrieve: ReturnType<typeof vi.fn> };
}

function makePrisma(): MockPrisma {
  return {
    user: {
      findUnique: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
}

function makeStripe(retrievedSub?: Partial<Stripe.Subscription>): {
  service: StripeService;
  client: MockStripeClient;
} {
  const client: MockStripeClient = {
    subscriptions: { retrieve: vi.fn().mockResolvedValue(retrievedSub) },
  };
  const service = {
    isConfigured: () => true,
    client_: () => client as unknown as Stripe,
    priceIdFor: (plan: string) =>
      ({
        STARTER: 'price_starter',
        PRO: 'price_pro',
        BUSINESS: 'price_business',
      })[plan] ?? null,
    planForPriceId: (id: string) =>
      ({
        price_starter: 'STARTER',
        price_pro: 'PRO',
        price_business: 'BUSINESS',
      })[id] ?? null,
    webhookSecret: () => 'whsec_test',
  } as unknown as StripeService;
  return { service, client };
}

function buildService(stripeClient?: MockStripeClient) {
  const prisma = makePrisma();
  const { service: stripe, client } = makeStripe();
  // Stub the inner subscriptions.retrieve when caller pre-supplies one.
  if (stripeClient?.subscriptions?.retrieve) {
    client.subscriptions.retrieve = stripeClient.subscriptions.retrieve;
  }
  const usage = { canSpend: vi.fn() } as unknown as ConstructorParameters<typeof BillingService>[2];
  const billing = new BillingService(prisma as never, stripe, usage);
  return { billing, prisma, stripeClient: client };
}

describe('BillingService.handleWebhookEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('grants the mapped plan on customer.subscription.created (active)', async () => {
    const { billing, prisma } = buildService();
    const event = {
      id: 'evt_1',
      type: 'customer.subscription.created',
      data: {
        object: {
          customer: 'cus_abc',
          status: 'active',
          items: { data: [{ price: { id: 'price_pro' } }] },
        } as unknown as Stripe.Subscription,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: { plan: 'PRO' },
    });
  });

  it('grants when status is trialing', async () => {
    const { billing, prisma } = buildService();
    const event = {
      id: 'evt_2',
      type: 'customer.subscription.updated',
      data: {
        object: {
          customer: 'cus_abc',
          status: 'trialing',
          items: { data: [{ price: { id: 'price_starter' } }] },
        } as unknown as Stripe.Subscription,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: { plan: 'STARTER' },
    });
  });

  it('downgrades to FREE when subscription becomes past_due', async () => {
    const { billing, prisma } = buildService();
    const event = {
      id: 'evt_3',
      type: 'customer.subscription.updated',
      data: {
        object: {
          customer: 'cus_abc',
          status: 'past_due',
          items: { data: [{ price: { id: 'price_pro' } }] },
        } as unknown as Stripe.Subscription,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: { plan: 'FREE' },
    });
  });

  it('downgrades to FREE on customer.subscription.deleted', async () => {
    const { billing, prisma } = buildService();
    const event = {
      id: 'evt_4',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          customer: 'cus_abc',
          status: 'canceled',
          items: { data: [{ price: { id: 'price_pro' } }] },
        } as unknown as Stripe.Subscription,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: { plan: 'FREE' },
    });
  });

  it('hydrates the subscription from Stripe on checkout.session.completed', async () => {
    const stub = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_xyz',
          customer: 'cus_abc',
          status: 'active',
          items: { data: [{ price: { id: 'price_business' } }] },
        }),
      },
    };
    const { billing, prisma, stripeClient } = buildService(stub);

    const event = {
      id: 'evt_5',
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'subscription',
          subscription: 'sub_xyz',
        } as unknown as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(stripeClient.subscriptions.retrieve).toHaveBeenCalledWith('sub_xyz');
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      data: { plan: 'BUSINESS' },
    });
  });

  it('ignores checkout sessions in non-subscription mode', async () => {
    const { billing, prisma, stripeClient } = buildService();
    const event = {
      id: 'evt_6',
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'payment',
          subscription: null,
        } as unknown as Stripe.Checkout.Session,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(stripeClient.subscriptions.retrieve).not.toHaveBeenCalled();
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('warns and no-ops when the price ID is not in the catalogue', async () => {
    const { billing, prisma } = buildService();
    const event = {
      id: 'evt_7',
      type: 'customer.subscription.updated',
      data: {
        object: {
          customer: 'cus_abc',
          status: 'active',
          items: { data: [{ price: { id: 'price_unknown_legacy' } }] },
        } as unknown as Stripe.Subscription,
      },
    } as unknown as Stripe.Event;

    await billing.handleWebhookEvent(event);

    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });

  it('acks unrecognised event types without throwing', async () => {
    const { billing, prisma } = buildService();
    const event = {
      id: 'evt_8',
      type: 'invoice.payment_failed',
      data: { object: {} },
    } as unknown as Stripe.Event;

    await expect(billing.handleWebhookEvent(event)).resolves.toBeUndefined();
    expect(prisma.user.updateMany).not.toHaveBeenCalled();
  });
});
