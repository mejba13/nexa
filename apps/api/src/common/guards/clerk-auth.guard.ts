import { createClerkClient, type ClerkClient } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import type { Env } from '../../config/env';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export interface AuthenticatedUser {
  clerkId: string;
  sessionId: string;
  orgId?: string;
  role?: string;
}

/**
 * Validates Clerk JWTs via `authenticateRequest`. Public routes opt out with @Public().
 * Admin gating is handled separately (check `user.role === 'admin'` via publicMetadata).
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly clerk: ClerkClient;

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService<Env, true>,
  ) {
    this.clerk = createClerkClient({
      secretKey: config.get('CLERK_SECRET_KEY', { infer: true }),
    });
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request>();

    try {
      const requestState = await this.clerk.authenticateRequest(req, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      if (!requestState.isSignedIn) {
        throw new UnauthorizedException('Not signed in');
      }

      const { sessionClaims } = requestState.toAuth();
      const userId = sessionClaims?.sub;
      if (!userId) throw new UnauthorizedException('Missing sub claim');

      (req as unknown as { user: AuthenticatedUser }).user = {
        clerkId: userId,
        sessionId: sessionClaims.sid as string,
        orgId: sessionClaims.org_id as string | undefined,
        role: (sessionClaims.metadata as { role?: string } | undefined)?.role,
      };
      return true;
    } catch (err) {
      this.logger.warn(`Auth failed: ${(err as Error).message}`);
      throw new UnauthorizedException();
    }
  }
}
