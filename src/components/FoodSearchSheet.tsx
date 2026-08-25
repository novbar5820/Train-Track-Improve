import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { FOODS, FOOD_CATEGORIES } from "../data/foods";
import { IconSearch, IconClose, IconPlus, IconCheck } from "./Icons";
import type { FoodItem, FoodUnit } from "../types";

/** יחידת המידה הטבעית של המאכל - היחידה הלא-גרם המוגדרת לו, אחרת גרם */
function naturalUnit(food: FoodItem): FoodUnit {
  return food.units.find((u) => u.id !== "gram") ?? food.units[0];
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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
    setEditingId(null);
  }

  function defaultQuantity(unit: FoodUnit): number {
    return unit.id === "gram" ? 100 : 1;
  }

  function stepFor(unit: FoodUnit): number {
    return unit.id === "gram" ? 10 : 1;
  }

  function quantityFor(food: FoodItem): number {
    return quantities[food.id] ?? defaultQuantity(naturalUnit(food));
  }

  function adjustQuantity(food: FoodItem, delta: number) {
    setQuantities((q) => ({ ...q, [food.id]: Math.max(0, quantityFor(food) + delta) }));
  }

  function setQuantityFor(food: FoodItem, value: number) {
    setQuantities((q) => ({ ...q, [food.id]: Math.max(0, value) }));
  }

  function handleAdd(food: FoodItem) {
    onAdd(food, quantityFor(food), naturalUnit(food).id);
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
        {filtered.map((f) => {
          const isEditing = editingId === f.id;
          const unit = naturalUnit(f);
          const hasChosen = quantities[f.id] !== undefined;
          return (
            <div
              key={f.id}
              className="card--pressable"
              style={{ position: "relative", border: "2.5px solid var(--line)", borderRadius: 18, overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
              onClick={() => !isEditing && setEditingId(f.id)}
            >
              <div
                className="row"
                style={{
                  gap: 12,
                  padding: "10px 12px",
                  filter: isEditing ? "blur(4px)" : "none",
                  opacity: isEditing ? 0.4 : 1,
                  transition: "filter .18s ease, opacity .18s ease",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--brown-2)" }}>{f.per100g.calories}</span>
                </div>
                <div className="col" style={{ gap: 1, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
                  <span className="tiny muted">
                    {hasChosen ? (
                      <span style={{ color: "var(--brown-2)", fontWeight: 800 }}>
                        נבחרו {quantities[f.id]} {unit.label}
                      </span>
                    ) : (
                      <>{f.category} · {f.per100g.calories} קק"ל ל-100 גרם</>
                    )}
                  </span>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(f);
                  }}
                >
                  {justAddedId === f.id ? (
                    <IconCheck size={24} color="var(--gold-text)" strokeWidth={3.2} />
                  ) : (
                    <IconPlus size={24} color="var(--gold-text)" strokeWidth={3.2} />
                  )}
                </span>
              </div>

              {isEditing && (
                <div
                  className="row"
                  style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", gap: 8 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="num-row__btn" style={{ width: 34, height: 34, fontSize: 20 }} onClick={() => adjustQuantity(f, -stepFor(unit))}>
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="decimal"
                    step={stepFor(unit)}
                    min={0}
                    className="input-faded"
                    value={quantityFor(f)}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setQuantityFor(f, e.target.value === "" ? 0 : Number(e.target.value))}
                    style={{ width: 70, fontSize: 18, fontWeight: 800, padding: "6px 4px" }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--ink-2)" }}>{unit.label}</span>
                  <button className="num-row__btn" style={{ width: 34, height: 34, fontSize: 20 }} onClick={() => adjustQuantity(f, stepFor(unit))}>
                    +
                  </button>
                  <button
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      border: "none",
                      background: "var(--brown)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onClick={() => setEditingId(null)}
                  >
                    <IconCheck size={18} color="#fff" strokeWidth={3.4} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state small">לא נמצאו מאכלים</div>}
      </div>
    </Sheet>
  );
}
