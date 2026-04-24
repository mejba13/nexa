'use client';

import { ChevronDown, Wrench } from 'lucide-react';
import { useState } from 'react';

import type { ToolCall } from '@nexa/types';

import { cn } from '@/lib/utils';

export function ToolCallCard({ call }: { call: ToolCall }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-brand-border bg-brand-surface my-2 overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-brand-muted hover:bg-brand-elevated flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition"
      >
        <Wrench className="text-brand-primary h-3.5 w-3.5" />
        <span className="font-mono">{call.name}</span>
        <ChevronDown
          className={cn('ml-auto h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <pre className="border-brand-border text-brand-text overflow-x-auto border-t px-3 py-2 text-[11px]">
          {JSON.stringify(call.input, null, 2)}
        </pre>
      )}
    </div>
  );
}
