/**
 * A drafted spec strip for the foot of a hero's text column.
 *
 * Every value is a real count read from the page's own data, so it stays true
 * as content is added rather than becoming a stale claim.
 */
function HeroSpec({
  items,
}: {
  items: readonly { label: string; value: string }[];
}) {
  return (
    <dl className="mt-10 flex flex-wrap items-stretch gap-x-6 gap-y-4 border-t border-border/80 pt-6 sm:gap-x-10">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="font-mono text-[0.625rem] tracking-[0.18em] text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="font-heading text-lg font-semibold tracking-tight text-foreground tabular-nums">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export { HeroSpec };
