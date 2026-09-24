/**
 * A measurement rule down the right edge of the landing hero, with a
 * registration mark at each end, a nod to a technical drawing.
 *
 * Deliberately right-side only and used on the landing hero alone. Mirrored
 * down both edges and repeated on every page hero it stopped reading as an
 * accent and started looking like chrome bolted to the viewport.
 */
function HeroFrame() {
  const ticks = Array.from({ length: 13 });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      <div className="absolute top-16 right-6 bottom-16 flex flex-col justify-between">
        {ticks.map((_, index) => (
          <span
            key={index}
            className={
              index % 4 === 0 ? "block h-px w-4 bg-border" : "block h-px w-2 bg-border/60"
            }
          />
        ))}
      </div>

      <span className="absolute top-8 right-12 size-4 border-t border-r border-primary/30" />
      <span className="absolute right-12 bottom-8 size-4 border-r border-b border-primary/30" />
    </div>
  );
}

export { HeroFrame };
