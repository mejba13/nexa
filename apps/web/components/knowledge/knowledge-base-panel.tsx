'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  CircleAlert,
  FileSpreadsheet,
  FileText,
  FileType2,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';

import type { AgentType } from '@nexa/types';

import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { documentsApi, type DocumentRow } from '@/lib/documents';
import { cn } from '@/lib/utils';

interface KnowledgeBasePanelProps {
  agentType: AgentType;
  title?: string;
  description?: string;
  emptyHint?: string;
  accept?: string;
}

const STATUS_META: Record<
  DocumentRow['status'],
  { label: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  PROCESSING: {
    label: 'Indexing',
    tone: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Icon: Loader2,
  },
  INDEXED: {
    label: 'Indexed',
    tone: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    Icon: CheckCircle2,
  },
  FAILED: {
    label: 'Failed',
    tone: 'text-brand-primary bg-brand-primary/10 border-brand-primary/30',
    Icon: CircleAlert,
  },
};

function fileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return FileSpreadsheet;
  if (ext === 'pdf' || ext === 'docx' || ext === 'doc') return FileType2;
  return FileText;
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 ** 2).toFixed(1)} MB`;
}

export function KnowledgeBasePanel({
  agentType,
  title = 'Knowledge base',
  description,
  emptyHint = 'Upload documents to train the agent.',
  accept = '.pdf,.docx,.txt,.md,.csv',
}: KnowledgeBasePanelProps) {
  const { getToken } = useNexaAuth();
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', agentType],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return documentsApi.list(token, agentType);
    },
    refetchInterval: (q) => (q.state.data?.some((d) => d.status === 'PROCESSING') ? 3_000 : false),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return documentsApi.upload(token, agentType, file);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', agentType] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return documentsApi.remove(token, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', agentType] }),
  });

  const totalBytes = data?.reduce((s, d) => s + d.fileSize, 0) ?? 0;
  const indexedCount = data?.filter((d) => d.status === 'INDEXED').length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header>
        <div className="editorial-marker mb-2">
          <span className="text-brand-primary">§ KB</span>
          <span>RAG-grounded</span>
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-brand-muted-strong mt-1.5 text-xs leading-relaxed">{description}</p>
        )}
      </header>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) upload.mutate(f);
        }}
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-all',
          dragOver
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-brand-border/60 bg-brand-bg/40 hover:border-brand-primary/40 hover:bg-brand-elevated/30',
        )}
        onClick={() => fileInput.current?.click()}
      >
        <div className="bg-orange-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-40" />
        <div className="bg-brand-elevated ring-hairline relative mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl">
          {upload.isPending ? (
            <Loader2 className="text-brand-primary h-4 w-4 animate-spin" />
          ) : (
            <Upload className="text-brand-primary h-4 w-4" />
          )}
        </div>
        <p className="text-brand-text font-display relative text-sm font-semibold">
          {upload.isPending ? 'Uploading…' : 'Drop a file or click to upload'}
        </p>
        <p className="text-brand-muted-strong relative mt-1 text-[11px]">
          PDF · DOCX · MD · TXT · CSV
        </p>
        <input
          ref={fileInput}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload.mutate(f);
            e.target.value = '';
          }}
        />
      </div>

      {upload.isError && (
        <div className="border-brand-primary/30 bg-brand-primary/10 text-brand-primary rounded-lg border px-3 py-2 text-xs">
          {(upload.error as Error).message}
        </div>
      )}

      {/* File list */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="tracking-editorial-wide text-brand-muted/70 font-mono text-[10px] uppercase">
            Indexed
          </span>
          <span className="tracking-editorial-wide text-brand-muted/40 font-mono text-[10px] uppercase tabular-nums">
            {String(indexedCount).padStart(2, '0')} · {formatBytes(totalBytes)}
          </span>
        </div>

        {isLoading ? (
          <div className="text-brand-muted py-4 text-center text-xs">
            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
          </div>
        ) : !data?.length ? (
          <div className="border-brand-border/60 text-brand-muted-strong rounded-2xl border border-dashed p-5 text-center font-serif text-xs italic">
            {emptyHint}
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((d) => {
              const Icon = fileIcon(d.filename);
              const meta = STATUS_META[d.status];
              return (
                <li
                  key={d.id}
                  className="border-brand-border/60 bg-brand-bg/40 hover:border-brand-primary/30 hover:bg-brand-elevated/40 group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all"
                >
                  <div className="bg-brand-elevated ring-hairline inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="text-brand-primary h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-brand-text truncate text-xs font-medium">{d.filename}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          'tracking-editorial-wide inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[8px] uppercase',
                          meta.tone,
                        )}
                      >
                        <meta.Icon
                          className={cn('h-2 w-2', d.status === 'PROCESSING' && 'animate-spin')}
                        />
                        {meta.label}
                      </span>
                      <span className="text-brand-muted/60 font-mono text-[10px] tabular-nums">
                        {formatBytes(d.fileSize)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete document"
                    onClick={() => remove.mutate(d.id)}
                    disabled={remove.isPending}
                    className="text-brand-muted/40 hover:text-brand-primary inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-0 transition-all group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
