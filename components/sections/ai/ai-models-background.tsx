const dots = [
  [80, 40], [220, 120], [140, 260], [340, 60], [420, 220],
  [620, 100], [700, 300], [860, 40], [980, 180], [1120, 80],
  [1240, 260], [1360, 120], [1300, 30], [520, 340], [200, 380],
] as const;

function AiModelsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
        {dots.map(([x, y], index) => (
          <circle key={index} cx={x} cy={y} r={2} fill="#f5f7fb" fillOpacity={0.12} />
        ))}
      </svg>
    </div>
  );
}

export { AiModelsBackground };
