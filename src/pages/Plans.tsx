import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../db/db";
import { EXERCISES, MUSCLE_GROUP_LABELS } from "../data/exercises";
import { buildSessionExercises } from "../utils/session";
import type { WorkoutPlan, WorkoutSession } from "../types";

export function Plans() {
  const navigate = useNavigate();
  const plans = useLiveQuery(() => db.plans.orderBy("createdAt").reverse().toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);

  async function startWorkout(plan: WorkoutPlan, dayId: string) {
    const day = plan.days.find((d) => d.id === dayId);
    if (!day) return;
    const exercises = buildSessionExercises(day, sessions ?? []);
    const session: WorkoutSession = {
      id: uid(),
      planId: plan.id,
      dayId: day.id,
      dayName: day.name,
      startedAt: Date.now(),
      exercises,
    };
    await db.sessions.put(session);
    navigate(`/session/${session.id}`);
  }

  async function deletePlan(planId: string) {
    if (!confirm("למחוק את התוכנית?")) return;
    await db.plans.delete(planId);
  }

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: 0 }}>
        <h2 className="topbar__title">תוכניות אימונים</h2>
        <button className="btn btn--gold btn--sm" onClick={() => navigate("/plans/new")}>
          + תוכנית חדשה
        </button>
      </div>

      {plans && plans.length === 0 && (
        <div className="empty-state">
          <p className="bold">עדיין אין תוכניות אימונים</p>
          <p className="small">בנה/י תוכנית ראשונה כדי להתחיל להתאמן</p>
          <button className="btn btn--leather" onClick={() => navigate("/plans/new")}>
            בניית תוכנית
          </button>
        </div>
      )}

      <div className="col" style={{ gap: 14 }}>
        {plans?.map((plan) => (
          <div key={plan.id} className="card">
            <div className="row-between">
              <h3>{plan.name}</h3>
              <div className="row" style={{ gap: 6 }}>
                <button className="link-btn" onClick={() => navigate(`/plans/${plan.id}`)}>
                  עריכה
                </button>
                <button className="link-btn" style={{ color: "var(--bad)" }} onClick={() => deletePlan(plan.id)}>
                  מחיקה
                </button>
              </div>
            </div>
            <div className="col" style={{ gap: 8, marginTop: 10 }}>
              {plan.days.map((day) => (
                <div key={day.id} className="row-between" style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--radius-md)" }}>
                  <div className="col" style={{ gap: 2 }}>
                    <span className="bold small">{day.name}</span>
                    <span className="tiny muted">
                      {day.exercises.length} תרגילים ·{" "}
                      {Array.from(
                        new Set(
                          day.exercises
                            .map((e) => EXERCISES.find((x) => x.id === e.exerciseId)?.muscleGroup)
                            .filter(Boolean)
                            .map((g) => MUSCLE_GROUP_LABELS[g as string])
                        )
                      )
                        .slice(0, 3)
                        .join(", ")}
                    </span>
                  </div>
                  <button
                    className="btn btn--gold btn--sm"
                    disabled={day.exercises.length === 0}
                    onClick={() => startWorkout(plan, day.id)}
                  >
                    התחלת אימון
                  </button>
                </div>
              ))}
              {plan.days.length === 0 && (
                <span className="small muted">אין ימי אימון בתוכנית זו</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
