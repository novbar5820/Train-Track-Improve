export function RestTimerBar({
  secondsLeft,
  total,
  onSkip,
  onAdd,
}: {
  secondsLeft: number;
  total: number;
  onSkip: () => void;
  onAdd: () => void;
}) {
  const pct = Math.max(0, Math.min(100, (secondsLeft / total) * 100));
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  return (
    <div
      className="card--gold"
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 448,
        borderRadius: "var(--radius-lg)",
        padding: "12px 16px",
        zIndex: 30,
        boxShadow: "var(--shadow-gold)",
      }}
    >
      <div className="row-between">
        <div className="col" style={{ gap: 2 }}>
          <span className="tiny muted">מנוחה בין סטים</span>
          <span className="bold" style={{ fontSize: "1.3rem" }}>
            {mm}:{String(ss).padStart(2, "0")}
          </span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn--ghost btn--sm" onClick={onAdd}>
            +15
          </button>
          <button className="btn btn--leather btn--sm" onClick={onSkip}>
            דלג
          </button>
        </div>
      </div>
      <div className="bar" style={{ marginTop: 8 }}>
        <div className="bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
