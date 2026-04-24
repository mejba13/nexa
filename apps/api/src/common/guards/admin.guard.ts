import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from './clerk-auth.guard';

/** Gate admin-only routes. Expects ClerkAuthGuard to have populated req.user. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin only');
    }
    return true;
  }
}
