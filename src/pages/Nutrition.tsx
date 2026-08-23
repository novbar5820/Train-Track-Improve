import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, uid } from "../db/db";
import { Sheet } from "../components/Sheet";
import { FoodSearchSheet } from "../components/FoodSearchSheet";
import { getFoodById } from "../data/foods";
import { macrosForLogEntry, sumMacros } from "../utils/nutrition";
import { toDateStr, addDays, parseDateStr, todayStr, hebrewWeekdayShort, formatHebrewDate } from "../utils/date";
import { IconChevronBack, IconChevronForward, IconPlus, IconClose } from "../components/Icons";
import type { FoodItem } from "../types";

const RING_C = 239;

function MacroBar({ label, value, goal }: { label: string; value: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  return (
    <div className="col" style={{ gap: 5 }}>
      <div className="row-between" style={{ alignItems: "baseline" }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)", display: "flex", gap: 5 }}>
          <span dir="ltr">
            {Math.round(value)} / {Math.round(goal)}
          </span>
          גרם
        </span>
      </div>
      <span className="bar">
        <span className="bar__fill bar__fill--brown" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

export function Nutrition() {
  const [date, setDate] = useState(todayStr());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const entries = useLiveQuery(() => db.foodLog.where("date").equals(date).toArray(), [date]) ?? [];

  const macros = sumMacros(entries.map(macrosForLogEntry));
  const goals = settings.nutritionGoals;
  const pct = goals.calories > 0 ? Math.min(100, (macros.calories / goals.calories) * 100) : 0;
  const ringOffset = RING_C - (pct / 100) * RING_C;
  const left = Math.max(0, Math.round(goals.calories - macros.calories));

  async function addEntry(food: FoodItem, quantity: number, unitId: string) {
    await db.foodLog.put({ id: uid(), date, foodId: food.id, quantity, unitId, createdAt: Date.now() });
  }

  async function removeEntry(id: string) {
    await db.foodLog.delete(id);
  }

  const isToday = date === todayStr();
  const dateObj = parseDateStr(date);
  const visible = entries.slice(0, 3);
  const hasMore = entries.length > 3;

  return (
    <div className="screen">
      <div className="row-between">
        <button className="topbar__icon-btn" onClick={() => setDate(toDateStr(addDays(dateObj, -1)))}>
          <IconChevronBack size={24} color="var(--brown)" strokeWidth={3} />
        </button>
        <div className="col" style={{ alignItems: "center", gap: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>{isToday ? "היום" : hebrewWeekdayShort(dateObj)}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            {hebrewWeekdayShort(dateObj)} · {formatHebrewDate(dateObj)}
          </span>
        </div>
        <button
          className="topbar__icon-btn"
          disabled={isToday}
          onClick={() => setDate(toDateStr(addDays(dateObj, 1)))}
        >
          <IconChevronForward size={24} color={isToday ? "var(--muted-2)" : "var(--brown)"} strokeWidth={3} />
        </button>
      </div>

      <div className="card" style={{ borderWidth: "2.5px", borderRadius: 24, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="row-between">
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>קלוריות</span>
            <div dir="ltr" className="row" style={{ gap: 6, alignItems: "baseline" }}>
              <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-1.4px", lineHeight: 1 }}>{Math.round(macros.calories)}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--ink-2)" }}>/ {goals.calories}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--brown-2)" }}>נשארו {left} קק"ל</span>
          </div>
          <div style={{ position: "relative", width: 78, height: 78, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="78" height="78" viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="44" cy="44" r="38" fill="none" stroke="var(--surface-2)" strokeWidth="12" />
              <circle
                cx="44"
                cy="44"
                r="38"
                fill="none"
                stroke="url(#goldNut)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset .5s ease" }}
              />
              <defs>
                <linearGradient id="goldNut" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFF7D2" />
                  <stop offset="45%" stopColor="#FFD64B" />
                  <stop offset="100%" stopColor="#F2A91C" />
                </linearGradient>
              </defs>
            </svg>
            <span style={{ position: "absolute", fontSize: 20, fontWeight: 800 }}>{Math.round(pct)}%</span>
          </div>
        </div>

        <div className="col" style={{ gap: 8 }}>
          <MacroBar label="חלבון" value={macros.protein} goal={goals.protein} />
          <MacroBar label="פחמימה" value={macros.carbs} goal={goals.carbs} />
          <MacroBar label="שומן" value={macros.fat} goal={goals.fat} />
        </div>
      </div>

      <button
        className="btn btn--leather btn--block"
        style={{ height: 52, borderRadius: 20, fontSize: 20 }}
        onClick={() => setPickerOpen(true)}
      >
        <IconPlus size={26} color="#fff" />
        הוספת מאכל
      </button>

      <div className="row-between">
        <span style={{ fontSize: 18, fontWeight: 800 }}>מה אכלתי</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-2)" }}>{entries.length} פריטים</span>
      </div>

      <div className="col" style={{ gap: 9 }}>
        {visible.map((entry) => {
          const food = getFoodById(entry.foodId);
          const unit = food?.units.find((u) => u.id === entry.unitId);
          const m = macrosForLogEntry(entry);
          if (!food) return null;
          return (
            <div key={entry.id} className="row" style={{ gap: 10, border: "2.5px solid var(--line)", borderRadius: 18, padding: "9px 12px" }}>
              <div className="col" style={{ flex: 1, gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {food.name}
                </span>
                <span className="tiny muted">
                  {entry.quantity} {unit?.label ?? "גרם"}
                </span>
              </div>
              <span style={{ fontSize: 19, fontWeight: 800, color: "var(--brown)", whiteSpace: "nowrap" }}>
                {Math.round(m.calories)}
              </span>
              <button
                style={{ width: 38, height: 38, borderRadius: 12, border: "2.5px solid var(--line-2)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                onClick={() => removeEntry(entry.id)}
              >
                <IconClose size={20} color="var(--muted)" strokeWidth={3} />
              </button>
            </div>
          );
        })}
        {entries.length === 0 && <div className="empty-state small">עדיין לא נוסף מאכל ליום זה</div>}
        {hasMore && (
          <button
            className="btn btn--ghost"
            style={{ height: 40, borderRadius: 16, fontSize: 15, color: "var(--brown-2)" }}
            onClick={() => setLogOpen(true)}
          >
            כל היומן · עוד {entries.length - 3} פריטים
            <IconChevronForward size={20} color="var(--brown-2)" strokeWidth={3} />
          </button>
        )}
      </div>

      <FoodSearchSheet open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addEntry} />

      <Sheet open={logOpen} onClose={() => setLogOpen(false)} tall>
        <div className="sheet-topbar">
          <div className="col" style={{ gap: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>יומן המאכלים · {isToday ? "היום" : formatHebrewDate(dateObj)}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>
              {entries.length} פריטים · {Math.round(macros.calories)} קק"ל
            </span>
          </div>
          <button className="sheet-close" onClick={() => setLogOpen(false)}>
            <IconClose size={24} color="var(--brown)" strokeWidth={3} />
          </button>
        </div>
        <div className="col" style={{ gap: 9, overflowY: "auto", minHeight: 0 }}>
          {entries.map((entry) => {
            const food = getFoodById(entry.foodId);
            const unit = food?.units.find((u) => u.id === entry.unitId);
            const m = macrosForLogEntry(entry);
            if (!food) return null;
            return (
              <div key={entry.id} className="row" style={{ gap: 10, border: "2.5px solid var(--line)", borderRadius: 18, padding: "10px 12px", flexShrink: 0 }}>
                <div className="col" style={{ flex: 1, gap: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {food.name}
                  </span>
                  <span className="tiny muted">
                    {entry.quantity} {unit?.label ?? "גרם"} · {m.protein.toFixed(1)} גרם חלבון
                  </span>
                </div>
                <span style={{ fontSize: 19, fontWeight: 800, color: "var(--brown)", whiteSpace: "nowrap" }}>
                  {Math.round(m.calories)}
                </span>
                <button
                  style={{ width: 38, height: 38, borderRadius: 12, border: "2.5px solid var(--line-2)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  onClick={() => removeEntry(entry.id)}
                >
                  <IconClose size={20} color="var(--muted)" strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}
