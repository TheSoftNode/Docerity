const steps = [
  { x: 0, width: 360, height: 90 },
  { x: 360, width: 360, height: 180 },
  { x: 720, width: 360, height: 270 },
  { x: 1080, width: 360, height: 360 },
] as const;

/*
  The rising staircase stays — it is the growth metaphor — but each step now
  fades in from nothing at its top edge. Drawn as flat 3.5% blocks, their hard
  top edges ran straight through the stage descriptions.
*/
function MentorshipPathBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="step-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.045" />
          </linearGradient>
        </defs>
        {steps.map((step) => (
          <rect
            key={step.x}
            x={step.x}
            y={400 - step.height}
            width={step.width}
            height={step.height}
            fill="url(#step-fade)"
          />
        ))}
        <line x1={0} y1={400} x2={1440} y2={400} stroke="var(--brand-primary)" strokeOpacity={0.2} strokeWidth={2} />
      </svg>
    </div>
  );
}

export { MentorshipPathBackground };
