'use client';

import { ArrowUp, Square } from 'lucide-react';
import { useRef, useState, type KeyboardEvent } from 'react';

import { Button } from '@/components/ui/button';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onCancel?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  onCancel,
  isStreaming,
  disabled,
  placeholder = 'Ask anything…',
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    ref.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-brand-border/60 bg-brand-bg/80 sticky bottom-0 border-t px-6 py-4 backdrop-blur">
      <div className="border-brand-border bg-brand-elevated focus-within:border-brand-primary/60 mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border p-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="text-brand-text placeholder:text-brand-muted max-h-48 flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
        {isStreaming ? (
          <Button size="icon" variant="secondary" onClick={onCancel} aria-label="Stop">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={submit}
            disabled={disabled || !value.trim()}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
