'use client';

import { useEffect, useRef } from 'react';

import type { Message } from '@nexa/types';

import { useChat } from '@/lib/hooks/use-chat';

import { ChatComposer } from './chat-composer';
import { ChatMessage } from './chat-message';

interface ChatPanelProps {
  conversationId: string;
  initialMessages?: Message[];
  emptyState?: React.ReactNode;
}

export function ChatPanel({ conversationId, initialMessages, emptyState }: ChatPanelProps) {
  const { messages, isStreaming, error, send, cancel, regenerate } = useChat({
    conversationId,
    initialMessages,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-brand-muted flex h-full items-center justify-center p-10 text-center">
            {emptyState ?? 'Start the conversation.'}
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage
            key={m.id}
            message={m}
            isLast={i === messages.length - 1}
            onRegenerate={regenerate}
          />
        ))}
        {error && (
          <div className="border-brand-danger/40 bg-brand-danger/10 text-brand-danger mx-6 my-3 rounded-lg border px-4 py-2 text-sm">
            {error}
          </div>
        )}
      </div>
      <ChatComposer onSend={send} onCancel={cancel} isStreaming={isStreaming} />
    </div>
  );
}
