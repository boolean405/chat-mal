// utils/ageZodiac.ts
export type ZodiacKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export const ZODIAC_UNICODE: Record<ZodiacKey, string> = {
  aries: "♈︎",
  taurus: "♉︎",
  gemini: "♊︎",
  cancer: "♋︎",
  leo: "♌︎",
  virgo: "♍︎",
  libra: "♎︎",
  scorpio: "♏︎",
  sagittarius: "♐︎",
  capricorn: "♑︎",
  aquarius: "♒︎",
  pisces: "♓︎",
};

export function toValidDate(input: Date | string): Date | null {
  const d = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getAgeUTC(birthday: Date): number | null {
  const b = toValidDate(birthday);
  if (!b) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - b.getUTCFullYear();

  const monthDiff = now.getUTCMonth() - b.getUTCMonth();
  const dayDiff = now.getUTCDate() - b.getUTCDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

  return age >= 0 ? age : null;
}

export function getZodiacUTC(birthday: Date): ZodiacKey | null {
  const b = toValidDate(birthday);
  if (!b) return null;

  const m = b.getUTCMonth(); // 0-11
  const d = b.getUTCDate(); // 1-31
  const md = (mm: number, dd: number) => mm * 100 + dd;
  const val = md(m, d);

  // Ranges in UTC, inclusive. E.g., Aries: Mar 21 (2,21) → Apr 19 (3,19)
  if (val >= md(2, 21) && val <= md(3, 19)) return "aries";
  if (val >= md(3, 20) && val <= md(4, 20)) return "taurus";
  if (val >= md(4, 21) && val <= md(5, 20)) return "gemini";
  if (val >= md(5, 21) && val <= md(6, 22)) return "cancer";
  if (val >= md(6, 23) && val <= md(7, 22)) return "leo";
  if (val >= md(7, 23) && val <= md(8, 22)) return "virgo";
  if (val >= md(8, 23) && val <= md(9, 22)) return "libra";
  if (val >= md(9, 23) && val <= md(10, 21)) return "scorpio";
  if (val >= md(10, 22) && val <= md(11, 21)) return "sagittarius";
  // Capricorn wraps year-end:
  if (val >= md(11, 22) || val <= md(0, 19)) return "capricorn";
  if (val >= md(0, 20) && val <= md(1, 18)) return "aquarius";
  if (val >= md(1, 19) && val <= md(2, 20)) return "pisces";
  return null;
}
