import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, uid } from "../db/db";
import { ExercisePickerSheet } from "../components/ExercisePickerSheet";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { getExerciseById } from "../data/exercises";
import type { WorkoutPlan, PlanDay, PlanExercise } from "../types";

function emptyPlan(): WorkoutPlan {
  return { id: uid(), name: "", days: [], createdAt: Date.now() };
}

export function PlanEditor() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan>(emptyPlan());
  const [loaded, setLoaded] = useState(!planId);
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    db.plans.get(planId).then((p) => {
      if (p) setPlan(p);
      setLoaded(true);
    });
  }, [planId]);

  function updateDay(dayId: string, fn: (d: PlanDay) => PlanDay) {
    setPlan((p) => ({
      ...p,
      days: p.days.map((d) => (d.id === dayId ? fn(d) : d)),
    }));
  }

  function addDay() {
    const day: PlanDay = { id: uid(), name: `יום ${plan.days.length + 1}`, exercises: [] };
    setPlan((p) => ({ ...p, days: [...p.days, day] }));
  }

  function removeDay(dayId: string) {
    setPlan((p) => ({ ...p, days: p.days.filter((d) => d.id !== dayId) }));
  }

  function addExerciseToDay(dayId: string, exerciseId: string) {
    const planEx: PlanExercise = {
      id: uid(),
      exerciseId,
      targetSets: 3,
      targetReps: 10,
      restSeconds: 90,
    };
    updateDay(dayId, (d) => ({ ...d, exercises: [...d.exercises, planEx] }));
  }

  function removeExercise(dayId: string, planExId: string) {
    updateDay(dayId, (d) => ({ ...d, exercises: d.exercises.filter((e) => e.id !== planExId) }));
  }

  function updateExercise(dayId: string, planExId: string, patch: Partial<PlanExercise>) {
    updateDay(dayId, (d) => ({
      ...d,
      exercises: d.exercises.map((e) => (e.id === planExId ? { ...e, ...patch } : e)),
    }));
  }

  async function save() {
    if (!plan.name.trim()) {
      alert("יש להזין שם לתוכנית");
      return;
    }
    await db.plans.put(plan);
    navigate("/plans");
  }

  if (!loaded) return <div className="screen">טוען...</div>;

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: 0 }}>
        <button className="link-btn" onClick={() => navigate("/plans")}>
          ביטול
        </button>
        <h2 className="topbar__title">{planId ? "עריכת תוכנית" : "תוכנית חדשה"}</h2>
        <button className="link-btn" onClick={save}>
          שמירה
        </button>
      </div>

      <div className="field">
        <label className="field__label">שם התוכנית</label>
        <input
          className="input"
          placeholder="לדוגמה: תוכנית פול-בול-רגליים"
          value={plan.name}
          onChange={(e) => setPlan((p) => ({ ...p, name: e.target.value }))}
        />
      </div>

      <div className="col" style={{ gap: 14 }}>
        {plan.days.map((day) => (
          <div key={day.id} className="card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <input
                className="input"
                style={{ fontWeight: 700, flex: 1 }}
                value={day.name}
                onChange={(e) => updateDay(day.id, (d) => ({ ...d, name: e.target.value }))}
              />
              <button className="link-btn" style={{ color: "var(--bad)" }} onClick={() => removeDay(day.id)}>
                מחיקת יום
              </button>
            </div>

            <div className="col" style={{ gap: 8 }}>
              {day.exercises.map((pe) => {
                const ex = getExerciseById(pe.exerciseId);
                if (!ex) return null;
                return (
                  <div key={pe.id} className="list-item">
                    <div className="thumb">
                      <ExerciseIcon muscleGroup={ex.muscleGroup} size={26} />
                    </div>
                    <div className="col" style={{ flex: 1, gap: 6 }}>
                      <span className="bold small">{ex.name}</span>
                      <div className="row" style={{ gap: 10 }}>
                        <label className="tiny muted">
                          סטים
                          <input
                            type="number"
                            min={1}
                            className="input"
                            style={{ width: 50, padding: "6px 8px", marginRight: 4 }}
                            value={pe.targetSets}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { targetSets: Number(e.target.value) || 1 })
                            }
                          />
                        </label>
                        <label className="tiny muted">
                          חזרות
                          <input
                            type="number"
                            min={1}
                            className="input"
                            style={{ width: 50, padding: "6px 8px", marginRight: 4 }}
                            value={pe.targetReps}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { targetReps: Number(e.target.value) || 1 })
                            }
                          />
                        </label>
                        <label className="tiny muted">
                          מנוחה (שנ')
                          <input
                            type="number"
                            min={0}
                            step={15}
                            className="input"
                            style={{ width: 58, padding: "6px 8px", marginRight: 4 }}
                            value={pe.restSeconds}
                            onChange={(e) =>
                              updateExercise(day.id, pe.id, { restSeconds: Number(e.target.value) || 0 })
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <button className="btn btn--icon btn--ghost" onClick={() => removeExercise(day.id, pe.id)}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              className="btn btn--ghost btn--block"
              style={{ marginTop: 10 }}
              onClick={() => setPickerDayId(day.id)}
            >
              + הוספת תרגיל
            </button>
          </div>
        ))}

        <button className="btn btn--leather btn--block" onClick={addDay}>
          + הוספת יום אימון
        </button>
      </div>

      <ExercisePickerSheet
        open={pickerDayId !== null}
        onClose={() => setPickerDayId(null)}
        onPick={(exerciseId) => pickerDayId && addExerciseToDay(pickerDayId, exerciseId)}
      />
    </div>
  );
}
