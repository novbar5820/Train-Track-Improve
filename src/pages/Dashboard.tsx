import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, uid } from "../db/db";
import {
  getActivePlan,
  dayCompletionPct,
  pickTodaysDayIndex,
  estimateWorkoutMinutes,
  weeklyVolumeSeries,
} from "../utils/workoutStats";
import { buildSessionExercises } from "../utils/session";
import { compareWeeklyWeight } from "../utils/weightStats";
import { macrosForLogEntry, sumMacros } from "../utils/nutrition";
import { todayStr, greetingForHour, hebrewWeekdayShort } from "../utils/date";
import { IconDumbbell, IconFire, IconScale, IconArrowUp, IconArrowDown, IconPlay } from "../components/Icons";
import { TrainingDayRing } from "../components/TrainingDayRing";
import type { WorkoutPlan, WorkoutSession } from "../types";

const DAY_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];
const VOLUME_COLORS = ["#F3EBE2", "#F3EBE2", "#EBDDCE", "#C9AE97", "#8C5A35", "#6B4526"];

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} טון`;
  return `${Math.round(kg)} ק"ג`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const plans = useLiveQuery(() => db.plans.toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const weightEntries = useLiveQuery(() => db.weightLog.orderBy("date").toArray(), []) ?? [];
  const todayLog = useLiveQuery(() => db.foodLog.where("date").equals(todayStr()).toArray(), []) ?? [];

  const now = new Date();
  const greeting = greetingForHour(now.getHours());

  const todayMacros = sumMacros(todayLog.map(macrosForLogEntry));
  const calGoal = settings.nutritionGoals.calories;
  const calPct = calGoal > 0 ? (todayMacros.calories / calGoal) * 100 : 0;

  const weightCmp = compareWeeklyWeight(weightEntries, settings.weekStartDay);
  const latestWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;

  const activePlan = getActivePlan(plans, sessions);
  const volumeSeries = weeklyVolumeSeries(sessions, settings.weekStartDay, 6);
  const maxVolume = Math.max(...volumeSeries, 1);
  const prevWeekVolume = volumeSeries[volumeSeries.length - 2] ?? 0;
  const lastWeekVolume = volumeSeries[volumeSeries.length - 1] ?? 0;
  const volumeChangePct = prevWeekVolume > 0 ? ((lastWeekVolume - prevWeekVolume) / prevWeekVolume) * 100 : null;

  async function startTodaysWorkout(plan: WorkoutPlan, dayIndex: number) {
    const day = plan.days[dayIndex];
    if (!day) return;
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

  return (
    <div className="screen">
      <div className="row-between">
        <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.8px" }}>{greeting}</span>
        <div className="row" style={{ gap: 8 }}>
          {activePlan?.days.slice(0, 4).map((day, i) => {
            const pct = dayCompletionPct(activePlan.id, day, sessions, settings.weekStartDay);
            return <TrainingDayRing key={day.id} letter={DAY_LETTERS[i]} pct={pct} />;
          })}
        </div>
      </div>

      {!activePlan ? (
        <div className="empty-state">
          <p className="bold">עדיין אין תוכנית אימונים</p>
          <p className="small">בנה/י תוכנית ראשונה כדי להתחיל להתאמן</p>
          <button className="btn btn--leather" onClick={() => navigate("/plans/new")}>
            בניית תוכנית
          </button>
        </div>
      ) : (
        (() => {
          const dayIndex = pickTodaysDayIndex(activePlan, sessions);
          const day = activePlan.days[dayIndex];
          if (!day) return null;
          const minutes = estimateWorkoutMinutes(day);
          const predicted = buildSessionExercises(day, sessions);
          const targetVolume = predicted.reduce(
            (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
            0
          );
          return (
            <div className="card card--gold" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="row" style={{ gap: 14 }}>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 20,
                    background: "var(--brown)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconDumbbell size={34} color="#fff" strokeWidth={2.8} />
                </div>
                <div className="col" style={{ gap: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--brown-2)" }}>
                    עכשיו · {hebrewWeekdayShort(now)}
                  </span>
                  <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1 }}>{day.name}</span>
                </div>
              </div>

              <div className="row" style={{ gap: 20 }}>
                <div className="col" style={{ flex: 1, alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>תרגילים</span>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>{day.exercises.length}</span>
                </div>
                <span style={{ width: 2, height: 36, background: "var(--line-2)" }} />
                <div className="col" style={{ flex: 1, alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>זמן משוער</span>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>{minutes} דק'</span>
                </div>
                <span style={{ width: 2, height: 36, background: "var(--line-2)" }} />
                <div className="col" style={{ flex: 1, alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>נפח יעד</span>
                  <span style={{ fontSize: 26, fontWeight: 800 }}>{formatVolume(targetVolume)}</span>
                </div>
              </div>

              <button
                className="btn btn--leather"
                style={{ height: 72, borderRadius: 22, fontSize: 24, position: "relative", overflow: "hidden" }}
                onClick={() => startTodaysWorkout(activePlan, dayIndex)}
              >
                <IconPlay size={30} color="#fff" />
                יאללה, מתחילים
                <span
                  style={{
                    position: "absolute",
                    top: "-20%",
                    bottom: "-20%",
                    width: 52,
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,247,210,.55) 40%,rgba(255,255,255,.8) 52%,transparent)",
                    animation: "goldSweep 3.6s cubic-bezier(.62,.03,.96,.36) infinite",
                  }}
                />
              </button>
            </div>
          );
        })()
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ borderWidth: "2.5px", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconFire size={22} color="var(--brown-2)" />
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-2)" }}>קלוריות</span>
          </div>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px" }}>{Math.round(todayMacros.calories)}</span>
          <span className="bar">
            <span className="bar__fill" style={{ width: `${Math.min(100, calPct)}%` }} />
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            {Math.round(calPct)}% מ-{calGoal}
          </span>
        </div>

        <div className="card" style={{ borderWidth: "2.5px", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconScale size={22} color="var(--brown-2)" />
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-2)" }}>משקל</span>
          </div>
          <div className="row" style={{ gap: 6, alignItems: "baseline" }}>
            <span dir="ltr" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-1px" }}>
              {latestWeight ? latestWeight.weightKg.toFixed(1) : "—"}
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink-2)" }}>ק"ג</span>
          </div>
          {weightCmp.deltaKg !== null ? (
            <span
              className="row"
              style={{
                alignSelf: "flex-start",
                gap: 4,
                padding: "5px 11px",
                borderRadius: 99,
                border: "2px solid var(--line)",
                fontSize: 14,
                fontWeight: 800,
                color: "var(--brown)",
              }}
            >
              {weightCmp.deltaKg >= 0 ? <IconArrowUp size={15} color="var(--brown)" /> : <IconArrowDown size={15} color="var(--brown)" />}
              <span dir="ltr">{Math.abs(weightCmp.deltaKg).toFixed(1)} ק"ג</span>
            </span>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>אין עדיין השוואה</span>
          )}
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>מול שבוע קודם</span>
        </div>
      </div>

      <div className="card" style={{ borderWidth: "2.5px", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 19, fontWeight: 800 }}>נפח אימונים · 6 שבועות</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 104, paddingTop: 26, boxSizing: "border-box" }}>
          {volumeSeries.map((v, i) => {
            const pct = maxVolume > 0 ? Math.max(6, (v / maxVolume) * 100) : 6;
            const isLast = i === volumeSeries.length - 1;
            return (
              <span
                key={i}
                style={{
                  flex: 1,
                  height: `${pct}%`,
                  borderRadius: "8px 8px 3px 3px",
                  background: VOLUME_COLORS[i] ?? VOLUME_COLORS[VOLUME_COLORS.length - 1],
                  position: "relative",
                }}
              >
                {isLast && volumeChangePct !== null && (
                  <span
                    dir="ltr"
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 7px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--gold-text)",
                      whiteSpace: "nowrap",
                      background: "var(--gold)",
                    }}
                  >
                    {volumeChangePct >= 0 ? "+" : ""}
                    {Math.round(volumeChangePct)}%
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
