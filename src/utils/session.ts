import type { PlanDay, WorkoutSession, SessionExercise, SetEntry } from "../types";

/** מוצא את האימון האחרון (הישן ביותר קודם) שבו בוצע תרגיל נתון עם סטים שסומנו כבוצעו */
function findLastPerformed(
  sessions: WorkoutSession[],
  exerciseId: string
): SessionExercise | null {
  const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
  for (const s of sorted) {
    const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.some((set) => set.done)) return ex;
  }
  return null;
}

/** בונה את רשימת התרגילים לאימון חדש: מספר הסטים והחזרות תמיד לפי התוכנית העדכנית, המשקל מהפעם הקודמת אם קיים */
export function buildSessionExercises(
  day: PlanDay,
  pastSessions: WorkoutSession[]
): SessionExercise[] {
  return day.exercises.map((planEx) => {
    const last = findLastPerformed(pastSessions, planEx.exerciseId);
    const doneSets = last ? last.sets.filter((s) => s.done) : [];

    const sets: SetEntry[] = Array.from({ length: planEx.targetSets }, (_, i) => {
      const src = doneSets[i] ?? doneSets[doneSets.length - 1];
      return {
        weight: src ? src.weight : 0,
        reps: planEx.targetReps,
        done: false,
      };
    });

    return { exerciseId: planEx.exerciseId, sets };
  });
}
