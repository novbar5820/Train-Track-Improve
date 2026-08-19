import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS } from "../db/db";
import { getExerciseById } from "../data/exercises";
import { summarizeWeeklyExercises } from "../utils/workoutStats";
import { compareWeeklyWeight, encouragementMessage } from "../utils/weightStats";
import { macrosForLogEntry, sumMacros } from "../utils/nutrition";
import { todayStr } from "../utils/date";
import { ProgressRing } from "../components/ProgressRing";

export function Dashboard() {
  const navigate = useNavigate();
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const weightEntries = useLiveQuery(() => db.weightLog.toArray(), []) ?? [];
  const todayLog = useLiveQuery(() => db.foodLog.where("date").equals(todayStr()).toArray(), []) ?? [];

  const weekly = summarizeWeeklyExercises(sessions, settings.weekStartDay);
  const weightCmp = compareWeeklyWeight(weightEntries, settings.weekStartDay);

  const todayMacros = sumMacros(todayLog.map(macrosForLogEntry));
  const calGoal = settings.nutritionGoals.calories;
  const calPct = calGoal > 0 ? (todayMacros.calories / calGoal) * 100 : 0;

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: 0 }}>
        <h2 className="topbar__title">שלום! 💪</h2>
      </div>

      <div className="card card--gold">
        <div className="row-between">
          <div className="col">
            <span className="small muted">קלוריות היום</span>
            <span style={{ fontSize: "1.6rem", fontWeight: 800 }}>
              {Math.round(todayMacros.calories)} <span className="small muted">/ {calGoal}</span>
            </span>
            <button className="link-btn" style={{ padding: 0 }} onClick={() => navigate("/nutrition")}>
              למעקב תזונה ←
            </button>
          </div>
          <ProgressRing pct={calPct} size={76}>
            <span className="bold small">{Math.round(calPct)}%</span>
          </ProgressRing>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>סיכום שבועי - אימונים</h3>
        {weekly.topImprovers.length === 0 ? (
          <p className="small muted">
            עוד אין מספיק נתונים להשוואה שבועית. התחל/י להתאמן כדי לראות כאן את ההתקדמות שלך!
          </p>
        ) : (
          <div className="col" style={{ gap: 10 }}>
            <span className="small bold">התרגילים עם השיפור הגדול ביותר:</span>
            {weekly.topImprovers.map((c) => {
              const def = getExerciseById(c.exerciseId);
              return (
                <div key={c.exerciseId} className="row-between">
                  <span className="small">{def?.name ?? c.exerciseId}</span>
                  <span className="chip chip--good">+{c.pctChange.toFixed(1)}%</span>
                </div>
              );
            })}
            {weekly.leastImproved && (
              <>
                <hr className="divider" />
                <span className="small bold">מקום לשיפור:</span>
                <div className="row-between">
                  <span className="small">
                    {getExerciseById(weekly.leastImproved.exerciseId)?.name ?? weekly.leastImproved.exerciseId}
                  </span>
                  <span className={`chip ${weekly.leastImproved.pctChange < 0 ? "chip--bad" : ""}`}>
                    {weekly.leastImproved.pctChange > 0 ? "+" : ""}
                    {weekly.leastImproved.pctChange.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>מגמת משקל שבועית</h3>
        {weightCmp.thisWeekAvg !== null ? (
          <div className="col" style={{ gap: 6 }}>
            <span className="small">
              ממוצע השבוע: <b>{weightCmp.thisWeekAvg.toFixed(1)} ק"ג</b>
              {weightCmp.lastWeekAvg !== null && (
                <span className="muted"> (שבוע קודם: {weightCmp.lastWeekAvg.toFixed(1)} ק"ג)</span>
              )}
            </span>
            <p className="small" style={{ color: "var(--gold-text)" }}>{encouragementMessage(weightCmp)}</p>
          </div>
        ) : (
          <p className="small muted">עדיין לא הוזנו שקילות השבוע.</p>
        )}
        <button className="link-btn" style={{ padding: "8px 0 0" }} onClick={() => navigate("/weight")}>
          ליומן המשקל ←
        </button>
      </div>

      <button className="btn btn--leather btn--block" onClick={() => navigate("/plans")}>
        לתוכניות האימונים
      </button>
    </div>
  );
}
