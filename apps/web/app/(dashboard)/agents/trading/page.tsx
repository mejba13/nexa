'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { StrategyList } from '@/components/trading/strategy-list';
import { BacktestSummary } from '@/components/trading/backtest-summary';
import { Button } from '@/components/ui/button';
import { tradingApi } from '@/lib/trading';
import type { BacktestResult } from '@/lib/trading-types';

/**
 * Trading Analyst workspace. Three-pane layout on desktop:
 *   ┌──────────────┬──────────────────────────────┐
 *   │ Strategies   │ Backtest summary (charts)    │
 *   │ + Data       │                              │
 *   └──────────────┴──────────────────────────────┘
 * On mobile, everything stacks.
 */
export default function TradingWorkspace() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const qc = useQueryClient();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | undefined>();
  const [initialCapital, setInitialCapital] = useState(10_000);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load last backtest for this user on mount so the dashboard isn't empty.
  useEffect(() => {
    void (async () => {
      const token = await getToken();
      if (!token) return;
      const rows = await tradingApi.listBacktests(token);
      if (rows[0]) setResult(rows[0].results);
    })();
  }, [getToken]);

  const run = useMutation({
    mutationFn: async () => {
      if (!selectedStrategyId) throw new Error('Pick a strategy first');
      if (!csvFile) throw new Error('Upload an OHLCV CSV');
      const token = await getToken();
      if (!token) throw new Error('No token');
      const csv = await csvFile.text();
      return tradingApi.runBacktest(token, {
        strategyId: selectedStrategyId,
        initialCapital,
        csv,
      });
    },
    onSuccess: (payload) => {
      setResult(payload.result);
      qc.invalidateQueries({ queryKey: ['trading'] });
    },
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="border-brand-border/60 border-b px-8 py-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="bg-brand-elevated text-brand-primary inline-flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs">
            TR
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold">Trading Analyst</h1>
            <p className="text-brand-muted text-sm">
              Autonomous quant partner — backtests are deterministic; the agent only narrates them.
            </p>
          </div>
          <div className="text-brand-muted text-right text-xs">
            {user?.firstName && <span>Signed in as {user.firstName}</span>}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="border-brand-border/60 w-80 shrink-0 overflow-y-auto border-r p-6">
          <section>
            <h2 className="font-display mb-3 text-sm font-semibold">Strategies</h2>
            <StrategyList onSelect={setSelectedStrategyId} selectedId={selectedStrategyId} />
          </section>

          <section className="mt-8">
            <h2 className="font-display mb-3 text-sm font-semibold">Backtest runner</h2>
            <label className="text-brand-muted block text-xs">Initial capital (USD)</label>
            <input
              type="number"
              min={100}
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="border-brand-border bg-brand-bg text-brand-text focus:border-brand-primary mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none"
            />

            <label className="text-brand-muted mt-4 block text-xs">Market data (OHLCV CSV)</label>
            <div className="mt-1 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-3.5 w-3.5" />
                {csvFile ? csvFile.name : 'Choose file'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => run.mutate()}
              disabled={run.isPending || !selectedStrategyId || !csvFile}
            >
              <Play className="h-3.5 w-3.5" />
              {run.isPending ? 'Running…' : 'Run backtest'}
            </Button>
            {run.isError && (
              <p className="text-brand-danger mt-2 text-xs">{(run.error as Error).message}</p>
            )}
          </section>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {result ? (
            <BacktestSummary result={result} />
          ) : (
            <div className="border-brand-border text-brand-muted flex h-full items-center justify-center rounded-2xl border border-dashed p-10 text-center">
              <div>
                <p className="text-brand-text text-lg">No backtests yet.</p>
                <p className="mt-1 text-sm">
                  Pick a strategy, upload an OHLCV CSV, and hit Run — or open the chat panel and ask
                  the agent to do it for you.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
