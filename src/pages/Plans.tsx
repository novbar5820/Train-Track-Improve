import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, uid } from "../db/db";
import { EXERCISES, MUSCLE_GROUP_LABELS } from "../data/exercises";
import { buildSessionExercises } from "../utils/session";
import { getActivePlan, dayCompletionPct } from "../utils/workoutStats";
import { startOfWeek, endOfWeek } from "../utils/date";
import { IconPlus, IconChevronDown, IconTrash } from "../components/Icons";
import { TrainingDayRing } from "../components/TrainingDayRing";
import type { WorkoutPlan, WorkoutSession, PlanDay } from "../types";

const DAY_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

export function Plans() {
  const navigate = useNavigate();
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const plans = useLiveQuery(() => db.plans.orderBy("createdAt").reverse().toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const activePlan = plans ? getActivePlan(plans, sessions) : null;
  const [openPlanId, setOpenPlanId] = useState<string | null | undefined>(undefined);
  const effectiveOpenId = openPlanId === undefined ? (activePlan?.id ?? null) : openPlanId;

  function findWeekSession(planId: string, dayId: string): WorkoutSession | null {
    const start = startOfWeek(new Date(), settings.weekStartDay).getTime();
    const end = endOfWeek(new Date(), settings.weekStartDay).getTime();
    const candidates = sessions
      .filter((s) => s.planId === planId && s.dayId === dayId && s.startedAt >= start && s.startedAt <= end)
      .sort((a, b) => b.startedAt - a.startedAt);
    return candidates[0] ?? null;
  }

  async function startNewSession(plan: WorkoutPlan, day: PlanDay) {
    const exercises = buildSessionExercises(day, sessions);
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
      <div className="row-between">
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.7px" }}>תוכניות אימונים</span>
        <button className="btn btn--leather btn--icon" style={{ borderRadius: 15 }} onClick={() => navigate("/plans/new")}>
          <IconPlus size={26} color="#fff" strokeWidth={3.2} />
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
        {plans?.map((plan) => {
          const isActive = plan.id === activePlan?.id;
          const isOpen = plan.id === effectiveOpenId;
          return (
            <div
              key={plan.id}
              className="card"
              style={{
                border: isActive ? "3px solid var(--brown)" : "2.5px solid var(--line)",
                borderRadius: 24,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: isOpen ? 12 : 0,
                transition: "gap .2s ease",
              }}
            >
              <div className="row" style={{ gap: 12, cursor: "pointer" }} onClick={() => setOpenPlanId(isOpen ? null : plan.id)}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    background: isActive ? "var(--brown)" : "var(--surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#fff" : "var(--brown-2)"} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4h9l3 3v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1zM9 12h6M9 16h6M9 8h3" />
                  </svg>
                </div>
                <div className="col" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.4px" }}>{plan.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>{plan.days.length} ימי אימון</span>
                </div>
                {isActive && <span className="chip chip--gold" style={{ padding: "5px 11px", fontSize: 13 }}>פעילה</span>}
                <span style={{ display: "flex", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .26s cubic-bezier(.2,.85,.3,1)" }}>
                  <IconChevronDown size={24} color="var(--muted)" strokeWidth={3} />
                </span>
              </div>

              {isOpen && (
                <div className="col" style={{ gap: 8 }}>
                  {plan.days.map((day, i) => {
                    const pct = dayCompletionPct(plan.id, day, sessions, settings.weekStartDay);
                    const weekSession = findWeekSession(plan.id, day.id);
                    const label = !weekSession ? "התחל" : weekSession.finishedAt ? "שוב" : "המשך";
                    return (
                      <div key={day.id} className="row" style={{ gap: 11, border: "2.5px solid var(--line)", borderRadius: 18, padding: "9px 11px" }}>
                        <TrainingDayRing letter={DAY_LETTERS[i] ?? "?"} pct={pct} size={38} />
                        <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: 17, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {day.name}
                          </span>
                          <span className="tiny muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                          className={label === "המשך" ? "btn btn--leather" : "btn btn--ghost"}
                          style={{ height: 40, padding: "0 16px", fontSize: 15, borderRadius: 14 }}
                          disabled={day.exercises.length === 0}
                          onClick={() =>
                            weekSession && !weekSession.finishedAt
                              ? navigate(`/session/${weekSession.id}`)
                              : startNewSession(plan, day)
                          }
                        >
                          {label}
                        </button>
                      </div>
                    );
                  })}
                  {plan.days.length === 0 && <span className="small muted">אין ימי אימון בתוכנית זו</span>}
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn--ghost" style={{ flex: 1, height: 44, borderRadius: 15, fontSize: 16 }} onClick={() => navigate(`/plans/${plan.id}`)}>
                      עריכת תוכנית
                    </button>
                    <button
                      className="btn btn--ghost"
                      style={{ width: 52, height: 44, borderRadius: 15, borderColor: "var(--line-2)" }}
                      onClick={() => deletePlan(plan.id)}
                    >
                      <IconTrash size={21} color="var(--muted)" strokeWidth={2.8} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
