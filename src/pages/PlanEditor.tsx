import { useEffect, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { db, uid } from "../db/db";
import { ExercisePickerSheet } from "../components/ExercisePickerSheet";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { IconGrip } from "../components/Icons";
import { getExerciseById } from "../data/exercises";
import type { WorkoutPlan, PlanDay, PlanExercise } from "../types";

// Press-and-hold before a drag starts, like rearranging apps on a phone; a quick swipe still scrolls the page.
const LONG_PRESS = { delay: 280, tolerance: 8 };

const lockToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

// Keeps a long press on an input/button from starting a drag.
const stop = (e: SyntheticEvent) => e.stopPropagation();
const noDrag = { onMouseDown: stop, onTouchStart: stop };

function emptyPlan(): WorkoutPlan {
  return { id: uid(), name: "", days: [], createdAt: Date.now() };
}

function SortableExerciseRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className="list-item"
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: [transition, "scale .15s ease", "box-shadow .15s ease"].filter(Boolean).join(", "),
        scale: isDragging ? "1.03" : "1",
        position: "relative",
        zIndex: isDragging ? 10 : undefined,
        borderColor: isDragging ? "var(--brown)" : undefined,
        boxShadow: isDragging ? "0 16px 32px -14px rgba(74,52,16,.5)" : "none",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {children}
    </div>
  );
}

export function PlanEditor() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<WorkoutPlan>(emptyPlan());
  const [loaded, setLoaded] = useState(!planId);
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: LONG_PRESS }),
    useSensor(TouchSensor, { activationConstraint: LONG_PRESS })
  );

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
    if (!confirm("למחוק את יום האימון הזה ואת כל התרגילים שבו?")) return;
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

  function reorderExercises(dayId: string, { active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    updateDay(dayId, (d) => {
      const from = d.exercises.findIndex((e) => e.id === active.id);
      const to = d.exercises.findIndex((e) => e.id === over.id);
      if (from < 0 || to < 0) return d;
      return { ...d, exercises: arrayMove(d.exercises, from, to) };
    });
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

            {day.exercises.length > 1 && (
              <span className="tiny muted" style={{ display: "block", marginBottom: 8 }}>
                לחיצה ארוכה על תרגיל וגרירה כדי לשנות את הסדר
              </span>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[lockToVerticalAxis]}
              onDragStart={() => navigator.vibrate?.(12)}
              onDragEnd={(e) => reorderExercises(day.id, e)}
            >
              <SortableContext items={day.exercises.map((pe) => pe.id)} strategy={verticalListSortingStrategy}>
                <div className="col" style={{ gap: 8 }}>
                  {day.exercises.map((pe) => {
                    const ex = getExerciseById(pe.exerciseId);
                    if (!ex) return null;
                    return (
                      <SortableExerciseRow key={pe.id} id={pe.id}>
                        <span style={{ display: "flex", flexShrink: 0, marginInline: -4 }}>
                          <IconGrip size={20} color="var(--tint-2)" />
                        </span>
                        <div className="thumb">
                          <ExerciseIcon muscleGroup={ex.muscleGroup} size={26} />
                        </div>
                        <div className="col" style={{ flex: 1, gap: 6 }}>
                          <span className="bold small">{ex.name}</span>
                          <div className="row" style={{ gap: 10 }} {...noDrag}>
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
                        <button className="btn btn--icon btn--ghost" {...noDrag} onClick={() => removeExercise(day.id, pe.id)}>
                          ✕
                        </button>
                      </SortableExerciseRow>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

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
