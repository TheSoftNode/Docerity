const lines = [60, 140, 220, 300, 380] as const;

function Web3CapabilitiesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 440" preserveAspectRatio="none" className="h-full w-full">
        {lines.map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={1440}
            y2={y}
            stroke="#f3f1ea"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        ))}
        <line
          x1={1180}
          y1={0}
          x2={1180}
          y2={440}
          stroke="#c2660a"
          strokeOpacity={0.12}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

export { Web3CapabilitiesBackground };
