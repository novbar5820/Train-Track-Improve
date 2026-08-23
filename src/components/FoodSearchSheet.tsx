import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { FOODS, FOOD_CATEGORIES } from "../data/foods";
import { IconSearch, IconClose, IconPlus, IconCheck } from "./Icons";
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
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return FOODS.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (query.trim() && !f.name.includes(query.trim())) return false;
      return true;
    }).slice(0, 60);
  }, [query, category]);

  function reset() {
    setQuery("");
    setCategory("all");
  }

  function handleAdd(food: FoodItem) {
    const defaultUnit = food.units.find((u) => u.id !== "gram") ?? food.units[0];
    onAdd(food, 1, defaultUnit.id);
    setJustAddedId(food.id);
    setTimeout(() => setJustAddedId((id) => (id === food.id ? null : id)), 900);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <div className="sheet-topbar">
        <span style={{ fontSize: 22, fontWeight: 800 }}>הוספת מאכל</span>
        <button
          className="sheet-close"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          <IconClose size={24} color="var(--brown)" strokeWidth={3} />
        </button>
      </div>

      <div className="row" style={{ gap: 10, border: "2.5px solid var(--line)", borderRadius: 18, padding: "12px 14px" }}>
        <IconSearch size={24} color="var(--brown-2)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מאכל…"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 18, fontWeight: 700 }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        <button className={`chip ${category === "all" ? "chip--active" : ""}`} style={{ whiteSpace: "nowrap" }} onClick={() => setCategory("all")}>
          הכל
        </button>
        {FOOD_CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? "chip--active" : ""}`}
            style={{ whiteSpace: "nowrap" }}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="col" style={{ gap: 9, maxHeight: "48vh", overflowY: "auto" }}>
        {filtered.map((f) => (
          <div
            key={f.id}
            className="row card--pressable"
            style={{ gap: 12, border: "2.5px solid var(--line)", borderRadius: 18, padding: "10px 12px", cursor: "pointer" }}
            onClick={() => handleAdd(f)}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--brown-2)" }}>{f.per100g.calories}</span>
            </div>
            <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
              <span className="tiny muted">{f.category} · {f.per100g.calories} קק"ל ל-100 גרם</span>
            </div>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                background: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {justAddedId === f.id ? (
                <IconCheck size={24} color="var(--gold-text)" strokeWidth={3.2} />
              ) : (
                <IconPlus size={24} color="var(--gold-text)" strokeWidth={3.2} />
              )}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <div className="empty-state small">לא נמצאו מאכלים</div>}
      </div>
    </Sheet>
  );
}
