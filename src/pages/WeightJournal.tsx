import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, uid } from "../db/db";
import { todayStr, startOfWeek, parseDateStr, formatShort, formatHebrewDate, hebrewWeekdayShort } from "../utils/date";
import { compareWeeklyWeight, encouragementMessage } from "../utils/weightStats";
import { Sheet } from "../components/Sheet";
import { IconCheck, IconClose, IconArrowUp, IconArrowDown } from "../components/Icons";
import type { WeightEntry } from "../types";

function AreaTrendChart({ points }: { points: { label: string; value: number }[] }) {
  const width = 300;
  const height = 104;
  if (points.length === 0) {
    return (
      <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)" }} className="small">
        אין עדיין נתונים
      </div>
    );
  }
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 14;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * stepX : width / 2;
    const y = height - padY - ((p.value - min) / range) * (height - padY * 2);
    return { x, y };
  });
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const last = coords[coords.length - 1];
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: "100%", height: 80 }}>
      <defs>
        <linearGradient id="wArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8C5A35" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#8C5A35" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#wArea)" />
      <path d={linePath} fill="none" stroke="var(--brown)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="7.5" fill="#FFD64B" stroke="var(--brown)" strokeWidth="3" />
    </svg>
  );
}

function entryDateLabel(dateStr: string): string {
  if (dateStr === todayStr()) return "היום";
  const d = parseDateStr(dateStr);
  return `${hebrewWeekdayShort(d)} · ${formatHebrewDate(d)}`;
}

export function WeightJournal() {
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const entries = useLiveQuery(() => db.weightLog.orderBy("date").toArray(), []) ?? [];

  const today = todayStr();
  const existingToday = entries.find((e) => e.date === today);
  const [draft, setDraft] = useState<number>(existingToday?.weightKg ?? entries[entries.length - 1]?.weightKg ?? 70);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setDraft(existingToday?.weightKg ?? entries[entries.length - 1]?.weightKg ?? 70);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingToday?.weightKg]);

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

  const withDeltas = useMemo(() => {
    const asc = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
    return asc.map((e, i) => ({ entry: e, delta: i > 0 ? e.weightKg - asc[i - 1].weightKg : null }));
  }, [entries]);

  const recentDesc = [...withDeltas].sort((a, b) => (a.entry.date < b.entry.date ? 1 : -1));

  async function save() {
    const entry: WeightEntry = { id: existingToday?.id ?? uid(), date: today, weightKg: draft };
    await db.weightLog.put(entry);
  }

  async function removeEntry(id: string) {
    await db.weightLog.delete(id);
  }

  return (
    <div className="screen">
      <div className="row-between">
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.7px" }}>יומן משקל</span>
        <span style={{ padding: "8px 14px", borderRadius: 14, border: "2.5px solid var(--line)", fontSize: 15, fontWeight: 800, color: "var(--brown)" }}>
          {formatHebrewDate(new Date())}
        </span>
      </div>

      <div className="card card--gold" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-2)" }}>השקילה של היום</span>
        <div className="row-between" style={{ gap: 10 }}>
          <button
            style={{ width: 52, height: 52, borderRadius: 17, border: "2.5px solid var(--line)", background: "#fff", fontSize: 28, fontWeight: 800, color: "var(--brown)", cursor: "pointer", lineHeight: 1 }}
            onClick={() => setDraft((d) => Math.max(0, Math.round((d - 0.1) * 10) / 10))}
          >
            −
          </button>
          <div className="row" style={{ gap: 7, alignItems: "baseline" }}>
            <span dir="ltr" style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {draft.toFixed(1)}
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-2)" }}>ק"ג</span>
          </div>
          <button
            style={{ width: 52, height: 52, borderRadius: 17, border: "2.5px solid var(--line)", background: "#fff", fontSize: 28, fontWeight: 800, color: "var(--brown)", cursor: "pointer", lineHeight: 1 }}
            onClick={() => setDraft((d) => Math.round((d + 0.1) * 10) / 10)}
          >
            +
          </button>
        </div>
        <button className="btn btn--leather" style={{ height: 58, borderRadius: 19, fontSize: 19 }} onClick={save}>
          <IconCheck size={24} color="#fff" strokeWidth={3} />
          {existingToday ? "עדכון שקילה" : "שמירת שקילה"}
        </button>
      </div>

      <div className="card" style={{ borderWidth: "2.5px", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="row-between" style={{ alignItems: "baseline" }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>ממוצע שבועי</span>
          <div className="row" style={{ gap: 8, alignItems: "baseline" }}>
            <span dir="ltr" style={{ fontSize: 22, fontWeight: 800 }}>
              {cmp.thisWeekAvg !== null ? cmp.thisWeekAvg.toFixed(1) : "—"}
            </span>
            {cmp.deltaKg !== null && (
              <span
                dir="ltr"
                style={{ padding: "4px 10px", borderRadius: 99, fontSize: 14, fontWeight: 800, color: "var(--gold-text)", background: "var(--gold)", whiteSpace: "nowrap" }}
              >
                {cmp.deltaKg > 0 ? "+" : ""}
                {cmp.deltaKg.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <AreaTrendChart points={weeklyPoints} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--brown-2)" }}>{encouragementMessage(cmp)}</span>
      </div>

      <div className="row-between">
        <span style={{ fontSize: 18, fontWeight: 800 }}>שקילות אחרונות</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink-2)" }}>{entries.length} שקילות</span>
      </div>

      <div className="col" style={{ gap: 8 }}>
        {recentDesc.slice(0, 2).map(({ entry, delta }) => (
          <div key={entry.id} className="row" style={{ gap: 10, border: "2.5px solid var(--line)", borderRadius: 18, padding: "9px 12px" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-2)", flex: 1 }}>{entryDateLabel(entry.date)}</span>
            <span dir="ltr" style={{ fontSize: 19, fontWeight: 800 }}>{entry.weightKg.toFixed(1)}</span>
            {delta !== null && (
              <span
                dir="ltr"
                className="row"
                style={{ gap: 3, padding: "3px 9px", borderRadius: 99, border: "2px solid var(--line)", fontSize: 13, fontWeight: 800, color: "var(--brown)", background: delta < 0 ? "#FBF3E0" : "transparent" }}
              >
                {delta >= 0 ? <IconArrowUp size={12} color="var(--brown)" /> : <IconArrowDown size={12} color="var(--brown)" />}
                {Math.abs(delta).toFixed(1)}
              </span>
            )}
            <button
              style={{ width: 36, height: 36, borderRadius: 12, border: "2.5px solid var(--line-2)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              onClick={() => removeEntry(entry.id)}
            >
              <IconClose size={19} color="var(--muted)" strokeWidth={3} />
            </button>
          </div>
        ))}
        {entries.length === 0 && <div className="empty-state small">עדיין אין שקילות רשומות</div>}
        {entries.length > 2 && (
          <button className="btn btn--ghost" style={{ height: 40, borderRadius: 16, fontSize: 15, color: "var(--brown-2)" }} onClick={() => setHistoryOpen(true)}>
            כל ההיסטוריה · עוד {entries.length - 2} שקילות
          </button>
        )}
      </div>

      <Sheet open={historyOpen} onClose={() => setHistoryOpen(false)} tall>
        <div className="sheet-topbar">
          <div className="col" style={{ gap: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>היסטוריית שקילות</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>{entries.length} שקילות</span>
          </div>
          <button className="sheet-close" onClick={() => setHistoryOpen(false)}>
            <IconClose size={24} color="var(--brown)" strokeWidth={3} />
          </button>
        </div>
        <div className="col" style={{ gap: 8, overflowY: "auto", minHeight: 0 }}>
          {recentDesc.map(({ entry, delta }) => (
            <div key={entry.id} className="row" style={{ gap: 10, border: "2.5px solid var(--line)", borderRadius: 18, padding: "10px 12px", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-2)", flex: 1 }}>{entryDateLabel(entry.date)}</span>
              <span dir="ltr" style={{ fontSize: 19, fontWeight: 800 }}>{entry.weightKg.toFixed(1)}</span>
              {delta !== null && (
                <span
                  dir="ltr"
                  className="row"
                  style={{ gap: 3, padding: "3px 9px", borderRadius: 99, border: "2px solid var(--line)", fontSize: 13, fontWeight: 800, color: "var(--brown)", background: delta < 0 ? "#FBF3E0" : "transparent" }}
                >
                  {delta >= 0 ? <IconArrowUp size={12} color="var(--brown)" /> : <IconArrowDown size={12} color="var(--brown)" />}
                  {Math.abs(delta).toFixed(1)}
                </span>
              )}
              <button
                style={{ width: 36, height: 36, borderRadius: 12, border: "2.5px solid var(--line-2)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                onClick={() => removeEntry(entry.id)}
              >
                <IconClose size={19} color="var(--muted)" strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
