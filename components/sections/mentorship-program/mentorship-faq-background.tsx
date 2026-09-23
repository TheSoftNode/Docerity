const lines = [80, 160, 240, 320, 400, 480, 560];

function MentorshipFaqBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 640" preserveAspectRatio="none" className="h-full w-full">
        {lines.map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={1440}
            y2={y}
            stroke="var(--foreground)"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        ))}
        <line
          x1={220}
          y1={0}
          x2={220}
          y2={640}
          stroke="var(--brand-primary)"
          strokeOpacity={0.15}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

export { MentorshipFaqBackground };
