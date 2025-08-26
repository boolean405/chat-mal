import {
  format,
  parseISO,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";

/** Parse string | Date into a real Date, tolerant to MongoDB ISO strings */
export function parseDateSafe(input: string | Date): Date {
  if (input instanceof Date) return input;
  // MongoDB often stores ISO like "2025-08-05T00:00:00.000Z"
  // Use parseISO and normalize to local start-of-day to avoid off-by-one rendering
  return startOfDay(parseISO(input));
}

export function formatEventDateParts(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return {
    date: format(d, "dd MMM yyyy"), // 26 Aug 2025
    time: format(d, "hh:mm a"), // 12:00 AM
  };
}

export function daysUntil(d: string | Date): number {
  const target = parseDateSafe(d);
  const today = startOfDay(new Date());
  return differenceInCalendarDays(target, today);
}

export const toDate = (v: unknown): Date => {
  if (v instanceof Date) return v;
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? new Date() : d;
};
