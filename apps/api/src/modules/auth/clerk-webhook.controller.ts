import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { Webhook } from 'svix';

import { Public } from '../../common/decorators/public.decorator';
import type { Env } from '../../config/env';

import { AuthService } from './auth.service';

interface ClerkEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string; id: string }>;
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
}

@ApiExcludeController()
@Controller('auth/webhook')
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Public()
  @Post('clerk')
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTs: string,
    @Headers('svix-signature') svixSig: string,
  ): Promise<{ ok: true }> {
    if (!svixId || !svixTs || !svixSig) {
      throw new BadRequestException('Missing Svix headers');
    }
    if (!req.rawBody) throw new BadRequestException('Missing raw body');

    const wh = new Webhook(this.config.get('CLERK_WEBHOOK_SECRET', { infer: true }));
    let evt: ClerkEvent;
    try {
      evt = wh.verify(req.rawBody.toString('utf8'), {
        'svix-id': svixId,
        'svix-timestamp': svixTs,
        'svix-signature': svixSig,
      }) as ClerkEvent;
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (evt.type) {
      case 'user.created':
      case 'user.updated': {
        const primaryId = evt.data.primary_email_address_id;
        const email =
          evt.data.email_addresses?.find((e) => e.id === primaryId)?.email_address ??
          evt.data.email_addresses?.[0]?.email_address;
        if (!email) throw new BadRequestException('No email on Clerk user');

        const name = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(' ') || null;
        await this.auth.syncFromClerk({
          clerkId: evt.data.id,
          email,
          name,
          avatarUrl: evt.data.image_url ?? null,
        });
        break;
      }
      case 'user.deleted':
        await this.auth.deleteByClerkId(evt.data.id);
        break;
      default:
        this.logger.debug(`Ignored Clerk event: ${evt.type}`);
    }
    return { ok: true };
  }
}
