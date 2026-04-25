'use client';

import { Check, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { Message, ToolCall } from '@nexa/types';

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
    <div
      className={cn(
        'group mx-auto flex w-full max-w-3xl gap-4 px-6 py-5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar — agent side gets a branded mark, user side stays minimal */}
      <div className="shrink-0 pt-1">
        {isUser ? (
          <div className="bg-brand-elevated ring-hairline text-brand-muted-strong inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] uppercase">
            You
          </div>
        ) : (
          <div className="bg-brand-elevated ring-hairline-strong relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full">
            <div className="bg-orange-glow absolute inset-0 opacity-70" />
            <Sparkles className="text-brand-primary relative h-3.5 w-3.5" />
          </div>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col gap-2', isUser && 'items-end')}>
        {/* Role label */}
        <div
          className={cn(
            'tracking-editorial-wide text-brand-muted/60 font-mono text-[10px] uppercase',
            isUser && 'text-right',
          )}
        >
          {isUser ? 'You' : 'Assistant'}
          {message.streaming && (
            <span className="text-brand-primary ml-2 inline-flex items-center gap-1">
              <span className="bg-brand-primary inline-block h-1 w-1 animate-pulse rounded-full" />
              streaming
            </span>
          )}
        </div>

        {/* Tool calls — surface above the message text */}
        {message.toolCalls?.map((c) => (
          <ToolCallCard key={c.id} call={c} />
        ))}

        {/* Bubble */}
        <div
          className={cn(
            'relative inline-block max-w-full rounded-2xl px-4 py-3',
            isUser
              ? 'bg-brand-primary/10 text-brand-text border-brand-primary/30 border'
              : 'bg-brand-surface/60 text-brand-text border-brand-border/60 ring-hairline border backdrop-blur',
          )}
        >
          <MessageContent content={message.content || (message.streaming ? '…' : '')} />
        </div>

        {/* Hover toolbar — assistant only */}
        {!isUser && !message.streaming && message.content && (
          <div className="-mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <ToolbarButton onClick={copy} label={copied ? 'Copied' : 'Copy'}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </ToolbarButton>
            {isLast && onRegenerate && (
              <ToolbarButton onClick={onRegenerate} label="Regenerate">
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </ToolbarButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-brand-muted hover:text-brand-text hover:bg-brand-elevated/60 tracking-editorial-wide inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase transition-colors"
    >
      {children}
    </button>
  );
}
