/**
 * The stack, once and in full, under the product frame: a quiet row of
 * names rather than a moving ticker, so nothing is cut off mid-word and it
 * reads the same on every screen.
 */
function StackTicker({ tags }: { tags: readonly string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell flex flex-col gap-3 pt-[clamp(28px,3.5vw,44px)] sm:flex-row sm:items-center">
        <p className="shrink-0 text-[13px] text-[var(--ld-text-muted)]">Built with</p>
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag} className="rounded-full bg-[var(--ld-card)] px-3 py-1.5 text-[13.5px] font-medium ring-1 ring-[rgb(8_16_46/0.08)]">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { StackTicker };
