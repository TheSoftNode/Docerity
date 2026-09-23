const nodes = [
  { x: 120, y: 60 },
  { x: 360, y: 140 },
  { x: 260, y: 300 },
  { x: 620, y: 240 },
  { x: 900, y: 80 },
  { x: 1080, y: 260 },
  { x: 1320, y: 120 },
] as const;

const links = [
  [0, 1],
  [1, 2],
  [1, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
] as const;

function Web3EcosystemsBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 360" preserveAspectRatio="none" className="h-full w-full">
        {links.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="var(--foreground)"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
        ))}
        {nodes.map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={4}
            fill="var(--foreground)"
            fillOpacity={0.15}
          />
        ))}
      </svg>
    </div>
  );
}

export { Web3EcosystemsBackground };
