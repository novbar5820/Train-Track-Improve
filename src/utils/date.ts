import type { WeekStartDay } from "../types";

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** תחילת השבוע (בתאריך d) לפי יום תחילת השבוע שנבחר בהגדרות */
export function startOfWeek(d: Date, weekStartDay: WeekStartDay): Date {
  const day = d.getDay(); // 0=Sunday..6=Saturday
  const diff = (day - weekStartDay + 7) % 7;
  const start = addDays(d, -diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function endOfWeek(d: Date, weekStartDay: WeekStartDay): Date {
  const start = startOfWeek(d, weekStartDay);
  const end = addDays(start, 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function weekKey(d: Date, weekStartDay: WeekStartDay): string {
  return toDateStr(startOfWeek(d, weekStartDay));
}

export const WEEKDAY_LABELS_HE = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

export function formatShort(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}
