import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    clerkId: string,
    patch: { name?: string; avatarUrl?: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { clerkId },
      data: patch,
    });
  }
}
