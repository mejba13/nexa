import { describe, expect, it } from 'vitest';

import { buildCalendar } from './calendar';

describe('buildCalendar', () => {
  it('rejects invalid dates', () => {
    expect(() =>
      buildCalendar({ startDate: 'nope', weeks: 1, channels: ['x'], themes: ['y'] }),
    ).toThrow(/Invalid startDate/);
  });

  it('rejects out-of-range week counts', () => {
    expect(() =>
      buildCalendar({ startDate: '2024-01-01', weeks: 0, channels: ['x'], themes: ['y'] }),
    ).toThrow();
    expect(() =>
      buildCalendar({ startDate: '2024-01-01', weeks: 27, channels: ['x'], themes: ['y'] }),
    ).toThrow();
  });

  it('requires at least one channel and theme', () => {
    expect(() =>
      buildCalendar({ startDate: '2024-01-01', weeks: 1, channels: [], themes: ['x'] }),
    ).toThrow(/channel/);
    expect(() =>
      buildCalendar({ startDate: '2024-01-01', weeks: 1, channels: ['x'], themes: [] }),
    ).toThrow(/theme/);
  });

  it('produces cadence × channels slots per week, weekday-biased', () => {
    const grid = buildCalendar({
      startDate: '2024-01-01', // Monday
      weeks: 2,
      channels: ['twitter', 'linkedin'],
      themes: ['theme-a', 'theme-b', 'theme-c'],
      cadencePerWeek: 3,
    });
    // 2 weeks × 3 cadence × 2 channels = 12 slots
    expect(grid.slots).toHaveLength(12);
    expect(grid.weeks).toBe(2);

    // All slot dates should be weekdays for cadence ≤ 5.
    const dows = grid.slots.map((s) => new Date(s.date).getUTCDay());
    for (const d of dows) {
      expect([1, 2, 3, 4, 5]).toContain(d);
    }
  });

  it('rotates themes round-robin and labels channels', () => {
    const grid = buildCalendar({
      startDate: '2024-01-01',
      weeks: 1,
      channels: ['twitter'],
      themes: ['a', 'b'],
      cadencePerWeek: 4,
    });
    expect(grid.slots.map((s) => s.theme)).toEqual(['a', 'b', 'a', 'b']);
    expect(grid.slots.every((s) => s.channel === 'twitter')).toBe(true);
    expect(grid.slots.every((s) => s.status === 'draft')).toBe(true);
  });
});
