import type { Bar } from './types';

/**
 * Tiny OHLCV CSV parser. Accepts the common header layout:
 *   date,open,high,low,close,volume
 * Also tolerates `time`/`timestamp` as the first column.
 * Fails loud on malformed rows so bad input never silently produces bad metrics.
 */
export function parseOhlcvCsv(input: string): Bar[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) throw new Error('CSV has no rows');

  const header = lines[0]
    .toLowerCase()
    .split(',')
    .map((h) => h.trim());
  const tIdx = header.findIndex((h) => ['date', 'time', 'timestamp'].includes(h));
  const oIdx = header.indexOf('open');
  const hIdx = header.indexOf('high');
  const lIdx = header.indexOf('low');
  const cIdx = header.indexOf('close');
  const vIdx = header.indexOf('volume');

  if ([tIdx, oIdx, hIdx, lIdx, cIdx].some((i) => i < 0)) {
    throw new Error('CSV must contain date/time, open, high, low, close columns');
  }

  const bars: Bar[] = [];
  for (let row = 1; row < lines.length; row++) {
    const cols = lines[row].split(',').map((c) => c.trim());
    const t = cols[tIdx];
    const o = Number(cols[oIdx]);
    const h = Number(cols[hIdx]);
    const l = Number(cols[lIdx]);
    const c = Number(cols[cIdx]);
    const v = vIdx >= 0 ? Number(cols[vIdx]) : 0;

    if (!t || [o, h, l, c].some((n) => !Number.isFinite(n))) {
      throw new Error(`Invalid OHLCV row ${row + 1}: ${lines[row]}`);
    }

    const iso = normalizeDate(t);
    bars.push({ t: iso, o, h, l, c, v: Number.isFinite(v) ? v : 0 });
  }

  bars.sort((a, b) => a.t.localeCompare(b.t));
  return bars;
}

function normalizeDate(raw: string): string {
  // Accept YYYY-MM-DD, ISO, unix seconds, unix millis.
  if (/^\d{10,13}$/.test(raw)) {
    const n = Number(raw);
    const ms = raw.length === 10 ? n * 1000 : n;
    return new Date(ms).toISOString();
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error(`Unparseable date: ${raw}`);
  return d.toISOString();
}
