import { resultFigure } from "@/components/sections/project-detail/project-detail-content";

/**
 * What changed: each result with the figure it leads with pulled out large.
 *
 * The figure is found in the sentence the editor wrote rather than stored
 * apart from it, so the number and its claim cannot drift. A result with no
 * number is shown as its sentence alone.
 */
const NOTE: Record<string, string> = {
  Live: "Measured in production, not in a demo.",
  "Client work": "Measured in production, on the client's system.",
  "Hackathon build": "What the build achieved in the time the hackathon allowed.",
  Prototype: "What the prototype proved.",
  Discontinued: "What it achieved while it ran.",
};

function ProjectOutcomes({ results, status = "Live" }: { results: readonly string[]; status?: string }) {
  if (results.length === 0) return null;

  return (
    <section aria-labelledby="outcomes-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell pt-[clamp(40px,5vw,72px)]">
        <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-2">
          <div>
            <h2
              id="outcomes-title"
              className="ld-display text-[clamp(28px,3.1vw,40px)] leading-[1.05] font-semibold tracking-[-0.03em]"
            >
              What changed.
            </h2>
          </div>
          <p className="max-w-[22rem] text-[14px] leading-normal text-[var(--ld-text-muted)]">
            {NOTE[status] ?? "What it achieved so far."}
          </p>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result) => {
            const figure = resultFigure(result);
            return (
              <li
                key={result}
                className="flex flex-col rounded-[18px] bg-[var(--ld-card)] p-5 shadow-[0_1px_0_rgb(8_16_46/0.04),0_20px_40px_-30px_rgb(8_16_46/0.25)] ring-1 ring-[rgb(8_16_46/0.06)] sm:p-6"
              >
                {figure ? (
                  <span
                    aria-hidden="true"
                    className="ld-display block text-[clamp(36px,3.6vw,52px)] leading-none font-semibold tracking-[-0.04em]"
                  >
                    {figure.figure}
                    <span className="text-[var(--ld-accent)]">{figure.suffix}</span>
                  </span>
                ) : null}
                <span aria-hidden="true" className={figure ? "ld-grow mt-4 mb-3 block h-[3px] w-10 rounded-full bg-[var(--ld-accent)]" : "ld-grow mb-3 block h-[3px] w-10 rounded-full bg-[var(--ld-accent)]"} />
                <p className="text-[15px] leading-relaxed text-[var(--ld-text-2)]">{result}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export { ProjectOutcomes };
