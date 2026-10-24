import { getGroup } from "@/lib/content/blocks/source";
import type { PairView } from "@/lib/content/blocks/views";

/**
 * The explainer pairs, running across the page in large type: each concept
 * beside the everyday thing it works like. The same pairs the homepage
 * flips through, edited in one place (Explainer pairs).
 */
async function PairsMarquee() {
  const pairs = (await getGroup<PairView[]>("explainers", "pairs")) ?? [];
  if (pairs.length === 0) return null;

  /* Enough copies to outrun a wide screen; the second half repeats the first
     so the loop has no seam, and is hidden from assistive tech. */
  const run = pairs.length < 4 ? [...pairs, ...pairs] : pairs;

  return (
    <section aria-label="Concepts and what they work like" className="overflow-hidden border-b border-[var(--ld-line)] bg-[var(--ld-paper)] py-[clamp(26px,3vw,40px)] text-[var(--ld-ink)]">
      <div className="ld-marquee flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-baseline">
            {run.map((pair, index) => (
              <li
                key={`${pair.id}-${index}`}
                className="ld-display flex items-baseline gap-[18px] pr-10 text-[clamp(34px,4.6vw,64px)] font-extrabold tracking-[-0.045em] whitespace-nowrap"
              >
                <span>{pair.conceptLabel}</span>
                <span aria-hidden="true" className="text-[0.7em] text-[var(--ld-deep)]">
                  ≈
                </span>
                <span className="sr-only">works like</span>
                <span className="text-transparent [-webkit-text-stroke:1.5px_rgb(8_16_46/0.45)]">{pair.analogyLabel}</span>
                <span aria-hidden="true" className="text-[0.5em] text-[var(--ld-tint)]">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

export { PairsMarquee };
