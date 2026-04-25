'use client';

import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

import type { AgentType } from '@nexa/types';

import { Button } from '@/components/ui/button';
import { documentsApi, type DocumentRow } from '@/lib/documents';
import { cn } from '@/lib/utils';

interface KnowledgeBasePanelProps {
  agentType: AgentType;
  title?: string;
  description?: string;
  emptyHint?: string;
  accept?: string;
}

const STATUS_STYLES: Record<DocumentRow['status'], string> = {
  PROCESSING: 'text-brand-accent',
  INDEXED: 'text-brand-success',
  FAILED: 'text-brand-danger',
};

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

  return (
    <div>
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold">{title}</h2>
          {description && <p className="text-brand-muted text-xs">{description}</p>}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInput.current?.click()}
          disabled={upload.isPending}
        >
          <Upload className="h-3.5 w-3.5" />
          {upload.isPending ? 'Uploading…' : 'Upload'}
        </Button>
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
      </header>

      {upload.isError && (
        <p className="text-brand-danger mb-2 text-xs">{(upload.error as Error).message}</p>
      )}

      {isLoading ? (
        <p className="text-brand-muted text-sm">Loading…</p>
      ) : !data?.length ? (
        <div className="border-brand-border text-brand-muted rounded-xl border border-dashed p-6 text-center text-xs">
          {emptyHint}
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((d) => (
            <li
              key={d.id}
              className="border-brand-border bg-brand-elevated group flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <FileText className="text-brand-muted h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-brand-text truncate text-xs">{d.filename}</div>
                <div className="text-brand-muted flex items-center gap-2 text-[10px]">
                  <span className={cn('uppercase tracking-wider', STATUS_STYLES[d.status])}>
                    {d.status}
                  </span>
                  <span>{(d.fileSize / 1024).toFixed(0)} KB</span>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Delete"
                onClick={() => remove.mutate(d.id)}
                className="opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="text-brand-danger h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
