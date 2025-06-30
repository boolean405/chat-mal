import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  isThisYear,
} from "date-fns";

export default function formatDate(date: Date) {
  if (isToday(date)) {
    return format(date, "h:mm a"); // e.g., 4:15 PM
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  const daysAgo = differenceInDays(new Date(), date);
  if (daysAgo < 7) {
    return format(date, "EEE, h:mm a"); // e.g., Mon, 3:45 PM
  }

  if (isThisYear(date)) {
    return format(date, "MMM d"); // e.g., Apr 21
  }

  return format(date, "MMM d, yyyy"); // e.g., Dec 25, 2022
}
