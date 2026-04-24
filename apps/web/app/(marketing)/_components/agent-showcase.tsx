import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

interface AgentShowcaseProps {
  agent: {
    slug: string;
    label: string;
    eyebrow: string;
    oneliner: string;
    example: { user: string; agent: string; tool: string };
    Icon: LucideIcon;
  };
  index: number;
}

/**
 * One agent per row, alternating copy/example across columns so the page
 * reads like a long-form editorial spread rather than a repeating card grid.
 */
export function AgentShowcase({ agent, index }: AgentShowcaseProps) {
  const reverse = index % 2 === 1;
  const { Icon } = agent;

  return (
    <article className="group grid grid-cols-12 items-start gap-6">
      {/* Number column */}
      <div className="col-span-12 md:col-span-2 md:col-start-1">
        <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-1">
          <span className="font-display text-brand-primary text-6xl font-bold leading-none md:text-7xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
            {agent.eyebrow}
          </span>
        </div>
      </div>

      {/* Copy column */}
      <div
        className={`col-span-12 md:col-span-5 ${reverse ? 'md:col-start-8 md:row-start-1' : 'md:col-start-3'}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="text-brand-primary h-5 w-5" />
          <h3 className="font-display text-3xl font-bold md:text-4xl">{agent.label}</h3>
        </div>
        <p className="text-brand-muted-strong mt-4 text-lg leading-relaxed">{agent.oneliner}</p>

        <Link
          href={`/agents/${agent.slug}`}
          className="tracking-editorial-wide text-brand-text link-underline hover:text-brand-primary mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase"
        >
          Open {agent.label.toLowerCase()} workspace
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Sample dialog column */}
      <div
        className={`col-span-12 md:col-span-5 ${reverse ? 'md:col-start-3 md:row-start-1' : 'md:col-start-8'}`}
      >
        <div className="border-brand-border bg-brand-surface/80 group-hover:border-brand-primary/30 relative overflow-hidden rounded-2xl border p-6 transition-colors">
          {/* Corner tick */}
          <div className="absolute right-0 top-0 h-12 w-12 overflow-hidden">
            <div className="bg-brand-primary/20 absolute right-[-24px] top-[-24px] h-12 w-12 rotate-45" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="bg-brand-danger/60 h-1.5 w-1.5 rounded-full" />
              <span className="bg-brand-warning/60 h-1.5 w-1.5 rounded-full" />
              <span className="bg-brand-success/60 h-1.5 w-1.5 rounded-full" />
            </div>
            <span className="tracking-editorial-wide text-brand-muted font-mono text-[10px] uppercase">
              sample session
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="eyebrow text-brand-muted mb-1.5">You</div>
              <div className="text-brand-text font-mono text-xs leading-relaxed md:text-[13px]">
                {agent.example.user}
              </div>
            </div>

            <div className="border-brand-primary/20 bg-brand-primary/5 rounded-lg border p-3">
              <div className="tracking-editorial-wide text-brand-primary flex items-center gap-2 text-[10px] uppercase">
                <span>↳ tool</span>
                <span className="text-brand-muted-strong font-mono normal-case tracking-normal">
                  {agent.example.tool}
                </span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-1.5">{agent.label}</div>
              <div className="text-brand-text font-mono text-xs leading-relaxed md:text-[13px]">
                {agent.example.agent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
