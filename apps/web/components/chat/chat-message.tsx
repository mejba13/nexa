'use client';

import { Check, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import type { Message, ToolCall } from '@nexa/types';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { MessageContent } from './message-content';
import { ToolCallCard } from './tool-call-card';

interface ChatMessageProps {
  message: Message & { streaming?: boolean; toolCalls?: ToolCall[] | null };
  onRegenerate?: () => void;
  isLast?: boolean;
}

export function ChatMessage({ message, onRegenerate, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'USER';

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn('group flex gap-4 px-6 py-5', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex max-w-3xl flex-col gap-2 rounded-2xl px-4 py-3',
          isUser
            ? 'bg-brand-primary/10 text-brand-text ring-brand-primary/30 ring-1'
            : 'bg-brand-elevated text-brand-text ring-brand-border/60 ring-1',
        )}
      >
        {message.toolCalls?.map((c) => (
          <ToolCallCard key={c.id} call={c} />
        ))}
        <MessageContent content={message.content || (message.streaming ? '…' : '')} />
        {!isUser && !message.streaming && (
          <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            {isLast && onRegenerate && (
              <Button size="sm" variant="ghost" onClick={onRegenerate}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
