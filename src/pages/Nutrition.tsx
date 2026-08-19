import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, uid } from "../db/db";
import { FoodSearchSheet } from "../components/FoodSearchSheet";
import { getFoodById } from "../data/foods";
import { macrosForLogEntry, sumMacros } from "../utils/nutrition";
import { toDateStr, addDays, parseDateStr, todayStr } from "../utils/date";
import type { FoodItem } from "../types";

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div className="col" style={{ gap: 4 }}>
      <div className="row-between">
        <span className="tiny bold">{label}</span>
        <span className="tiny muted">
          {Math.round(value)} / {Math.round(goal)} גרם
        </span>
      </div>
      <div className="bar">
        <div className="bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function Nutrition() {
  const [date, setDate] = useState(todayStr());
  const [pickerOpen, setPickerOpen] = useState(false);
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const entries = useLiveQuery(() => db.foodLog.where("date").equals(date).toArray(), [date]) ?? [];

  const macros = sumMacros(entries.map(macrosForLogEntry));
  const goals = settings.nutritionGoals;

  async function addEntry(food: FoodItem, quantity: number, unitId: string) {
    await db.foodLog.put({ id: uid(), date, foodId: food.id, quantity, unitId, createdAt: Date.now() });
  }

  async function removeEntry(id: string) {
    await db.foodLog.delete(id);
  }

  const isToday = date === todayStr();

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: 0 }}>
        <h2 className="topbar__title">תזונה יומית</h2>
      </div>

      <div className="row-between">
        <button className="btn btn--icon btn--ghost" onClick={() => setDate(toDateStr(addDays(parseDateStr(date), -1)))}>
          →
        </button>
        <span className="bold">{isToday ? "היום" : date}</span>
        <button
          className="btn btn--icon btn--ghost"
          disabled={isToday}
          onClick={() => setDate(toDateStr(addDays(parseDateStr(date), 1)))}
        >
          ←
        </button>
      </div>

      <div className="card card--gold">
        <div className="row-between" style={{ marginBottom: 10 }}>
          <span className="small bold">קלוריות</span>
          <span className="bold" style={{ fontSize: "1.2rem" }}>
            {Math.round(macros.calories)} <span className="small muted">/ {goals.calories}</span>
          </span>
        </div>
        <div className="bar" style={{ marginBottom: 14 }}>
          <div className="bar__fill" style={{ width: `${Math.min(100, (macros.calories / goals.calories) * 100)}%` }} />
        </div>
        <div className="col" style={{ gap: 10 }}>
          <MacroBar label="חלבון" value={macros.protein} goal={goals.protein} color="#8c5a35" />
          <MacroBar label="שומן" value={macros.fat} goal={goals.fat} color="#a9781f" />
          <MacroBar label="פחמימה" value={macros.carbs} goal={goals.carbs} color="#6f7d3f" />
        </div>
      </div>

      <button className="btn btn--leather btn--block" onClick={() => setPickerOpen(true)}>
        + הוספת מאכל
      </button>

      <div className="col" style={{ gap: 8 }}>
        {entries.map((entry) => {
          const food = getFoodById(entry.foodId);
          const unit = food?.units.find((u) => u.id === entry.unitId);
          const m = macrosForLogEntry(entry);
          if (!food) return null;
          return (
            <div key={entry.id} className="list-item">
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <span className="bold small">{food.name}</span>
                <span className="tiny muted">
                  {entry.quantity} {unit?.label ?? "גרם"} · {Math.round(m.calories)} קק"ל
                </span>
              </div>
              <button className="link-btn" style={{ color: "var(--bad)" }} onClick={() => removeEntry(entry.id)}>
                מחיקה
              </button>
            </div>
          );
        })}
        {entries.length === 0 && <div className="empty-state small">עדיין לא נוסף מאכל ליום זה</div>}
      </div>

      <FoodSearchSheet open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addEntry} />
    </div>
  );
}
