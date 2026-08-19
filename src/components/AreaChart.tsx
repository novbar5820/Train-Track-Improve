interface Point {
  label: string;
  value: number;
}

export function AreaChart({
  points,
  height = 110,
  width = 260,
}: {
  points: Point[];
  height?: number;
  width?: number;
}) {
  if (points.length === 0) {
    return (
      <div
        style={{ width, height }}
        className="row center muted small"
      >
        אין עדיין נתונים
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padY = 10;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * stepX : width / 2;
    const y =
      height - padY - ((p.value - min) / range) * (height - padY * 2);
    return { x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="area-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9ad4e" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d9ad4e" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#area-gold)" />
      <path d={linePath} fill="none" stroke="#a9781f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 2.5} fill="#a9781f" />
      ))}
    </svg>
  );
}
