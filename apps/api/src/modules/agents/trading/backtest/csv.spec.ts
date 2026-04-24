import { describe, expect, it } from 'vitest';

import { parseOhlcvCsv } from './csv';

describe('parseOhlcvCsv', () => {
  it('parses a normal OHLCV header in any order', () => {
    const csv = `volume,date,close,low,high,open
1000,2024-01-02,12,9,12.5,10
2000,2024-01-03,11,10,13,12`;
    const bars = parseOhlcvCsv(csv);
    expect(bars).toHaveLength(2);
    expect(bars[0]).toMatchObject({ o: 10, h: 12.5, l: 9, c: 12, v: 1000 });
    expect(bars[0]!.t).toBe('2024-01-02T00:00:00.000Z');
  });

  it('accepts unix timestamps (seconds and milliseconds)', () => {
    const csv = `time,open,high,low,close
1704067200,100,110,90,105
1704153600000,105,108,100,107`;
    const bars = parseOhlcvCsv(csv);
    expect(bars[0]!.t.startsWith('2024-01')).toBe(true);
    expect(bars[1]!.t.startsWith('2024-01')).toBe(true);
  });

  it('sorts bars chronologically', () => {
    const csv = `date,open,high,low,close
2024-01-03,2,3,1,2
2024-01-02,1,2,0.5,1.5
2024-01-04,2.5,3.5,2,3`;
    const bars = parseOhlcvCsv(csv);
    expect(bars.map((b) => b.t.slice(0, 10))).toEqual(['2024-01-02', '2024-01-03', '2024-01-04']);
  });

  it('throws when required columns are missing', () => {
    expect(() => parseOhlcvCsv('date,open,high\n2024-01-01,1,2')).toThrow(/must contain/);
  });

  it('throws on a malformed row instead of silently coercing to 0', () => {
    const csv = `date,open,high,low,close
2024-01-02,abc,2,1,1.5`;
    expect(() => parseOhlcvCsv(csv)).toThrow(/Invalid OHLCV row/);
  });

  it('throws when there are no data rows', () => {
    expect(() => parseOhlcvCsv('date,open,high,low,close\n')).toThrow(/no rows/);
  });
});
