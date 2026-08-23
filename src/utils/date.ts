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

const WEEKDAY_LETTER_HE = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

/** "יום ג'" */
export function hebrewWeekdayShort(d: Date): string {
  return `יום ${WEEKDAY_LETTER_HE[d.getDay()]}'`;
}

const HEBREW_MONTHS = [
  "בינואר", "בפברואר", "במרץ", "באפריל", "במאי", "ביוני",
  "ביולי", "באוגוסט", "בספטמבר", "באוקטובר", "בנובמבר", "בדצמבר",
];

/** "22 באוגוסט" */
export function formatHebrewDate(d: Date): string {
  return `${d.getDate()} ${HEBREW_MONTHS[d.getMonth()]}`;
}

/** ברכה לפי שעת היום */
export function greetingForHour(hour: number): string {
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 18) return "צהריים טובים";
  if (hour >= 18 && hour < 22) return "ערב טוב";
  return "לילה טוב";
}
