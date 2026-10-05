import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../db/db";
import { getExerciseById, MUSCLE_GROUP_LABELS } from "../data/exercises";
import { buildSessionExercises } from "../utils/session";
import { estimateWorkoutMinutes } from "../utils/workoutStats";
import { toDateStr, todayStr } from "../utils/date";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { IconClose, IconPlay, IconCheck } from "../components/Icons";
import type { WorkoutSession } from "../types";

type Mode = "start" | "again" | "continue";

const BUTTON_LABEL: Record<Mode, string> = { start: "התחל", again: "שוב", continue: "המשך" };

function fmtClock(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function DayWorkout() {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();
  const plan = useLiveQuery(() => (planId ? db.plans.get(planId).then((p) => p ?? null) : null), [planId]);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);

  if (plan === undefined || sessions === undefined) {
    return <div className="screen">טוען...</div>;
  }

  const day = plan?.days.find((d) => d.id === dayId);
  if (!plan || !day) {
    return (
      <div className="screen">
        <div className="empty-state">
          <p className="bold">האימון לא נמצא</p>
          <button className="btn btn--leather" onClick={() => navigate("/plans")}>
            חזרה לתוכניות
          </button>
        </div>
      </div>
    );
  }

  // Only today's sessions decide the state: an unfinished one from a previous day starts fresh.
  const todaysSession = sessions
    .filter((s) => s.planId === plan.id && s.dayId === day.id && toDateStr(new Date(s.startedAt)) === todayStr())
    .sort((a, b) => b.startedAt - a.startedAt)[0];
  const mode: Mode = !todaysSession ? "start" : todaysSession.finishedAt ? "again" : "continue";

  const totalSets = day.exercises.reduce((sum, e) => sum + e.targetSets, 0);

  async function startNewSession() {
    const session: WorkoutSession = {
      id: uid(),
      planId: plan!.id,
      dayId: day!.id,
      dayName: day!.name,
      startedAt: Date.now(),
      exercises: buildSessionExercises(day!, sessions!),
    };
    await db.sessions.put(session);
    navigate(`/session/${session.id}`, { replace: true });
  }

  function onAction() {
    if (mode === "continue") navigate(`/session/${todaysSession!.id}`, { replace: true });
    else startNewSession();
  }

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>
      <div className="row-between">
        <button className="btn btn--icon btn--ghost" onClick={() => navigate("/plans")}>
          <IconClose size={26} color="var(--brown)" strokeWidth={2.8} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-2)" }}>{plan.name}</span>
        <span style={{ width: 46 }} />
      </div>

      <div className="col" style={{ gap: 4 }}>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.7px" }}>{day.name}</span>
        {mode === "continue" && (
          <span className="chip chip--gold" style={{ alignSelf: "flex-start", padding: "5px 11px", fontSize: 13 }}>
            באמצע · התחלת ב-{fmtClock(todaysSession!.startedAt)}
          </span>
        )}
        {mode === "again" && (
          <span className="row" style={{ gap: 5, fontSize: 14, fontWeight: 800, color: "var(--brown-2)" }}>
            <IconCheck size={16} color="var(--brown-2)" />
            הושלם היום
          </span>
        )}
      </div>

      <div style={{ display: "flex", border: "2.5px solid var(--line)", borderRadius: 22, overflow: "hidden" }}>
        <div className="col" style={{ flex: 1, alignItems: "center", gap: 2, padding: "12px 4px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>תרגילים</span>
          <span style={{ fontSize: 23, fontWeight: 800 }}>{day.exercises.length}</span>
        </div>
        <span style={{ width: 2, background: "var(--line-2)" }} />
        <div className="col" style={{ flex: 1, alignItems: "center", gap: 2, padding: "12px 4px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>סטים</span>
          <span style={{ fontSize: 23, fontWeight: 800 }}>{totalSets}</span>
        </div>
        <span style={{ width: 2, background: "var(--line-2)" }} />
        <div className="col" style={{ flex: 1, alignItems: "center", gap: 2, padding: "12px 4px" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>זמן משוער</span>
          <span style={{ fontSize: 23, fontWeight: 800 }}>{estimateWorkoutMinutes(day)} דק'</span>
        </div>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {day.exercises.map((pe) => {
          const def = getExerciseById(pe.exerciseId);
          if (!def) return null;
          const sessionEx = mode === "continue" ? todaysSession!.exercises.find((e) => e.exerciseId === pe.exerciseId) : undefined;
          const detail = sessionEx
            ? `${sessionEx.sets.filter((s) => s.done).length}/${sessionEx.sets.length} סטים`
            : `${pe.targetSets} סטים × ${pe.targetReps} חזרות`;
          return (
            <div key={pe.id} className="list-item" style={{ borderWidth: 2.5 }}>
              <div className="thumb">
                <ExerciseIcon muscleGroup={def.muscleGroup} size={30} />
              </div>
              <div className="col" style={{ flex: 1, gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 19, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {def.name}
                </span>
                <span className="tiny muted">
                  {detail} · {MUSCLE_GROUP_LABELS[def.muscleGroup]}
                </span>
              </div>
            </div>
          );
        })}
        {day.exercises.length === 0 && <div className="empty-state small">אין תרגילים ביום הזה - הוסף/י אותם בעריכת התוכנית</div>}
      </div>

      <button
        className="btn btn--leather btn--block"
        style={{ height: 64, borderRadius: 22, fontSize: 22 }}
        disabled={day.exercises.length === 0}
        onClick={onAction}
      >
        <IconPlay size={26} color="#fff" />
        {BUTTON_LABEL[mode]}
      </button>
    </div>
  );
}
