import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';

import type { Env } from '../../config/env';
import { PrismaService } from '../../shared/prisma/prisma.service';

interface ClerkUserSnapshot {
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clerk: ClerkClient;
  private readonly adminEmails: ReadonlySet<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.clerk = createClerkClient({
      secretKey: this.config.get('CLERK_SECRET_KEY', { infer: true }),
    });
    const raw = this.config.get('ADMIN_EMAILS', { infer: true }) ?? '';
    this.adminEmails = new Set(
      raw
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  /**
   * Sync a Clerk user into the local DB.
   *
   * Two non-trivial behaviors layered on top of the basic upsert:
   *
   * 1. **Placeholder reassignment.** Seed accounts (`clerkId='user_seed_*'`)
   *    are pre-created with realistic emails so demo data exists before any
   *    real sign-up. When a real Clerk webhook arrives whose email matches a
   *    placeholder row, we rewrite that row's clerkId to the real one in
   *    place — every FK (Conversation, Document, TradingStrategy, …) follows
   *    automatically because they reference `User.id`, not `clerkId`.
   *
   * 2. **Admin auto-promote.** Emails in `ADMIN_EMAILS` env (comma-separated)
   *    get `publicMetadata.role = 'admin'` pushed to Clerk on first sync. The
   *    next session JWT carries `metadata.role = 'admin'` and AdminGuard
   *    lights up. Idempotent — no-op when the role is already set.
   */
  async syncFromClerk(snapshot: ClerkUserSnapshot): Promise<User> {
    const emailLower = snapshot.email.toLowerCase();

    const byEmail = await this.prisma.user.findUnique({ where: { email: snapshot.email } });

    let row: User;
    if (
      byEmail &&
      byEmail.clerkId !== snapshot.clerkId &&
      byEmail.clerkId.startsWith('user_seed_')
    ) {
      this.logger.log(
        `Reassigning seed placeholder ${byEmail.clerkId} → ${snapshot.clerkId} (${emailLower})`,
      );
      row = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          clerkId: snapshot.clerkId,
          name: snapshot.name ?? byEmail.name,
          avatarUrl: snapshot.avatarUrl ?? byEmail.avatarUrl,
        },
      });
    } else {
      row = await this.prisma.user.upsert({
        where: { clerkId: snapshot.clerkId },
        create: snapshot,
        update: {
          email: snapshot.email,
          name: snapshot.name,
          avatarUrl: snapshot.avatarUrl,
        },
      });
    }

    if (this.adminEmails.has(emailLower)) {
      await this.promoteToAdmin(snapshot.clerkId, emailLower);
    }

    return row;
  }

  /**
   * Fetch the local User row for a Clerk session. If the row is missing —
   * which happens in dev when the Clerk webhook isn't forwarded to localhost —
   * pull the user's profile from Clerk and `syncFromClerk` lazily. Keeps the
   * happy path one query while making first sign-in self-healing without
   * Svix/ngrok plumbing.
   */
  async findByClerkId(clerkId: string): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { clerkId } });
    if (existing) return existing;

    let clerkUser: Awaited<ReturnType<ClerkClient['users']['getUser']>>;
    try {
      clerkUser = await this.clerk.users.getUser(clerkId);
    } catch {
      throw new NotFoundException('User not found');
    }
    const primary = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId);
    const email = primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new NotFoundException('Clerk user has no email');
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;

    return this.syncFromClerk({
      clerkId,
      email,
      name,
      avatarUrl: clerkUser.imageUrl ?? null,
    });
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.prisma.user.deleteMany({ where: { clerkId } });
  }

  private async promoteToAdmin(clerkId: string, email: string): Promise<void> {
    try {
      const current = await this.clerk.users.getUser(clerkId);
      const meta = (current.publicMetadata ?? {}) as { role?: string };
      if (meta.role === 'admin') return;
      await this.clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: { ...meta, role: 'admin' },
      });
      this.logger.log(`Promoted ${email} to admin via ADMIN_EMAILS allowlist`);
    } catch (err) {
      this.logger.warn(
        `Admin auto-promote failed for ${email}: ${(err as Error).message}. ` +
          `Set publicMetadata.role='admin' in the Clerk dashboard manually.`,
      );
    }
  }
}
