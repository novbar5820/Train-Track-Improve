import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, uid } from "../db/db";
import { todayStr, startOfWeek, parseDateStr, formatShort } from "../utils/date";
import { compareWeeklyWeight, encouragementMessage } from "../utils/weightStats";
import { AreaChart } from "../components/AreaChart";
import type { WeightEntry } from "../types";

export function WeightJournal() {
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const entries = useLiveQuery(() => db.weightLog.orderBy("date").toArray(), []) ?? [];

  const [date, setDate] = useState(todayStr());
  const existing = entries.find((e) => e.date === date);
  const [weight, setWeight] = useState<string>(existing?.weightKg?.toString() ?? "");

  const cmp = compareWeeklyWeight(entries, settings.weekStartDay);

  const weeklyPoints = useMemo(() => {
    const byWeek = new Map<string, number[]>();
    for (const e of entries) {
      const key = startOfWeek(parseDateStr(e.date), settings.weekStartDay).getTime().toString();
      const arr = byWeek.get(key) ?? [];
      arr.push(e.weightKg);
      byWeek.set(key, arr);
    }
    return Array.from(byWeek.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([key, values]) => ({
        label: formatShort(new Date(Number(key))),
        value: values.reduce((s, v) => s + v, 0) / values.length,
      }));
  }, [entries, settings.weekStartDay]);

  async function save() {
    const w = Number(weight);
    if (!w || w <= 0) {
      alert("יש להזין משקל תקין");
      return;
    }
    const entry: WeightEntry = { id: existing?.id ?? uid(), date, weightKg: w };
    await db.weightLog.put(entry);
  }

  async function removeEntry(id: string) {
    await db.weightLog.delete(id);
  }

  function selectDate(d: string) {
    setDate(d);
    const e = entries.find((x) => x.date === d);
    setWeight(e?.weightKg?.toString() ?? "");
  }

  const recent = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 14);

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: 0 }}>
        <h2 className="topbar__title">יומן משקל</h2>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label className="field__label">תאריך</label>
            <input type="date" className="input" value={date} onChange={(e) => selectDate(e.target.value)} max={todayStr()} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="field__label">משקל (ק"ג)</label>
            <input
              type="number"
              step={0.1}
              className="input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
            />
          </div>
        </div>
        <button className="btn btn--gold btn--block" style={{ marginTop: 12 }} onClick={save}>
          {existing ? "עדכון שקילה" : "שמירת שקילה"}
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>ממוצע שבועי</h3>
        <AreaChart points={weeklyPoints} />
        {cmp.thisWeekAvg !== null && (
          <div className="col" style={{ gap: 4, marginTop: 10 }}>
            <span className="small">
              ממוצע השבוע: <b>{cmp.thisWeekAvg.toFixed(1)} ק"ג</b>
              {cmp.deltaKg !== null && (
                <span className={cmp.deltaKg <= 0 ? "chip chip--good" : "chip chip--bad"} style={{ marginRight: 8 }}>
                  {cmp.deltaKg > 0 ? "+" : ""}
                  {cmp.deltaKg.toFixed(1)} ק"ג
                </span>
              )}
            </span>
            <p className="small" style={{ color: "var(--gold-text)" }}>
              {encouragementMessage(cmp)}
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>שקילות אחרונות</h3>
        <div className="col" style={{ gap: 6 }}>
          {recent.map((e) => (
            <div key={e.id} className="row-between">
              <span className="small">{e.date}</span>
              <div className="row" style={{ gap: 10 }}>
                <span className="bold small">{e.weightKg.toFixed(1)} ק"ג</span>
                <button className="link-btn" style={{ color: "var(--bad)" }} onClick={() => removeEntry(e.id)}>
                  מחיקה
                </button>
              </div>
            </div>
          ))}
          {recent.length === 0 && <div className="empty-state small">עדיין אין שקילות רשומות</div>}
        </div>
      </div>
    </div>
  );
}
