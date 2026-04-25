'use client';

import { useNexaAuth } from '@/lib/hooks/use-nexa-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { tradingApi } from '@/lib/trading';

interface StrategyListProps {
  onSelect?: (strategyId: string) => void;
  selectedId?: string;
}

export function StrategyList({ onSelect, selectedId }: StrategyListProps) {
  const { getToken } = useNexaAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['trading', 'strategies'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return tradingApi.listStrategies(token);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('No token');
      return tradingApi.deleteStrategy(token, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trading', 'strategies'] }),
  });

  if (isLoading) {
    return <div className="text-brand-muted text-sm">Loading strategies…</div>;
  }

  if (!data?.length) {
    return (
      <div className="border-brand-border text-brand-muted rounded-xl border border-dashed p-6 text-center text-sm">
        No strategies yet. Ask the agent to upload one, or create one via the API.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {data.map((s) => {
        const isSelected = s.id === selectedId;
        return (
          <li
            key={s.id}
            className={
              'group flex items-center gap-2 rounded-lg border px-3 py-2 transition ' +
              (isSelected
                ? 'border-brand-primary/60 bg-brand-primary/5'
                : 'border-brand-border bg-brand-elevated hover:border-brand-primary/30')
            }
          >
            <button
              type="button"
              onClick={() => onSelect?.(s.id)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="text-brand-text truncate text-sm font-medium">{s.name}</div>
              <div className="text-brand-muted truncate text-xs">{s.description}</div>
            </button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete"
              onClick={() => del.mutate(s.id)}
              className="opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 className="text-brand-danger h-3.5 w-3.5" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
