import type { WorkoutSession, WeekStartDay, WorkoutPlan, PlanDay } from "../types";
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

/** התוכנית "הפעילה": זו של האימון האחרון שבוצע, ואם אין - התוכנית האחרונה שנוצרה */
export function getActivePlan(plans: WorkoutPlan[], sessions: WorkoutSession[]): WorkoutPlan | null {
  if (plans.length === 0) return null;
  const lastSession = [...sessions].sort((a, b) => b.startedAt - a.startedAt)[0];
  if (lastSession) {
    const plan = plans.find((p) => p.id === lastSession.planId);
    if (plan) return plan;
  }
  return [...plans].sort((a, b) => b.createdAt - a.createdAt)[0];
}

/** אחוז ביצוע ליום אימון: מתוך ה-session האחרון של אותו יום בשבוע הנוכחי */
export function dayCompletionPct(
  planId: string,
  day: PlanDay,
  sessions: WorkoutSession[],
  weekStartDay: WeekStartDay,
  referenceDate: Date = new Date()
): number | null {
  const start = startOfWeek(referenceDate, weekStartDay).getTime();
  const end = endOfWeek(referenceDate, weekStartDay).getTime();
  const candidates = sessions
    .filter((s) => s.planId === planId && s.dayId === day.id && s.startedAt >= start && s.startedAt <= end)
    .sort((a, b) => b.startedAt - a.startedAt);
  const last = candidates[0];
  if (!last) return null;
  const totalPlanned = day.exercises.reduce((sum, e) => sum + e.targetSets, 0);
  if (totalPlanned === 0) return 0;
  const doneSets = last.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
  return Math.min(100, (doneSets / totalPlanned) * 100);
}

/** יום התוכנית שיוצג כ"האימון של היום" - היום שאחרי האימון האחרון שבוצע, במחזוריות */
export function pickTodaysDayIndex(plan: WorkoutPlan, sessions: WorkoutSession[]): number {
  if (plan.days.length === 0) return 0;
  const planSessions = sessions.filter((s) => s.planId === plan.id).sort((a, b) => b.startedAt - a.startedAt);
  const last = planSessions[0];
  if (!last) return 0;
  const idx = plan.days.findIndex((d) => d.id === last.dayId);
  if (idx === -1) return 0;
  return (idx + 1) % plan.days.length;
}

/** הערכת משך אימון בדקות, לפי מספר סטים ומנוחה */
export function estimateWorkoutMinutes(day: PlanDay): number {
  const seconds = day.exercises.reduce((sum, e) => sum + e.targetSets * (45 + e.restSeconds), 0);
  return Math.round(seconds / 60);
}

/** נפח בק"ג לרצף שבועות אחרונים (כולל הנוכחי), הכי ישן ראשון */
export function weeklyVolumeSeries(
  sessions: WorkoutSession[],
  weekStartDay: WeekStartDay,
  weeks = 6,
  referenceDate: Date = new Date()
): number[] {
  const result: number[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const ref = addDays(referenceDate, -7 * i);
    const start = startOfWeek(ref, weekStartDay).getTime();
    const end = endOfWeek(ref, weekStartDay).getTime();
    let volume = 0;
    for (const s of sessions) {
      if (s.startedAt < start || s.startedAt > end) continue;
      for (const ex of s.exercises) {
        for (const set of ex.sets) {
          if (set.done) volume += set.weight * set.reps;
        }
      }
    }
    result.push(volume);
  }
  return result;
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
