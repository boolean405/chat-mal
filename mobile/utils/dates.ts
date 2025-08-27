import {
  format,
  parseISO,
  startOfDay,
  differenceInCalendarDays,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isYesterday,
  isTomorrow,
  isToday,
} from "date-fns";

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

export function formatRelativeBadge(target: Date | string): string {
  const date = new Date(target);

  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isYesterday(date)) return "Yesterday";

  // Signed differences (positive = future, negative = past)
  const days = differenceInDays(date, new Date());
  const weeks = differenceInWeeks(date, new Date());
  const months = differenceInMonths(date, new Date());
  const years = differenceInYears(date, new Date());

  // Years take priority if non-zero
  if (Math.abs(years) >= 1) {
    const unit = years === 1 ? "year" : "years";
    return years > 0 ? `In ${years} ${unit}` : `${Math.abs(years)} ${unit} ago`;
  }

  if (Math.abs(months) >= 1) {
    const unit = Math.abs(months) === 1 ? "month" : "months";
    return months > 0
      ? `In ${months} ${unit}`
      : `${Math.abs(months)} ${unit} ago`;
  }

  if (Math.abs(weeks) >= 1) {
    const unit = Math.abs(weeks) === 1 ? "week" : "weeks";
    return weeks > 0 ? `In ${weeks} ${unit}` : `${Math.abs(weeks)} ${unit} ago`;
  }

  // Fall back to days
  const unit = Math.abs(days) === 1 ? "day" : "days";
  return days > 0 ? `In ${days} ${unit}` : `${Math.abs(days)} ${unit} ago`;
}
