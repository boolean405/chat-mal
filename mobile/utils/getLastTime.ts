import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from "date-fns";

export default function getLastTime(date: Date) {
  const now = new Date();

  const minutes = differenceInMinutes(now, date);
  if (minutes < 60) return `${minutes}m`;

  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours}h`;

  const days = differenceInDays(now, date);
  if (days < 7) return `${days}d`;

  const weeks = differenceInWeeks(now, date);
  if (weeks < 4) return `${weeks}w`;

  const months = differenceInMonths(now, date);
  if (months < 12) return `${months}mo`;

  const years = differenceInYears(now, date);
  return `${years}y`;
}
