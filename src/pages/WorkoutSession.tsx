import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { getExerciseById, MUSCLE_GROUP_LABELS } from "../data/exercises";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { Sheet } from "../components/Sheet";
import { RestTimerBar } from "../components/RestTimerBar";
import { isNewPR } from "../utils/workoutStats";
import { IconClose, IconClock, IconChevronForward, IconTrophy, IconCheck, IconPlus } from "../components/Icons";
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

  function bumpWeight(exerciseId: string, index: number, delta: number) {
    if (!session) return;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const sets = ex.sets.map((s, i) => (i === index ? { ...s, weight: Math.max(0, s.weight + delta) } : s));
    updateExerciseSets(exerciseId, sets);
  }

  function setWeight(exerciseId: string, index: number, weight: number) {
    if (!session) return;
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const sets = ex.sets.map((s, i) => (i === index ? { ...s, weight: Math.max(0, weight) } : s));
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

  async function finishWorkout() {
    if (!session) return;
    await db.sessions.update(session.id, { finishedAt: Date.now() });
    navigate("/");
  }

  if (!session) {
    return <div className="screen">טוען אימון...</div>;
  }

  const doneExercisesCount = session.exercises.filter((e) => e.sets.every((s) => s.done)).length;
  const currentIndex = session.exercises.findIndex((e) => !e.sets.every((s) => s.done));
  const activeIndex = activeExerciseId ? session.exercises.findIndex((e) => e.exerciseId === activeExerciseId) : -1;
  const activeEx = activeIndex >= 0 ? session.exercises[activeIndex] : null;
  const activeExDef = activeExerciseId ? getExerciseById(activeExerciseId) : null;

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

  function goToExercise(delta: number) {
    if (activeIndex < 0) return;
    const nextIndex = activeIndex + delta;
    const next = session!.exercises[nextIndex];
    if (next) setActiveExerciseId(next.exerciseId);
  }

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <div className="row-between">
        <button className="btn btn--icon btn--ghost" onClick={() => navigate("/plans")}>
          <IconClose size={26} color="var(--brown)" strokeWidth={2.8} />
        </button>
        <div
          className="row"
          style={{ gap: 8, padding: "11px 16px", borderRadius: 16, background: "var(--brown)" }}
        >
          <IconClock size={22} color="#fff" strokeWidth={2.8} />
          <span style={{ fontSize: 19, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {fmtTime(elapsedSeconds)}
          </span>
        </div>
        <span style={{ width: 46 }} />
      </div>

      <div className="row-between" style={{ alignItems: "baseline" }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.7px" }}>{session.dayName}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-2)" }}>
          {doneExercisesCount}/{session.exercises.length}
        </span>
      </div>

      <div style={{ display: "flex", border: "2.5px solid var(--line)", borderRadius: 22, overflow: "hidden" }}>
        <div className="col" style={{ flex: 1, alignItems: "center", gap: 2, padding: "12px 4px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>נפח</span>
          <span style={{ fontSize: 23, fontWeight: 800 }}>{totals.volume.toLocaleString()}</span>
        </div>
        <span style={{ width: 2, background: "var(--line-2)" }} />
        <div className="col" style={{ flex: 1, alignItems: "center", gap: 2, padding: "12px 4px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>תרגילים</span>
          <span style={{ fontSize: 23, fontWeight: 800 }}>
            {doneExercisesCount}/{session.exercises.length}
          </span>
        </div>
        <span style={{ width: 2, background: "var(--line-2)" }} />
        <div className="col" style={{ flex: 1, alignItems: "center", gap: 2, padding: "12px 4px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>חזרות</span>
          <span style={{ fontSize: 23, fontWeight: 800 }}>{totals.reps}</span>
        </div>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {session.exercises.map((ex, i) => {
          const def = getExerciseById(ex.exerciseId);
          if (!def) return null;
          const doneCount = ex.sets.filter((s) => s.done).length;
          const hasPR = ex.sets.some((s) => s.isPR);
          const isCurrent = i === currentIndex;
          return (
            <div
              key={ex.exerciseId}
              className="list-item card--pressable"
              style={{ borderColor: isCurrent ? "var(--brown)" : "var(--line)", borderWidth: 2.5 }}
              onClick={() => setActiveExerciseId(ex.exerciseId)}
            >
              <div className="thumb">
                <ExerciseIcon muscleGroup={def.muscleGroup} size={30} />
              </div>
              <div className="col" style={{ flex: 1, gap: 2, minWidth: 0 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {def.name}
                  </span>
                  {hasPR && (
                    <span className="badge-pr">
                      <IconTrophy size={15} color="var(--gold-text)" />
                      שיא
                    </span>
                  )}
                </div>
                <span className="tiny muted">
                  {doneCount}/{ex.sets.length} סטים · {MUSCLE_GROUP_LABELS[def.muscleGroup]}
                </span>
              </div>
              <IconChevronForward size={26} color="var(--muted)" strokeWidth={3} />
            </div>
          );
        })}
      </div>

      {rest && <RestTimerBar secondsLeft={rest.secondsLeft} total={rest.total} onSkip={() => setRest(null)} onAdd={() => setRest((r) => (r ? { ...r, secondsLeft: r.secondsLeft + 15, total: r.total + 15 } : r))} />}

      <button
        className="btn btn--ghost btn--block"
        style={{ height: 58, borderRadius: 20, fontSize: 20, color: "var(--brown)" }}
        onClick={finishWorkout}
      >
        <IconCheck size={26} color="var(--brown)" strokeWidth={3} />
        סיום אימון
      </button>

      <Sheet open={activeExerciseId !== null} onClose={() => setActiveExerciseId(null)}>
        {activeEx && activeExDef && (
          <div className="col" style={{ gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="sheet-close" onClick={() => setActiveExerciseId(null)}>
                <IconClose size={24} color="var(--brown)" strokeWidth={3} />
              </button>
            </div>

            <div className="row" style={{ gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--brown)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ExerciseIcon muscleGroup={activeExDef.muscleGroup} size={32} />
              </div>
              <div className="col" style={{ gap: 2, flex: 1 }}>
                <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px", lineHeight: 1.15 }}>{activeExDef.name}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>{MUSCLE_GROUP_LABELS[activeExDef.muscleGroup]}</span>
              </div>
            </div>

            <div className="row-between" style={{ padding: "10px 14px", borderRadius: 16, background: "var(--surface)" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-2)" }}>שיא אישי</span>
              {bestEver ? (
                <span dir="rtl" style={{ fontSize: 19, fontWeight: 800, whiteSpace: "nowrap" }}>
                  {bestEver.reps} חזרות · {bestEver.weight} ק"ג
                </span>
              ) : (
                <span className="small muted">אין עדיין נתונים</span>
              )}
            </div>

            {rest && <RestTimerBar variant="compact" secondsLeft={rest.secondsLeft} total={rest.total} onSkip={() => setRest(null)} onAdd={() => setRest((r) => (r ? { ...r, secondsLeft: r.secondsLeft + 15, total: r.total + 15 } : r))} />}

            <div className="col" style={{ gap: 9 }}>
              {activeEx.sets.map((set, i) => (
                <div
                  key={i}
                  className="row"
                  style={{
                    gap: 6,
                    padding: "8px 10px",
                    borderRadius: 18,
                    border: `2.5px solid ${set.done ? "var(--brown)" : "var(--line-2)"}`,
                    background: set.done ? "var(--surface-3)" : "#fff",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      background: set.done ? "var(--brown)" : "var(--surface-2)",
                      color: set.done ? "#fff" : "var(--ink-2)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="row" style={{ gap: 4, flexShrink: 0 }}>
                    <button className="num-row__btn" style={{ width: 34, height: 34, fontSize: 20 }} onClick={() => bumpWeight(activeExerciseId!, i, -2.5)}>
                      −
                    </button>
                    <div className="col" style={{ alignItems: "center", minWidth: 62, gap: 0 }}>
                      <input
                        type="number"
                        inputMode="decimal"
                        step={0.5}
                        min={0}
                        className="input-faded"
                        value={set.weight}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setWeight(activeExerciseId!, i, e.target.value === "" ? 0 : Number(e.target.value))}
                        style={{ width: 62, fontSize: 19, fontWeight: 800, lineHeight: 1.1, padding: "2px 2px" }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>ק"ג</span>
                    </div>
                    <button className="num-row__btn" style={{ width: 34, height: 34, fontSize: 20 }} onClick={() => bumpWeight(activeExerciseId!, i, 2.5)}>
                      +
                    </button>
                  </div>
                  <div className="col" style={{ alignItems: "center", minWidth: 38, flexShrink: 0, gap: 0 }}>
                    <span style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.1 }}>{set.reps}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>חזרות</span>
                  </div>
                  <button
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      flexShrink: 0,
                      border: set.done ? "none" : "2.5px solid var(--line)",
                      background: set.done ? "var(--gold)" : "#fff",
                      boxShadow: set.done ? "0 6px 16px -8px rgba(242,169,28,.9)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleDone(activeExerciseId!, i)}
                  >
                    <IconCheck size={26} color={set.done ? "var(--gold-text)" : "var(--tint-2)"} strokeWidth={3.2} />
                  </button>
                </div>
              ))}
            </div>

            <button className="btn btn--dashed btn--block" style={{ height: 46, borderRadius: 16 }} onClick={() => addSet(activeExerciseId!)}>
              <IconPlus size={22} color="var(--brown-2)" />
              הוספת סט
            </button>

            <div className="row" style={{ gap: 10 }}>
              <button
                className="btn btn--ghost"
                style={{ flex: 1, height: 54, borderRadius: 18, fontSize: 18 }}
                disabled={activeIndex <= 0}
                onClick={() => goToExercise(-1)}
              >
                הקודם
              </button>
              <button
                className="btn btn--leather"
                style={{ flex: 2, height: 54, borderRadius: 18, fontSize: 19 }}
                disabled={activeIndex >= session.exercises.length - 1}
                onClick={() => goToExercise(1)}
              >
                התרגיל הבא
                <IconChevronForward size={24} color="#fff" strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
