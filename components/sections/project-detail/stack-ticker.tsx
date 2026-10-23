/**
 * The stack, as a ticker under the product frame.
 *
 * The moving copy is decoration and hidden from assistive technology; the
 * stack is also given once as a plain list for screen readers, so nothing is
 * read four times over.
 */
function StackTicker({ tags }: { tags: readonly string[] }) {
  if (tags.length === 0) return null;

  /* Enough copies to overfill a wide screen, doubled so -50% loops cleanly. */
  const run = Array.from({ length: Math.max(2, Math.ceil(12 / tags.length)) }, () => tags).flat();

  return (
    <div className="overflow-hidden bg-[var(--ld-paper)] pt-[clamp(36px,4.5vw,60px)] text-[var(--ld-ink)]">
      <div className="flex items-center">
        <p className="relative z-10 shrink-0 bg-[var(--ld-paper)] pr-5 pl-[max(16px,calc((100vw-1360px)/2))] font-mono text-xs tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
          Built with
        </p>
        <ul className="sr-only">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div
          aria-hidden="true"
          className="min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
        >
          <div className="ld-marquee flex w-max">
            {[...run, ...run].map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="ld-display inline-flex items-center gap-6 pr-6 text-[clamp(26px,3vw,40px)] font-bold tracking-[-0.03em] whitespace-nowrap"
              >
                {tag}
                <span className="text-[0.6em] text-[var(--ld-accent)]">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { StackTicker };
