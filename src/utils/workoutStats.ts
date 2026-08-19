import type { WorkoutSession, WeekStartDay } from "../types";
import { startOfWeek, endOfWeek, addDays } from "./date";

/** המשקל המקסימלי שבוצע בתרגיל נתון, מתוך סטים שסומנו כ"בוצע" */
export function bestSetWeight(session: WorkoutSession, exerciseId: string): number | null {
  const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex) return null;
  const done = ex.sets.filter((s) => s.done && s.reps > 0);
  if (done.length === 0) return null;
  return Math.max(...done.map((s) => s.weight));
}

/** המשקל המקסימלי הכי גבוה אי-פעם לתרגיל, מתוך רשימת אימונים (עד תאריך נתון, כולל) */
export function allTimeMaxWeight(
  sessions: WorkoutSession[],
  exerciseId: string,
  beforeTs?: number
): number {
  let max = 0;
  for (const s of sessions) {
    if (beforeTs !== undefined && s.startedAt >= beforeTs) continue;
    const w = bestSetWeight(s, exerciseId);
    if (w !== null && w > max) max = w;
  }
  return max;
}

export function isNewPR(
  sessions: WorkoutSession[],
  exerciseId: string,
  weight: number,
  currentSessionStartedAt: number
): boolean {
  const priorMax = allTimeMaxWeight(sessions, exerciseId, currentSessionStartedAt);
  return weight > priorMax && weight > 0;
}

function maxWeightInRange(
  sessions: WorkoutSession[],
  exerciseId: string,
  start: Date,
  end: Date
): number | null {
  let max: number | null = null;
  for (const s of sessions) {
    if (s.startedAt < start.getTime() || s.startedAt > end.getTime()) continue;
    const w = bestSetWeight(s, exerciseId);
    if (w !== null && (max === null || w > max)) max = w;
  }
  return max;
}

export interface ExerciseWeekChange {
  exerciseId: string;
  thisWeekMax: number;
  lastWeekMax: number;
  pctChange: number;
}

/**
 * משווה, עבור כל תרגיל שבוצע השבוע וגם בשבוע הקודם, את השינוי היחסי (%)
 * במשקל המקסימלי.
 */
export function computeWeeklyExerciseChanges(
  sessions: WorkoutSession[],
  weekStartDay: WeekStartDay,
  referenceDate: Date = new Date()
): ExerciseWeekChange[] {
  const thisStart = startOfWeek(referenceDate, weekStartDay);
  const thisEnd = endOfWeek(referenceDate, weekStartDay);
  const lastStart = addDays(thisStart, -7);
  const lastEnd = addDays(thisEnd, -7);

  const exerciseIds = new Set<string>();
  for (const s of sessions) {
    if (s.startedAt >= thisStart.getTime() && s.startedAt <= thisEnd.getTime()) {
      for (const ex of s.exercises) exerciseIds.add(ex.exerciseId);
    }
  }

  const results: ExerciseWeekChange[] = [];
  for (const exerciseId of exerciseIds) {
    const thisWeekMax = maxWeightInRange(sessions, exerciseId, thisStart, thisEnd);
    const lastWeekMax = maxWeightInRange(sessions, exerciseId, lastStart, lastEnd);
    if (thisWeekMax === null || lastWeekMax === null || lastWeekMax === 0) continue;
    const pctChange = ((thisWeekMax - lastWeekMax) / lastWeekMax) * 100;
    results.push({ exerciseId, thisWeekMax, lastWeekMax, pctChange });
  }
  return results;
}

export interface WeeklyExerciseSummary {
  topImprovers: ExerciseWeekChange[]; // עד 2, מיון יורד
  leastImproved: ExerciseWeekChange | null;
}

export function summarizeWeeklyExercises(
  sessions: WorkoutSession[],
  weekStartDay: WeekStartDay,
  referenceDate: Date = new Date()
): WeeklyExerciseSummary {
  const changes = computeWeeklyExerciseChanges(sessions, weekStartDay, referenceDate);
  const sorted = [...changes].sort((a, b) => b.pctChange - a.pctChange);
  const topImprovers = sorted.slice(0, 2);
  const last = sorted[sorted.length - 1];
  const leastImproved =
    last && !topImprovers.includes(last) ? last : null;
  return { topImprovers, leastImproved };
}
