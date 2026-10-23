import { pad, resultFigure } from "@/components/sections/project-detail/project-detail-content";

/**
 * What changed: each result with the figure it leads with pulled out large.
 *
 * The figure is found in the sentence the editor wrote rather than stored
 * apart from it, so the number and its claim cannot drift. A result with no
 * number is shown as its sentence alone.
 */
function ProjectOutcomes({ results }: { results: readonly string[] }) {
  if (results.length === 0) return null;

  return (
    <section aria-labelledby="outcomes-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell pt-[clamp(64px,8vw,112px)]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Outcomes</p>
            <h2
              id="outcomes-title"
              className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
            >
              What changed.
            </h2>
          </div>
          <p className="max-w-[22rem] text-[15px] leading-normal text-[var(--ld-text-muted)]">
            Measured in production, not in a demo.
          </p>
        </div>

        <ol className="mt-11 grid border-t-2 border-[var(--ld-ink)] lg:grid-cols-3">
          {results.map((result, index) => {
            const figure = resultFigure(result);
            return (
              <li
                key={result}
                className="border-b border-[var(--ld-line)] py-7 lg:mr-7 lg:border-r lg:border-b-0 lg:pr-7 lg:last:mr-0 lg:last:border-r-0"
              >
                <span className="font-mono text-xs text-[var(--ld-text-muted)]">{pad(index + 1)}</span>
                {figure ? (
                  <span
                    aria-hidden="true"
                    className="ld-display mt-6 block text-[clamp(64px,7.4vw,112px)] leading-[0.85] font-extrabold tracking-[-0.06em]"
                  >
                    {figure.figure}
                    <span className="text-[var(--ld-accent)]">{figure.suffix}</span>
                  </span>
                ) : null}
                <span aria-hidden="true" className="ld-grow mt-5 mb-4 block h-[3px] w-12 rounded-full bg-[var(--ld-accent)]" />
                <p className="text-base leading-relaxed text-[var(--ld-text-2)]">{result}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export { ProjectOutcomes };
