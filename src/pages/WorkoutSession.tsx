import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { getExerciseById, MUSCLE_GROUP_LABELS } from "../data/exercises";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { Sheet } from "../components/Sheet";
import { AreaChart } from "../components/AreaChart";
import { RestTimerBar } from "../components/RestTimerBar";
import { bestSetWeight, isNewPR } from "../utils/workoutStats";
import { formatShort } from "../utils/date";
import type { SessionExercise, SetEntry, WorkoutPlan } from "../types";

function fmtTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `0:${mm}:${ss}`;
}

export function WorkoutSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = useLiveQuery(() => (sessionId ? db.sessions.get(sessionId) : undefined), [sessionId]);
  const allSessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [rest, setRest] = useState<{ secondsLeft: number; total: number } | null>(null);

  useEffect(() => {
    if (session?.planId) db.plans.get(session.planId).then((p) => setPlan(p ?? null));
  }, [session?.planId]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (rest === null) return;
    if (rest.secondsLeft <= 0) {
      setRest(null);
      return;
    }
    const t = setTimeout(() => setRest((r) => (r ? { ...r, secondsLeft: r.secondsLeft - 1 } : r)), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  const elapsedSeconds = session ? Math.floor((now - session.startedAt) / 1000) : 0;

  const totals = useMemo(() => {
    if (!session) return { volume: 0, reps: 0 };
    let volume = 0;
    let reps = 0;
    for (const ex of session.exercises) {
      for (const s of ex.sets) {
        if (s.done) {
          volume += s.weight * s.reps;
          reps += s.reps;
        }
      }
    }
    return { volume, reps };
  }, [session]);

  function getRestSeconds(exerciseId: string): number {
    if (!plan) return 90;
    const day = plan.days.find((d) => d.id === session?.dayId);
    return day?.exercises.find((e) => e.exerciseId === exerciseId)?.restSeconds ?? 90;
  }

  async function updateExerciseSets(exerciseId: string, sets: SetEntry[]) {
    if (!session) return;
    const exercises: SessionExercise[] = session.exercises.map((e) =>
      e.exerciseId === exerciseId ? { ...e, sets } : e
    );
    await db.sessions.update(session.id, { exercises });
  }

  function toggleDone(exerciseId: string, index: number) {
    if (!session) return;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const set = ex.sets[index];
    const nowDone = !set.done;
    let isPR = set.isPR;
    if (nowDone) {
      isPR = isNewPR(allSessions, exerciseId, set.weight, session.startedAt);
      setRest({ secondsLeft: getRestSeconds(exerciseId), total: getRestSeconds(exerciseId) });
    }
    const sets = ex.sets.map((s, i) => (i === index ? { ...s, done: nowDone, isPR: nowDone ? isPR : false } : s));
    updateExerciseSets(exerciseId, sets);
  }

  function patchSet(exerciseId: string, index: number, patch: Partial<SetEntry>) {
    if (!session) return;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const sets = ex.sets.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateExerciseSets(exerciseId, sets);
  }

  function addSet(exerciseId: string) {
    if (!session) return;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const last = ex.sets[ex.sets.length - 1];
    const sets = [...ex.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 10, done: false }];
    updateExerciseSets(exerciseId, sets);
  }

  function removeSet(exerciseId: string, index: number) {
    if (!session) return;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex || ex.sets.length <= 1) return;
    const sets = ex.sets.filter((_, i) => i !== index);
    updateExerciseSets(exerciseId, sets);
  }

  async function finishWorkout() {
    if (!session) return;
    await db.sessions.update(session.id, { finishedAt: Date.now() });
    navigate("/");
  }

  if (!session) {
    return <div className="screen">טוען אימון...</div>;
  }

  const doneExercisesCount = session.exercises.filter((e) => e.sets.every((s) => s.done)).length;
  const activeEx = activeExerciseId ? session.exercises.find((e) => e.exerciseId === activeExerciseId) : null;
  const activeExDef = activeExerciseId ? getExerciseById(activeExerciseId) : null;

  const history = activeExerciseId
    ? [...allSessions]
        .filter((s) => s.startedAt < session.startedAt || s.id === session.id)
        .sort((a, b) => a.startedAt - b.startedAt)
        .map((s) => ({ s, w: bestSetWeight(s, activeExerciseId) }))
        .filter((x) => x.w !== null)
        .map((x) => ({ label: formatShort(new Date(x.s.startedAt)), value: x.w as number }))
    : [];

  const bestEver = activeExerciseId
    ? [...allSessions]
        .filter((s) => s.startedAt < session.startedAt)
        .flatMap((s) => {
          const ex = s.exercises.find((e) => e.exerciseId === activeExerciseId);
          if (!ex) return [];
          return ex.sets.filter((set) => set.done).map((set) => ({ ...set, date: s.startedAt }));
        })
        .sort((a, b) => b.weight - a.weight)[0]
    : undefined;

  return (
    <div className="screen" style={{ paddingBottom: 40 }}>
      <div className="topbar" style={{ padding: 0 }}>
        <button className="link-btn" onClick={() => navigate("/plans")}>
          יציאה
        </button>
        <span className="bold small muted">
          {doneExercisesCount}/{session.exercises.length} תרגילים הושלמו
        </span>
        <span className="link-btn" style={{ visibility: "hidden" }}>
          x
        </span>
      </div>

      <div className="card row-between">
        <div className="col center" style={{ flex: 1 }}>
          <span className="tiny muted">זמן</span>
          <span className="bold">{fmtTime(elapsedSeconds)}</span>
        </div>
        <div className="divider" style={{ width: 1, height: 30, background: "var(--border)" }} />
        <div className="col center" style={{ flex: 1 }}>
          <span className="tiny muted">נפח</span>
          <span className="bold">{totals.volume.toLocaleString()} ק"ג</span>
        </div>
        <div className="divider" style={{ width: 1, height: 30, background: "var(--border)" }} />
        <div className="col center" style={{ flex: 1 }}>
          <span className="tiny muted">חזרות</span>
          <span className="bold">{totals.reps}</span>
        </div>
      </div>

      <h2>{session.dayName}</h2>

      <div className="col" style={{ gap: 10 }}>
        {session.exercises.map((ex) => {
          const def = getExerciseById(ex.exerciseId);
          if (!def) return null;
          const doneCount = ex.sets.filter((s) => s.done).length;
          const hasPR = ex.sets.some((s) => s.isPR);
          const top = ex.sets.reduce((m, s) => (s.weight > m ? s.weight : m), 0);
          return (
            <div key={ex.exerciseId} className="list-item card--pressable" onClick={() => setActiveExerciseId(ex.exerciseId)}>
              <div className="thumb">
                <ExerciseIcon muscleGroup={def.muscleGroup} size={30} />
              </div>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <div className="row" style={{ gap: 6 }}>
                  <span className="bold small">{def.name}</span>
                  {hasPR && <span className="badge-pr">🏆 שיא</span>}
                </div>
                <span className="tiny muted">
                  {doneCount}/{ex.sets.length} סטים · {MUSCLE_GROUP_LABELS[def.muscleGroup]}
                  {top > 0 ? ` · שיא היום: ${top} ק"ג` : ""}
                </span>
              </div>
              <span style={{ color: "var(--text-mute)" }}>›</span>
            </div>
          );
        })}
      </div>

      <button className="btn btn--gold btn--block" onClick={finishWorkout}>
        סיום אימון
      </button>

      {rest && (
        <RestTimerBar
          secondsLeft={rest.secondsLeft}
          total={rest.total}
          onSkip={() => setRest(null)}
          onAdd={() => setRest((r) => (r ? { ...r, secondsLeft: r.secondsLeft + 15, total: r.total + 15 } : r))}
        />
      )}

      <Sheet open={activeExerciseId !== null} onClose={() => setActiveExerciseId(null)}>
        {activeEx && activeExDef && (
          <div className="col" style={{ gap: 14 }}>
            <div className="row" style={{ gap: 12 }}>
              <div className="thumb" style={{ width: 64, height: 64 }}>
                <ExerciseIcon muscleGroup={activeExDef.muscleGroup} size={38} />
              </div>
              <div className="col" style={{ gap: 4 }}>
                <h3>{activeExDef.name}</h3>
                <span className="chip">{MUSCLE_GROUP_LABELS[activeExDef.muscleGroup]}</span>
              </div>
            </div>

            <div>
              <span className="bold small">המשקל הכי גבוה שהרמת</span>
              {bestEver ? (
                <p className="small muted">
                  {bestEver.weight} ק"ג · {bestEver.reps} חזרות · {formatShort(new Date(bestEver.date))}
                </p>
              ) : (
                <p className="small muted">עדיין אין נתונים קודמים לתרגיל זה</p>
              )}
              <div style={{ marginTop: 6 }}>
                <AreaChart points={history} />
              </div>
            </div>

            <hr className="divider" />

            <div className="col" style={{ gap: 8 }}>
              {activeEx.sets.map((set, i) => (
                <div
                  key={i}
                  className="row-between"
                  style={{
                    padding: 10,
                    borderRadius: "var(--radius-md)",
                    background: set.done ? "var(--good-bg)" : "var(--surface-2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="bold small" style={{ width: 20 }}>
                    {i + 1}
                  </span>
                  <div className="row" style={{ gap: 6 }}>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="input"
                      style={{ width: 64, padding: "8px", textAlign: "center" }}
                      value={set.weight}
                      onChange={(e) => patchSet(activeExerciseId!, i, { weight: Number(e.target.value) || 0 })}
                    />
                    <span className="tiny muted">ק"ג</span>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="input"
                      style={{ width: 54, padding: "8px", textAlign: "center" }}
                      value={set.reps}
                      onChange={(e) => patchSet(activeExerciseId!, i, { reps: Number(e.target.value) || 0 })}
                    />
                    <span className="tiny muted">חזרות</span>
                  </div>
                  <button
                    className="btn btn--sm"
                    style={
                      set.done
                        ? { background: "var(--good)", color: "#fff" }
                        : { background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--text-soft)" }
                    }
                    onClick={() => toggleDone(activeExerciseId!, i)}
                  >
                    {set.done ? "בוצע ✓" : "בוצע"}
                  </button>
                  <button className="link-btn" style={{ padding: 4 }} onClick={() => removeSet(activeExerciseId!, i)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button className="btn btn--ghost btn--block" onClick={() => addSet(activeExerciseId!)}>
              + הוספת סט
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
