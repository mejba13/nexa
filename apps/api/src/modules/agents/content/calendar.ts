/**
 * Deterministic content calendar grid builder.
 * Claude fills each slot's title + copy in subsequent turns — this tool only
 * owns the schedule and theme rotation, never the creative.
 */

export interface CalendarSlot {
  slotId: string;
  date: string; // YYYY-MM-DD
  channel: string;
  theme: string;
  title?: string;
  status: 'draft' | 'scheduled';
}

export interface CalendarGrid {
  startDate: string;
  endDate: string;
  weeks: number;
  channels: string[];
  themes: string[];
  slots: CalendarSlot[];
}

export interface BuildCalendarInput {
  startDate: string;
  weeks: number;
  channels: string[];
  themes: string[];
  /** Post frequency per channel per week. Default 3. */
  cadencePerWeek?: number;
}

export function buildCalendar(input: BuildCalendarInput): CalendarGrid {
  const start = new Date(input.startDate);
  if (Number.isNaN(start.getTime())) throw new Error(`Invalid startDate: ${input.startDate}`);
  if (input.weeks < 1 || input.weeks > 26) throw new Error('weeks must be 1..26');
  if (input.channels.length === 0) throw new Error('at least one channel required');
  if (input.themes.length === 0) throw new Error('at least one theme required');

  const cadence = Math.min(Math.max(input.cadencePerWeek ?? 3, 1), 7);
  const days = input.weeks * 7;
  const slots: CalendarSlot[] = [];

  let themeCursor = 0;
  for (let d = 0; d < days; d++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + d);
    const dow = date.getUTCDay();
    // Spread cadence evenly: pick the first `cadence` weekdays starting Monday.
    const postingDays = pickPostingDays(cadence);
    if (!postingDays.has(dow)) continue;

    for (const channel of input.channels) {
      const theme = input.themes[themeCursor % input.themes.length];
      themeCursor++;
      slots.push({
        slotId: `${date.toISOString().slice(0, 10)}-${channel}`,
        date: date.toISOString().slice(0, 10),
        channel,
        theme,
        status: 'draft',
      });
    }
  }

  const lastDate = new Date(start);
  lastDate.setUTCDate(start.getUTCDate() + days - 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: lastDate.toISOString().slice(0, 10),
    weeks: input.weeks,
    channels: input.channels,
    themes: input.themes,
    slots,
  };
}

/** Pick N weekdays, biased toward Mon/Tue/Wed/Thu/Fri for cadence ≤5. */
function pickPostingDays(cadence: number): Set<number> {
  const weekdayOrder = [1, 3, 5, 2, 4, 6, 0]; // Mon, Wed, Fri, Tue, Thu, Sat, Sun
  return new Set(weekdayOrder.slice(0, cadence));
}
