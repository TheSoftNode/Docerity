const steps = [
  { x: 0, width: 360, height: 90 },
  { x: 360, width: 360, height: 180 },
  { x: 720, width: 360, height: 270 },
  { x: 1080, width: 360, height: 360 },
] as const;

function MentorshipPathBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {steps.map((step) => (
          <rect
            key={step.x}
            x={step.x}
            y={400 - step.height}
            width={step.width}
            height={step.height}
            fill="#f3f1ea"
            fillOpacity={0.035}
          />
        ))}
        <line
          x1={0}
          y1={400}
          x2={1440}
          y2={400}
          stroke="#c2660a"
          strokeOpacity={0.2}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

export { MentorshipPathBackground };
