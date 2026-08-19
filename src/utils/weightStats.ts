import type { WeightEntry, WeekStartDay } from "../types";
import { startOfWeek, endOfWeek, addDays, parseDateStr } from "./date";

export function averageWeightInRange(
  entries: WeightEntry[],
  start: Date,
  end: Date
): number | null {
  const inRange = entries.filter((e) => {
    const t = parseDateStr(e.date).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  if (inRange.length === 0) return null;
  const sum = inRange.reduce((acc, e) => acc + e.weightKg, 0);
  return sum / inRange.length;
}

export interface WeeklyWeightComparison {
  thisWeekAvg: number | null;
  lastWeekAvg: number | null;
  deltaKg: number | null;
  deltaPct: number | null;
}

export function compareWeeklyWeight(
  entries: WeightEntry[],
  weekStartDay: WeekStartDay,
  referenceDate: Date = new Date()
): WeeklyWeightComparison {
  const thisStart = startOfWeek(referenceDate, weekStartDay);
  const thisEnd = endOfWeek(referenceDate, weekStartDay);
  const lastStart = addDays(thisStart, -7);
  const lastEnd = addDays(thisEnd, -7);

  const thisWeekAvg = averageWeightInRange(entries, thisStart, thisEnd);
  const lastWeekAvg = averageWeightInRange(entries, lastStart, lastEnd);

  let deltaKg: number | null = null;
  let deltaPct: number | null = null;
  if (thisWeekAvg !== null && lastWeekAvg !== null) {
    deltaKg = thisWeekAvg - lastWeekAvg;
    deltaPct = (deltaKg / lastWeekAvg) * 100;
  }
  return { thisWeekAvg, lastWeekAvg, deltaKg, deltaPct };
}

/** הודעת חיזוק בהתאם למגמת המשקל, ניטרלית לגבי מטרה (ירידה/עלייה) */
export function encouragementMessage(cmp: WeeklyWeightComparison): string {
  if (cmp.deltaKg === null) {
    return "עוד לא נאספו מספיק נתונים להשוואה שבועית - המשך/י לתעד את המשקל היומי!";
  }
  const abs = Math.abs(cmp.deltaKg);
  if (abs < 0.15) {
    return "המשקל שלך יציב השבוע. יציבות היא הצלחה בפני עצמה - תמשיך/י כך!";
  }
  if (cmp.deltaKg < 0) {
    return `ירדת בממוצע ${abs.toFixed(1)} ק"ג לעומת השבוע הקודם. עבודה מצוינת, תמשיך/י ככה!`;
  }
  return `עלית בממוצע ${abs.toFixed(1)} ק"ג לעומת השבוע הקודם. שימי/שים לב למגמה והתאימו לפי המטרה שלכם.`;
}
