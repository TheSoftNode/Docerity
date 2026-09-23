function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

const hexagons = [
  { cx: 120, cy: 80, r: 70 },
  { cx: 1340, cy: 120, r: 90 },
  { cx: 260, cy: 340, r: 55 },
  { cx: 1200, cy: 360, r: 60 },
  { cx: 720, cy: 60, r: 45 },
] as const;

function WorkStackBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="h-full w-full">
        {hexagons.map((hex) => (
          <polygon
            key={`${hex.cx}-${hex.cy}`}
            points={hexPoints(hex.cx, hex.cy, hex.r)}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.06}
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </div>
  );
}

export { WorkStackBackground };
