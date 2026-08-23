export function TrainingDayRing({
  letter,
  pct,
  size = 40,
}: {
  letter: string;
  /** 0-100, or null if the day was never performed */
  pct: number | null;
  size?: number;
}) {
  const clamped = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  const done = pct !== null && clamped >= 100;
  const background =
    pct === null
      ? "#F1E8DE"
      : done
        ? "var(--gold)"
        : `conic-gradient(from -90deg, #FFF7D2 0deg, #FFD64B ${clamped * 1.1}deg, #F2A91C ${clamped * 2.3}deg, #F1E8DE ${clamped * 3.6}deg 360deg)`;

  return (
    <span
      className="day-ring"
      style={{ width: size, height: size, background }}
    >
      <span className="day-ring__inner" style={{ fontSize: size * 0.4, color: pct === null ? "var(--muted)" : "var(--brown)" }}>
        {letter}
      </span>
    </span>
  );
}
