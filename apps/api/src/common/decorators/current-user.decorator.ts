import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedUser } from '../guards/clerk-auth.guard';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as AuthenticatedUser;
  },
);
