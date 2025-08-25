// utils/since.ts
import {
  differenceInCalendarDays,
  intervalToDuration,
  startOfDay,
} from "date-fns";

/** Parse "YYYY-MM-DD" as a LOCAL date at local midnight. */
export function localFromISO(iso: string): Date {
  const [yy, mm, dd] = iso.split("-").map(Number);
  // Months are 0-based in JS Dates; this constructs local time midnight.
  return new Date(yy, (mm ?? 1) - 1, dd ?? 1, 0, 0, 0, 0);
}

/** Today at local midnight. */
export function localTodayStart(): Date {
  return startOfDay(new Date());
}

/** Total days since start ISO (local calendar days). */
export function totalDaysSinceISO(startISO: string): number {
  const start = localFromISO(startISO);
  const end = localTodayStart();
  // Guard future dates → 0
  return Math.max(0, differenceInCalendarDays(end, start));
}

/** Humanized top-two units: years → months → weeks → days (local). */
export function humanizeSinceISO(startISO: string, maxUnits = 2): string {
  const start = localFromISO(startISO);
  const end = localTodayStart();

  const dur = intervalToDuration({ start, end });
  let { years = 0, months = 0, days = 0 } = dur;

  const weeks = Math.floor((days ?? 0) / 7);
  days = (days ?? 0) % 7;

  const parts: string[] = [];
  const push = (n: number, unit: string) => {
    if (n > 0 && parts.length < maxUnits)
      parts.push(`${n} ${unit}${n === 1 ? "" : "s"}`);
  };

  push(years, "year");
  push(months, "month");
  if (parts.length < maxUnits) push(weeks, "week");
  if (parts.length < maxUnits) push(days, "day");

  return parts.length ? parts.join(" ") : "0 day";
}

/** Get today's date string in local calendar "YYYY-MM-DD". */
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
