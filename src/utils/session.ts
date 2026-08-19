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

/** בונה את רשימת התרגילים לאימון חדש, עם נתוני משקל/חזרות מהפעם הקודמת */
export function buildSessionExercises(
  day: PlanDay,
  pastSessions: WorkoutSession[]
): SessionExercise[] {
  return day.exercises.map((planEx) => {
    const last = findLastPerformed(pastSessions, planEx.exerciseId);
    const targetCount = planEx.targetSets;
    let sets: SetEntry[];

    if (last) {
      const doneSets = last.sets.filter((s) => s.done);
      sets = Array.from({ length: targetCount }, (_, i) => {
        const src = doneSets[i] ?? doneSets[doneSets.length - 1];
        return {
          weight: src ? src.weight : 0,
          reps: src ? src.reps : planEx.targetReps,
          done: false,
        };
      });
    } else {
      sets = Array.from({ length: targetCount }, () => ({
        weight: 0,
        reps: planEx.targetReps,
        done: false,
      }));
    }

    return { exerciseId: planEx.exerciseId, sets };
  });
}
