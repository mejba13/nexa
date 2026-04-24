import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Plan } from '@nexa/types';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../common/guards/clerk-auth.guard';

import { BillingService } from './billing.service';
import { StripeService } from './stripe.service';

interface CheckoutBody {
  plan: Exclude<Plan, 'FREE'>;
  successUrl: string;
  cancelUrl: string;
}

interface PortalBody {
  returnUrl: string;
}

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly stripe: StripeService,
  ) {}

  @Public()
  @Get('plans')
  plans() {
    return this.billing.plans();
  }

  @Post('checkout')
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() body: CheckoutBody) {
    return this.billing.createCheckoutSession(
      user.clerkId,
      body.plan,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('portal')
  portal(@CurrentUser() user: AuthenticatedUser, @Body() body: PortalBody) {
    return this.billing.createPortalSession(user.clerkId, body.returnUrl);
  }

  @Get('usage')
  usage(@CurrentUser() user: AuthenticatedUser) {
    return this.billing.usageForUser(user.clerkId);
  }

  /**
   * Stripe webhook. Public endpoint, signature-verified via Svix-style raw body.
   * The endpoint MUST live under the global ValidationPipe; we bypass body
   * parsing by relying on `RawBodyRequest` populated by the rawBody-enabled
   * Nest factory (see main.ts).
   */
  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    if (!this.stripe.isConfigured()) throw new BadRequestException('Stripe not configured');

    const event = this.stripe
      .client_()
      .webhooks.constructEvent(req.rawBody, signature, this.stripe.webhookSecret());
    await this.billing.handleWebhookEvent(event);
    return { received: true };
  }
}
