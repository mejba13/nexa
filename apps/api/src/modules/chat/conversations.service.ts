import { Injectable, NotFoundException } from '@nestjs/common';
import type { AgentType, Conversation, Message } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async userIdFromClerk(clerkId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.id;
  }

  async list(clerkId: string, filter?: { agentType?: AgentType; isArchived?: boolean }) {
    const userId = await this.userIdFromClerk(clerkId);
    return this.prisma.conversation.findMany({
      where: {
        userId,
        ...(filter?.agentType ? { agent: { type: filter.agentType } } : {}),
        isArchived: filter?.isArchived ?? false,
      },
      orderBy: { updatedAt: 'desc' },
      include: { agent: { select: { type: true, name: true } } },
    });
  }

  async create(clerkId: string, agentType: AgentType, title?: string): Promise<Conversation> {
    const userId = await this.userIdFromClerk(clerkId);
    const agent = await this.prisma.agent.findUnique({ where: { type: agentType } });
    if (!agent) throw new NotFoundException(`Agent ${agentType} not found`);
    return this.prisma.conversation.create({
      data: {
        userId,
        agentId: agent.id,
        title: title ?? 'New Conversation',
      },
    });
  }

  async getWithMessages(clerkId: string, id: string) {
    const userId = await this.userIdFromClerk(clerkId);
    const conv = await this.prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        agent: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async update(
    clerkId: string,
    id: string,
    patch: { title?: string; isStarred?: boolean; isArchived?: boolean },
  ) {
    const userId = await this.userIdFromClerk(clerkId);
    const existing = await this.prisma.conversation.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException();
    return this.prisma.conversation.update({ where: { id }, data: patch });
  }

  async remove(clerkId: string, id: string): Promise<void> {
    const userId = await this.userIdFromClerk(clerkId);
    const existing = await this.prisma.conversation.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException();
    await this.prisma.conversation.delete({ where: { id } });
  }

  async appendMessage(
    conversationId: string,
    data: Omit<Message, 'id' | 'createdAt'>,
  ): Promise<Message> {
    const msg = await this.prisma.message.create({ data: { ...data, conversationId } });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return msg;
  }

  async historyForClaude(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true, toolCalls: true, toolResults: true },
    });
  }

  async exportMarkdown(clerkId: string, id: string): Promise<string> {
    const conv = await this.getWithMessages(clerkId, id);
    const header = `# ${conv.title}\n\n_Agent: ${conv.agent.name}_  \n_Started: ${conv.createdAt.toISOString()}_\n\n---\n\n`;
    const body = conv.messages
      .map((m) => {
        const who = m.role === 'USER' ? '**You**' : `**${conv.agent.name}**`;
        return `${who}:\n\n${m.content}\n`;
      })
      .join('\n---\n\n');
    return header + body;
  }
}
