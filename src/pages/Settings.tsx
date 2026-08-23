import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS } from "../db/db";
import { calcNutritionGoals, ACTIVITY_LABELS, GOAL_LABELS } from "../utils/tdee";
import { Sheet } from "../components/Sheet";
import {
  IconCalendarWeek,
  IconGoalFlag,
  IconCalculator,
  IconRuler,
  IconClose,
  IconCheck,
  IconTrash,
  IconWarningTriangle,
  IconChevronForward,
} from "../components/Icons";
import type { ActivityLevel, Goal, NutritionGoals, UnitSystem, WeekStartDay } from "../types";

type SheetKey = "week" | "goals" | "calc" | "units" | "reset" | null;

const WEEK_OPTIONS: { value: WeekStartDay; name: string; short: string; note: string }[] = [
  { value: 6, name: "שבת", short: "ש", note: "השבוע מתחיל בשבת ומסתיים ביום שישי" },
  { value: 0, name: "ראשון", short: "א", note: "השבוע מתחיל בראשון ומסתיים בשבת" },
  { value: 1, name: "שני", short: "ב", note: "השבוע מתחיל בשני ומסתיים בראשון" },
];

const UNIT_OPTIONS: { value: UnitSystem; name: string; short: string; note: string }[] = [
  { value: "metric", name: "מטרי", short: "ק\"ג", note: "קילוגרם, סנטימטר" },
  { value: "imperial", name: "אימפריאלי", short: "lb", note: "פאונד, אינץ'" },
];

function NumRow({
  label,
  value,
  unit,
  step,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="num-row">
      <span style={{ fontSize: 18, fontWeight: 800, flex: 1 }}>{label}</span>
      <button className="num-row__btn" onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}>
        −
      </button>
      <div className="num-row__value">
        <span dir="ltr" style={{ fontSize: 21, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-2)" }}>{unit}</span>
      </div>
      <button className="num-row__btn" onClick={() => onChange(Math.round((value + step) * 100) / 100)}>
        +
      </button>
    </div>
  );
}

function SelectSheetRow({
  active,
  short,
  name,
  note,
  onPick,
}: {
  active: boolean;
  short: string;
  name: string;
  note: string;
  onPick: () => void;
}) {
  return (
    <div
      className="row card--pressable"
      style={{
        gap: 12,
        border: active ? "3px solid var(--brown)" : "2.5px solid var(--line)",
        background: active ? "var(--surface-3)" : "#fff",
        borderRadius: 18,
        padding: "10px 13px",
        cursor: "pointer",
      }}
      onClick={onPick}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 800,
          color: "var(--brown)",
          flexShrink: 0,
        }}
      >
        {short}
      </span>
      <div className="col" style={{ gap: 1, flex: 1 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>{name}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>{note}</span>
      </div>
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? "var(--gold)" : "#fff",
          border: active ? "none" : "2.5px solid var(--line)",
        }}
      >
        <IconCheck size={22} color={active ? "var(--gold-text)" : "var(--muted-2)"} strokeWidth={3.2} />
      </span>
    </div>
  );
}

export function Settings() {
  const settings = useLiveQuery(() => db.settings.get("singleton")) ?? DEFAULT_SETTINGS;
  const [sheet, setSheet] = useState<SheetKey>(null);

  const [goals, setGoals] = useState<NutritionGoals>(settings.nutritionGoals);
  useEffect(() => setGoals(settings.nutritionGoals), [settings.nutritionGoals]);

  const [age, setAge] = useState(settings.calcProfile?.age ?? 28);
  const [gender, setGender] = useState<"male" | "female">(settings.calcProfile?.gender ?? "male");
  const [heightCm, setHeightCm] = useState(settings.calcProfile?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(settings.calcProfile?.weightKg ?? 75);
  const [activity, setActivity] = useState<ActivityLevel>(settings.calcProfile?.activity ?? "moderate");
  const [goal, setGoal] = useState<Goal>(settings.calcProfile?.goal ?? "maintain");

  const calcPreview = calcNutritionGoals({ age, gender, heightCm, weightKg, activity, goal });

  async function setWeekStartDay(day: WeekStartDay) {
    await db.settings.put({ ...settings, weekStartDay: day });
  }

  async function setUnits(units: UnitSystem) {
    await db.settings.put({ ...settings, units });
  }

  async function saveGoals() {
    await db.settings.put({ ...settings, nutritionGoals: goals });
    setSheet(null);
  }

  async function applyCalc() {
    const computed = calcNutritionGoals({ age, gender, heightCm, weightKg, activity, goal });
    setGoals(computed);
    await db.settings.put({
      ...settings,
      nutritionGoals: computed,
      calcProfile: { age, gender, heightCm, weightKg, activity, goal },
    });
    setSheet(null);
  }

  async function resetAllData() {
    await Promise.all([db.plans.clear(), db.sessions.clear(), db.foodLog.clear(), db.weightLog.clear()]);
    setSheet(null);
  }

  const weekOption = WEEK_OPTIONS.find((o) => o.value === settings.weekStartDay);
  const unitOption = UNIT_OPTIONS.find((o) => o.value === settings.units) ?? UNIT_OPTIONS[0];

  const rows = [
    {
      key: "week" as const,
      icon: <IconCalendarWeek size={26} color="var(--brown-2)" strokeWidth={2.8} />,
      title: "הגדרת תחילת שבוע",
      sub: "קובע כיצד מחושבים הסיכומים השבועיים",
      value: weekOption?.name ?? "—",
    },
    {
      key: "goals" as const,
      icon: <IconGoalFlag size={26} color="var(--brown-2)" strokeWidth={2.8} />,
      title: "יעדי תזונה",
      sub: "קלוריות ומאקרו יומיים",
      value: `${goals.calories} קק"ל`,
    },
    {
      key: "calc" as const,
      icon: <IconCalculator size={26} color="var(--brown-2)" strokeWidth={2.8} />,
      title: "מחשבון קלוריות",
      sub: "חישוב יעד לפי הנתונים שלך",
      value: "",
    },
    {
      key: "units" as const,
      icon: <IconRuler size={26} color="var(--brown-2)" strokeWidth={2.8} />,
      title: "יחידות מידה",
      sub: "משקל ואורך בכל האפליקציה",
      value: unitOption.name,
    },
  ];

  return (
    <div className="screen">
      <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.7px" }}>הגדרות</span>

      <div className="col" style={{ gap: 9 }}>
        {rows.map((r) => (
          <div
            key={r.key}
            className="row card--pressable"
            style={{ gap: 12, border: "2.5px solid var(--line)", borderRadius: 20, padding: "11px 13px", cursor: "pointer" }}
            onClick={() => setSheet(r.key)}
          >
            <span style={{ width: 46, height: 46, borderRadius: 15, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {r.icon}
            </span>
            <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 19, fontWeight: 800 }}>{r.title}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.sub}
              </span>
            </div>
            {r.value && (
              <span style={{ padding: "5px 12px", borderRadius: 99, border: "2px solid var(--line)", fontSize: 15, fontWeight: 800, color: "var(--brown)", whiteSpace: "nowrap" }}>
                {r.value}
              </span>
            )}
            <IconChevronForward size={24} color="var(--muted)" strokeWidth={3} />
          </div>
        ))}
      </div>

      <button
        className="btn btn--danger btn--block"
        style={{ height: 54, borderRadius: 18, fontSize: 18, marginTop: "auto" }}
        onClick={() => setSheet("reset")}
      >
        <IconTrash size={23} color="var(--danger)" strokeWidth={2.8} />
        איפוס כל הנתונים
      </button>

      {/* week start */}
      <Sheet open={sheet === "week"} onClose={() => setSheet(null)}>
        <div className="sheet-topbar">
          <div className="col" style={{ gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>הגדרת תחילת שבוע</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>קובע כיצד מחושבים הסיכומים השבועיים של האימונים והמשקל</span>
          </div>
          <button className="sheet-close" onClick={() => setSheet(null)}>
            <IconClose size={24} color="var(--brown)" strokeWidth={3} />
          </button>
        </div>
        <div className="col" style={{ gap: 9 }}>
          {WEEK_OPTIONS.map((o) => (
            <SelectSheetRow key={o.value} active={settings.weekStartDay === o.value} short={o.short} name={o.name} note={o.note} onPick={() => setWeekStartDay(o.value)} />
          ))}
        </div>
        <button className="btn btn--leather" style={{ height: 58, borderRadius: 19, fontSize: 19 }} onClick={() => setSheet(null)}>
          שמירה
        </button>
      </Sheet>

      {/* nutrition goals */}
      <Sheet open={sheet === "goals"} onClose={() => setSheet(null)}>
        <div className="sheet-topbar">
          <div className="col" style={{ gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>יעדי תזונה יומיים</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>היעדים שמופיעים במסך התזונה</span>
          </div>
          <button className="sheet-close" onClick={() => setSheet(null)}>
            <IconClose size={24} color="var(--brown)" strokeWidth={3} />
          </button>
        </div>
        <div className="col" style={{ gap: 9 }}>
          <NumRow label="קלוריות" unit="קק&quot;ל" step={50} value={goals.calories} onChange={(v) => setGoals((g) => ({ ...g, calories: v }))} />
          <NumRow label="חלבון" unit="גרם" step={5} value={goals.protein} onChange={(v) => setGoals((g) => ({ ...g, protein: v }))} />
          <NumRow label="פחמימה" unit="גרם" step={5} value={goals.carbs} onChange={(v) => setGoals((g) => ({ ...g, carbs: v }))} />
          <NumRow label="שומן" unit="גרם" step={5} value={goals.fat} onChange={(v) => setGoals((g) => ({ ...g, fat: v }))} />
        </div>
        <button className="btn btn--leather" style={{ height: 58, borderRadius: 19, fontSize: 19 }} onClick={saveGoals}>
          שמירת יעדים
        </button>
      </Sheet>

      {/* calculator */}
      <Sheet open={sheet === "calc"} onClose={() => setSheet(null)} tall>
        <div className="sheet-topbar">
          <div className="col" style={{ gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>מחשבון קלוריות</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>מחשב יעד לפי הנתונים שלך</span>
          </div>
          <button className="sheet-close" onClick={() => setSheet(null)}>
            <IconClose size={24} color="var(--brown)" strokeWidth={3} />
          </button>
        </div>
        <div className="col" style={{ gap: 10, overflowY: "auto", minHeight: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <button className={`chip ${gender === "male" ? "chip--active" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setGender("male")}>
              זכר
            </button>
            <button className={`chip ${gender === "female" ? "chip--active" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setGender("female")}>
              נקבה
            </button>
          </div>
          <NumRow label="גיל" unit="שנים" step={1} value={age} onChange={setAge} />
          <NumRow label="גובה" unit="ס&quot;מ" step={1} value={heightCm} onChange={setHeightCm} />
          <NumRow label="משקל" unit="ק&quot;ג" step={0.5} value={weightKg} onChange={setWeightKg} />

          <div className="col" style={{ gap: 7 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-2)" }}>רמת פעילות</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([k, label]) => (
                <button key={k} className={`chip ${activity === k ? "chip--active" : ""}`} onClick={() => setActivity(k)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="col" style={{ gap: 7 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-2)" }}>מטרה</span>
            <div className="row" style={{ gap: 7 }}>
              {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(([k, label]) => (
                <button key={k} className={`chip ${goal === k ? "chip--active" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setGoal(k)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="row-between" style={{ padding: "12px 14px", borderRadius: 18, background: "var(--surface)" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink-2)" }}>יעד מחושב</span>
            <span dir="ltr" style={{ fontSize: 22, fontWeight: 800 }}>
              {calcPreview.calories} קק"ל
            </span>
          </div>
        </div>
        <button className="btn btn--leather" style={{ height: 58, borderRadius: 19, fontSize: 19, flexShrink: 0 }} onClick={applyCalc}>
          חישוב ועדכון יעדים
        </button>
      </Sheet>

      {/* units */}
      <Sheet open={sheet === "units"} onClose={() => setSheet(null)}>
        <div className="sheet-topbar">
          <div className="col" style={{ gap: 3 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>יחידות מידה</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-2)" }}>משקל ואורך בכל האפליקציה</span>
          </div>
          <button className="sheet-close" onClick={() => setSheet(null)}>
            <IconClose size={24} color="var(--brown)" strokeWidth={3} />
          </button>
        </div>
        <div className="col" style={{ gap: 9 }}>
          {UNIT_OPTIONS.map((o) => (
            <SelectSheetRow key={o.value} active={settings.units === o.value} short={o.short} name={o.name} note={o.note} onPick={() => setUnits(o.value)} />
          ))}
        </div>
        <button className="btn btn--leather" style={{ height: 58, borderRadius: 19, fontSize: 19 }} onClick={() => setSheet(null)}>
          שמירה
        </button>
      </Sheet>

      {/* reset confirmation */}
      {sheet === "reset" && (
        <div className="center-dialog-overlay" onClick={() => setSheet(null)}>
          <div className="center-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--danger-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconWarningTriangle size={30} color="var(--danger)" strokeWidth={2.9} />
            </div>
            <div className="col" style={{ gap: 5 }}>
              <span style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.4px" }}>לאפס את כל הנתונים?</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-2)" }}>
                כל התוכניות, האימונים, יומן התזונה והשקילות יימחקו. הפעולה אינה ניתנת לשחזור.
              </span>
            </div>
            <div className="col" style={{ gap: 9 }}>
              <button
                className="btn"
                style={{ height: 56, borderRadius: 18, background: "var(--danger)", color: "#fff", fontSize: 19, boxShadow: "inset 0 2px 0 rgba(255,255,255,.22)" }}
                onClick={resetAllData}
              >
                כן, למחוק הכל
              </button>
              <button className="btn btn--ghost" style={{ height: 56, borderRadius: 18, fontSize: 19 }} onClick={() => setSheet(null)}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
