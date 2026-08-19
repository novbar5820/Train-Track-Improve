import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS } from "../db/db";
import { WEEKDAY_LABELS_HE } from "../utils/date";
import { calcNutritionGoals, ACTIVITY_LABELS, GOAL_LABELS } from "../utils/tdee";
import type { ActivityLevel, Goal, NutritionGoals, WeekStartDay } from "../types";

export function Settings() {
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;

  const [goals, setGoals] = useState<NutritionGoals>(settings.nutritionGoals);
  useEffect(() => setGoals(settings.nutritionGoals), [settings.nutritionGoals]);

  const [age, setAge] = useState(settings.calcProfile?.age ?? 28);
  const [gender, setGender] = useState<"male" | "female">(settings.calcProfile?.gender ?? "male");
  const [heightCm, setHeightCm] = useState(settings.calcProfile?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(settings.calcProfile?.weightKg ?? 75);
  const [activity, setActivity] = useState<ActivityLevel>(settings.calcProfile?.activity ?? "moderate");
  const [goal, setGoal] = useState<Goal>(settings.calcProfile?.goal ?? "maintain");

  async function setWeekStartDay(day: WeekStartDay) {
    await db.settings.put({ ...settings, weekStartDay: day });
  }

  async function saveGoalsManually() {
    await db.settings.put({ ...settings, nutritionGoals: goals });
    alert("היעדים עודכנו");
  }

  async function calcAndApply() {
    const computed = calcNutritionGoals({ age, gender, heightCm, weightKg, activity, goal });
    setGoals(computed);
    await db.settings.put({
      ...settings,
      nutritionGoals: computed,
      calcProfile: { age, gender, heightCm, weightKg, activity, goal },
    });
    alert("היעדים חושבו ועודכנו בהתאם לנתונים שהזנת");
  }

  async function resetAllData() {
    if (!confirm("פעולה זו תמחק את כל הנתונים (תוכניות, אימונים, תזונה, משקל). להמשיך?")) return;
    await Promise.all([
      db.plans.clear(),
      db.sessions.clear(),
      db.foodLog.clear(),
      db.weightLog.clear(),
    ]);
    alert("כל הנתונים אופסו");
  }

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: 0 }}>
        <h2 className="topbar__title">הגדרות</h2>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>תחילת השבוע</h3>
        <p className="small muted" style={{ marginBottom: 10 }}>
          קובע כיצד מחושבים הסיכומים השבועיים (אימונים ומשקל)
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {WEEKDAY_LABELS_HE.map((label, idx) => (
            <button
              key={label}
              className="chip"
              style={settings.weekStartDay === idx ? { background: "var(--gold-line)", color: "#4a3410" } : undefined}
              onClick={() => setWeekStartDay(idx as WeekStartDay)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>מחשבון יעד קלוריות ומאקרו</h3>
        <div className="col" style={{ gap: 10 }}>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">גיל</label>
              <input type="number" className="input" value={age} onChange={(e) => setAge(Number(e.target.value) || 0)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">מין</label>
              <select className="input" value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">גובה (ס"מ)</label>
              <input type="number" className="input" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value) || 0)} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">משקל נוכחי (ק"ג)</label>
              <input type="number" className="input" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className="field">
            <label className="field__label">רמת פעילות</label>
            <select className="input" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
              {Object.entries(ACTIVITY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label">מטרה</label>
            <select className="input" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
              {Object.entries(GOAL_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn--gold btn--block" onClick={calcAndApply}>
            חישוב ועדכון יעדים
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>יעדים יומיים (ניתן לערוך ידנית)</h3>
        <div className="col" style={{ gap: 10 }}>
          <div className="field">
            <label className="field__label">קלוריות</label>
            <input
              type="number"
              className="input"
              value={goals.calories}
              onChange={(e) => setGoals((g) => ({ ...g, calories: Number(e.target.value) || 0 }))}
            />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">חלבון (גרם)</label>
              <input
                type="number"
                className="input"
                value={goals.protein}
                onChange={(e) => setGoals((g) => ({ ...g, protein: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">שומן (גרם)</label>
              <input
                type="number"
                className="input"
                value={goals.fat}
                onChange={(e) => setGoals((g) => ({ ...g, fat: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">פחמימה (גרם)</label>
              <input
                type="number"
                className="input"
                value={goals.carbs}
                onChange={(e) => setGoals((g) => ({ ...g, carbs: Number(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <button className="btn btn--ghost btn--block" onClick={saveGoalsManually}>
            שמירת יעדים
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>ניהול נתונים</h3>
        <button className="btn btn--danger btn--block" onClick={resetAllData}>
          איפוס כל הנתונים
        </button>
      </div>
    </div>
  );
}
