// utils/events.ts
import { isAfter, isSameDay, startOfToday } from "date-fns";

/** true if date is today or later */
export function isFutureOrToday(date: Date) {
  const today = startOfToday();
  return isSameDay(date, today) || isAfter(date, today);
}
