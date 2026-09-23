/**
 * Blueprint framing for a page hero: a measurement rule down each side and
 * registration marks at the corners, like a technical drawing.
 *
 * Purely decorative and server-rendered — no state, no motion. It exists to
 * make the hero read as a drafted plate rather than a content box.
 */
function HeroFrame() {
  const ticks = Array.from({ length: 13 });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {/* Side rules with graduated ticks. Every fourth tick is longer, the way
          a ruler marks its major divisions. */}
      {(["left-6", "right-6"] as const).map((side) => (
        <div key={side} className={`absolute top-16 bottom-16 ${side} flex flex-col justify-between`}>
          {ticks.map((_, index) => (
            <span
              key={index}
              className={
                index % 4 === 0
                  ? "block h-px w-4 bg-border"
                  : "block h-px w-2 bg-border/60"
              }
            />
          ))}
        </div>
      ))}

      {/* Registration marks. */}
      {[
        "top-8 left-12 border-t border-l",
        "top-8 right-12 border-t border-r",
        "bottom-8 left-12 border-b border-l",
        "bottom-8 right-12 border-b border-r",
      ].map((corner) => (
        <span key={corner} className={`absolute size-4 border-primary/30 ${corner}`} />
      ))}
    </div>
  );
}

export { HeroFrame };
