import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface ClerkUserSnapshot {
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncFromClerk(snapshot: ClerkUserSnapshot): Promise<User> {
    return this.prisma.user.upsert({
      where: { clerkId: snapshot.clerkId },
      create: snapshot,
      update: {
        email: snapshot.email,
        name: snapshot.name,
        avatarUrl: snapshot.avatarUrl,
      },
    });
  }

  async findByClerkId(clerkId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.prisma.user.deleteMany({ where: { clerkId } });
  }
}
