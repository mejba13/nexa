'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface EmptyChatStateProps {
  Icon: LucideIcon;
  code: string;
  title: string;
  description: React.ReactNode;
  /** Optional one-liner ("Tools available", "Provider locked", etc.) */
  availability?: string;
  prompts: ReadonlyArray<string>;
  /** Hook into the composer; when supplied, clicking a prompt fills the input.
   *  When omitted (e.g. server-rendered shell), prompts are decorative + show
   *  the user what's possible. */
  onPickPrompt?: (text: string) => void;
}

/**
 * Editorial empty state for the agent chat surfaces. Concentric ringed
 * agent mark + display headline + serif lead-in + a 2x2 bento of starter
 * prompts that read like editorial cards rather than tag chips.
 */
export function EmptyChatState({
  Icon,
  code,
  title,
  description,
  availability,
  prompts,
  onPickPrompt,
}: EmptyChatStateProps) {
  return (
    <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-8 py-12">
      {/* Concentric mark */}
      <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
        <span className="border-brand-primary/15 absolute inset-0 rounded-full border" />
        <span className="border-brand-primary/25 absolute inset-3 rounded-full border" />
        <span className="bg-brand-primary/15 ring-brand-primary/30 relative inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1">
          <span className="bg-brand-primary/30 absolute inset-0 animate-ping rounded-2xl opacity-40" />
          <Icon className="text-brand-primary relative h-6 w-6" />
        </span>
      </div>

      {/* Headline */}
      <div className="mx-auto max-w-xl text-center">
        <div className="editorial-marker mb-3 justify-center">
          <span className="text-brand-primary">§ {code}</span>
          <span className="bg-brand-border-strong h-px w-8" />
          <span>Workspace</span>
        </div>
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
          {title}
        </h2>
        <p className="text-brand-muted-strong mt-3 font-serif text-base italic leading-snug lg:text-lg">
          {description}
        </p>
        {availability && (
          <div className="border-brand-border/60 bg-brand-surface/60 mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur">
            <Sparkles className="text-brand-primary h-2.5 w-2.5" />
            <span className="tracking-editorial-wide text-brand-muted-strong font-mono text-[10px] uppercase">
              {availability}
            </span>
          </div>
        )}
      </div>

      {/* Hairline */}
      <div className="bg-brand-border-strong/60 mx-auto my-10 h-px w-32" />

      {/* Prompts bento */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="tracking-editorial-wide text-brand-muted/70 font-mono text-[10px] uppercase">
            Try one of these
          </span>
          <span className="tracking-editorial-wide text-brand-muted/40 font-mono text-[10px] uppercase tabular-nums">
            {String(prompts.length).padStart(2, '0')} starters
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {prompts.map((prompt, i) => (
            <PromptCard
              key={prompt}
              n={String(i + 1).padStart(2, '0')}
              prompt={prompt}
              onClick={onPickPrompt ? () => onPickPrompt(prompt) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PromptCard({ n, prompt, onClick }: { n: string; prompt: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="border-brand-border/60 bg-brand-surface/40 hover:border-brand-primary/40 hover:bg-brand-elevated/70 group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all"
    >
      <div className="bg-orange-glow absolute -right-20 -top-20 h-40 w-40 opacity-0 transition-opacity duration-500 group-hover:opacity-50" />
      <span className="bg-brand-elevated text-brand-primary ring-hairline tracking-editorial-wide relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] tabular-nums">
        {n}
      </span>
      <p className="text-brand-muted-strong group-hover:text-brand-text relative flex-1 font-serif text-sm italic leading-snug transition-colors">
        {prompt}
      </p>
      {onClick && (
        <ArrowRight className="text-brand-muted/40 group-hover:text-brand-primary relative mt-1 h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
      )}
    </Tag>
  );
}
