import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { FOODS, FOOD_CATEGORIES } from "../data/foods";
import { macrosFor } from "../utils/nutrition";
import type { FoodItem } from "../types";

export function FoodSearchSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (food: FoodItem, quantity: number, unitId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitId, setUnitId] = useState("gram");

  const filtered = useMemo(() => {
    return FOODS.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (query.trim() && !f.name.includes(query.trim())) return false;
      return true;
    }).slice(0, 60);
  }, [query, category]);

  function pick(food: FoodItem) {
    setSelected(food);
    const defaultUnit = food.units.find((u) => u.id !== "gram") ?? food.units[0];
    setUnitId(defaultUnit.id);
    setQuantity(1);
  }

  function reset() {
    setSelected(null);
    setQuery("");
  }

  function handleAdd() {
    if (!selected) return;
    onAdd(selected, quantity, unitId);
    reset();
    onClose();
  }

  const preview = selected ? macrosFor(selected, quantity, unitId) : null;

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      {!selected ? (
        <>
          <h3 className="center" style={{ marginBottom: 14 }}>
            הוספת מאכל
          </h3>
          <input
            className="input"
            placeholder="חיפוש מאכל..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8 }}>
            <button
              className="chip"
              style={category === "all" ? { background: "var(--gold-line)", color: "#4a3410" } : undefined}
              onClick={() => setCategory("all")}
            >
              הכל
            </button>
            {FOOD_CATEGORIES.map((c) => (
              <button
                key={c}
                className="chip"
                style={{
                  whiteSpace: "nowrap",
                  ...(category === c ? { background: "var(--gold-line)", color: "#4a3410" } : {}),
                }}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="col" style={{ gap: 6, maxHeight: "48vh", overflowY: "auto", marginTop: 6 }}>
            {filtered.map((f) => (
              <div key={f.id} className="list-item card--pressable" onClick={() => pick(f)}>
                <div className="col" style={{ gap: 2, flex: 1 }}>
                  <span className="bold small">{f.name}</span>
                  <span className="tiny muted">
                    {f.category} · {f.per100g.calories} קק"ל ל-100 גרם
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-state small">לא נמצאו מאכלים</div>}
          </div>
        </>
      ) : (
        <>
          <div className="row" style={{ marginBottom: 14 }}>
            <button className="link-btn" onClick={() => setSelected(null)}>
              → חזרה
            </button>
          </div>
          <h3 style={{ marginBottom: 4 }}>{selected.name}</h3>
          <p className="small muted" style={{ marginBottom: 14 }}>
            {selected.per100g.calories} קק"ל / 100 גרם
          </p>

          <div className="row" style={{ gap: 10, marginBottom: 14 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">כמות</label>
              <input
                type="number"
                min={0}
                step={0.5}
                className="input"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">יחידה</label>
              <select className="input" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                {selected.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {preview && (
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="row-between">
                <span className="small">קלוריות</span>
                <span className="bold small">{Math.round(preview.calories)} קק"ל</span>
              </div>
              <div className="row-between">
                <span className="small">חלבון</span>
                <span className="bold small">{preview.protein.toFixed(1)} גרם</span>
              </div>
              <div className="row-between">
                <span className="small">שומן</span>
                <span className="bold small">{preview.fat.toFixed(1)} גרם</span>
              </div>
              <div className="row-between">
                <span className="small">פחמימה</span>
                <span className="bold small">{preview.carbs.toFixed(1)} גרם</span>
              </div>
            </div>
          )}

          <button className="btn btn--gold btn--block" onClick={handleAdd}>
            הוספה ליומן
          </button>
        </>
      )}
    </Sheet>
  );
}
