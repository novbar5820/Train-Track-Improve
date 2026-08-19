import { useMemo, useState } from "react";
import { Sheet } from "./Sheet";
import { ExerciseIcon } from "./ExerciseIcon";
import { EXERCISES, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from "../data/exercises";
import type { MuscleGroup } from "../types";

export function ExercisePickerSheet({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MuscleGroup | "all">("all");

  const groups = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

  const filtered = useMemo(() => {
    return EXERCISES.filter((e) => {
      if (group !== "all" && e.muscleGroup !== group) return false;
      if (query.trim() && !e.name.includes(query.trim())) return false;
      return true;
    });
  }, [query, group]);

  return (
    <Sheet open={open} onClose={onClose}>
      <h3 className="center" style={{ marginBottom: 14 }}>
        ספריית תרגילים
      </h3>
      <input
        className="input"
        placeholder="חיפוש תרגיל..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
        <button
          className="chip"
          style={group === "all" ? { background: "var(--gold-line)", color: "#4a3410" } : undefined}
          onClick={() => setGroup("all")}
        >
          הכל
        </button>
        {groups.map((g) => (
          <button
            key={g}
            className="chip"
            style={{
              whiteSpace: "nowrap",
              ...(group === g ? { background: "var(--gold-line)", color: "#4a3410" } : {}),
            }}
            onClick={() => setGroup(g)}
          >
            {MUSCLE_GROUP_LABELS[g]}
          </button>
        ))}
      </div>
      <div className="col" style={{ gap: 8, maxHeight: "50vh", overflowY: "auto" }}>
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="list-item card--pressable"
            onClick={() => {
              onPick(ex.id);
              onClose();
            }}
          >
            <div className="thumb">
              <ExerciseIcon muscleGroup={ex.muscleGroup} size={30} />
            </div>
            <div className="col" style={{ gap: 2 }}>
              <span className="bold small">{ex.name}</span>
              <span className="tiny muted">
                {MUSCLE_GROUP_LABELS[ex.muscleGroup]} · {EQUIPMENT_LABELS[ex.equipment]}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state small">לא נמצאו תרגילים מתאימים</div>
        )}
      </div>
    </Sheet>
  );
}
