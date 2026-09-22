const layers = [
  { offset: 0, opacity: 0.05 },
  { offset: 70, opacity: 0.045 },
  { offset: 140, opacity: 0.04 },
  { offset: 210, opacity: 0.035 },
] as const;

function WorkCapabilitiesBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 500" preserveAspectRatio="none" className="h-full w-full">
        {layers.map((layer) => (
          <polygon
            key={layer.offset}
            points={`${880 + layer.offset},${40 + layer.offset} ${1440},${10 + layer.offset} ${1440},${140 + layer.offset} ${880 + layer.offset},${170 + layer.offset}`}
            fill="#f5f7fb"
            fillOpacity={layer.opacity}
          />
        ))}
      </svg>
    </div>
  );
}

export { WorkCapabilitiesBackground };
