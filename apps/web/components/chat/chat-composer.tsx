'use client';

import { ArrowUp, Paperclip, Square, Zap } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { cn } from '@/lib/utils';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onCancel?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_CHARS = 8_000;

export function ChatComposer({
  onSend,
  onCancel,
  isStreaming,
  disabled,
  placeholder = 'Ask anything…',
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~8 lines.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    const max = 200;
    el.style.height = `${Math.min(max, el.scrollHeight)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    requestAnimationFrame(() => ref.current?.focus());
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const isEmpty = value.trim().length === 0;
  const overLimit = value.length > MAX_CHARS;

  return (
    <div className="border-brand-border/60 bg-brand-bg/85 sticky bottom-0 border-t backdrop-blur-xl">
      {/* Top fade */}
      <div className="from-brand-bg/0 pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t to-transparent" />

      <div className="mx-auto max-w-4xl px-6 pb-6 pt-4">
        <div
          className={cn(
            'border-brand-border/80 bg-brand-surface/60 ring-hairline group relative flex flex-col rounded-2xl border shadow-[0_8px_32px_-12px_rgba(255,145,0,0.08)] transition-all',
            'focus-within:border-brand-primary/40 focus-within:ring-brand-primary/20 focus-within:ring-2',
            overLimit && 'border-brand-danger/60 focus-within:border-brand-danger/80',
          )}
        >
          {/* Composer body */}
          <div className="flex items-end gap-2 px-4 pt-3.5">
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="text-brand-text placeholder:text-brand-muted/60 max-h-[200px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Attach (coming in v2)"
                disabled
                className="text-brand-muted/40 hover:text-brand-muted hover:bg-brand-elevated/50 inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
              <span className="tracking-editorial-wide text-brand-muted/50 hidden font-mono text-[10px] uppercase md:inline">
                <span className="text-brand-primary/80">⏎</span> send ·{' '}
                <span className="text-brand-primary/80">⇧⏎</span> newline
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'tracking-editorial-wide font-mono text-[10px] uppercase tabular-nums',
                  overLimit
                    ? 'text-brand-danger'
                    : value.length > MAX_CHARS * 0.9
                      ? 'text-brand-primary'
                      : 'text-brand-muted/50',
                )}
              >
                {value.length}/{MAX_CHARS}
              </span>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label="Stop generating"
                  className="bg-brand-elevated text-brand-text hover:bg-brand-bg ring-hairline-strong inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <Square className="h-3 w-3" />
                  <span className="hidden md:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={disabled || isEmpty || overLimit}
                  aria-label="Send message"
                  className={cn(
                    'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-all',
                    isEmpty
                      ? 'bg-brand-elevated text-brand-muted/60 cursor-not-allowed'
                      : 'bg-brand-primary text-brand-bg hover:bg-brand-accent shadow-[0_0_24px_-6px_rgba(255,145,0,0.6)]',
                  )}
                >
                  <span className="hidden md:inline">Send</span>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="border-brand-border/40 bg-brand-surface/80 absolute -top-7 left-4 flex items-center gap-2 rounded-t-lg border border-b-0 px-3 py-1 backdrop-blur">
              <Zap className="text-brand-primary h-3 w-3 animate-pulse" />
              <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
                Streaming · token-by-token
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
