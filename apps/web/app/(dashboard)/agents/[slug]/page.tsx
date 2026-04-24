import { notFound } from 'next/navigation';

import { AGENT_SLUG_TO_TYPE, AGENT_METADATA } from '@nexa/types';

interface Props {
  params: { slug: string };
}

export default function AgentPage({ params }: Props) {
  const agentType = AGENT_SLUG_TO_TYPE[params.slug];
  if (!agentType) notFound();
  const meta = AGENT_METADATA[agentType];

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <header className="flex items-center gap-4">
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-elevated"
          style={{ color: meta.accentColor }}
        >
          <span className="font-mono text-xs uppercase">{agentType.slice(0, 2)}</span>
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold capitalize">
            {params.slug.replace('-', ' ')}
          </h1>
          <p className="text-brand-muted">{meta.tagline}</p>
        </div>
      </header>
      <section className="mt-10 rounded-2xl border border-dashed border-brand-border p-10 text-center">
        <p className="text-sm text-brand-muted">
          Chat UI lands in Phase 2 (F-005). This workspace is reserved.
        </p>
      </section>
    </div>
  );
}
