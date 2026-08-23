function fmtMs(secondsLeft: number): string {
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function ShineBar({ pct, height }: { pct: number; height: number }) {
  return (
    <span style={{ height, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", position: "relative", display: "block" }}>
      <span
        style={{
          display: "block",
          height: "100%",
          borderRadius: 99,
          background: "var(--gold)",
          width: `${pct}%`,
          transition: "width .9s linear",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: -40,
            width: 40,
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,.9) 60%,transparent)",
            animation: "goldRide 1.8s ease-in-out infinite",
          }}
        />
      </span>
    </span>
  );
}

export function RestTimerBar({
  secondsLeft,
  total,
  onSkip,
  onAdd,
  variant = "list",
}: {
  secondsLeft: number;
  total: number;
  onSkip: () => void;
  onAdd: () => void;
  variant?: "list" | "compact";
}) {
  const pct = Math.max(0, Math.min(100, (secondsLeft / total) * 100));

  if (variant === "compact") {
    return (
      <div
        style={{
          borderRadius: 20,
          border: "2.5px solid var(--brown)",
          background: "#fff",
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          overflow: "hidden",
        }}
      >
        <div className="col" style={{ gap: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>מנוחה</span>
          <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
            {fmtMs(secondsLeft)}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <ShineBar pct={pct} height={10} />
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn--ghost" style={{ height: 42, padding: "0 13px", fontSize: 16 }} onClick={onAdd}>
            +15
          </button>
          <button className="btn btn--leather" style={{ height: 42, padding: "0 15px", fontSize: 16 }} onClick={onSkip}>
            דלג
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 22,
        border: "2.5px solid var(--brown)",
        background: "#fff",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        overflow: "hidden",
      }}
    >
      <div className="row-between">
        <div className="col" style={{ gap: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>מנוחה בין סטים</span>
          <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
            {fmtMs(secondsLeft)}
          </span>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn--ghost" style={{ height: 46, padding: "0 16px", fontSize: 17 }} onClick={onAdd}>
            +15
          </button>
          <button className="btn btn--leather" style={{ height: 46, padding: "0 18px", fontSize: 17 }} onClick={onSkip}>
            דלג
          </button>
        </div>
      </div>
      <ShineBar pct={pct} height={10} />
    </div>
  );
}
