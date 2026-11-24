import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { EvaluationHabitView, FigureView } from "@/lib/content/blocks/views";

/**
 * The other side of the AI work: writing and reviewing the tasks frontier
 * models are evaluated on. It is under NDA, so it is shown as figures and a
 * method rather than as projects, and names no client, model or codename.
 */
async function AiEvaluation() {
  const [heading, figures, method, areas] = await Promise.all([
    getHeading("ai", "ai-evaluation"),
    getGroup<FigureView[]>("ai", "evaluationFigures"),
    getGroup<EvaluationHabitView[]>("ai", "evaluationMethod"),
    getGroup<string[]>("ai", "evaluationAreas"),
  ]);
  if (!method || method.length === 0) return null;

  return (
    <section id="evaluation" aria-labelledby="evaluation-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="grid gap-[clamp(32px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <h2 id="evaluation-title" className="ld-display max-w-[14ch] text-[clamp(38px,5vw,68px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              {heading.title}
            </h2>
            {heading.lede ? <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          </div>

          {figures && figures.length > 0 ? (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-line)]">
              {figures.map((figure) => (
                <div key={figure.label} className="flex flex-col gap-2 bg-[var(--ld-card)] px-5 py-5 sm:px-6">
                  <dt className="order-2 text-[14px] leading-snug text-[var(--ld-text-2)]">{figure.label}</dt>
                  <dd className="ld-display order-1 text-[clamp(32px,3.4vw,44px)] leading-none font-extrabold tracking-[-0.04em] text-[var(--ld-deep)]">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <ol className="mt-[clamp(40px,5vw,64px)] border-t border-[var(--ld-line)]">
          {method.map((habit, index) => (
            <li
              key={habit.title}
              className="grid gap-x-8 gap-y-2 border-b border-[var(--ld-line)] py-6 md:grid-cols-[56px_minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-baseline"
            >
              <span aria-hidden="true" className="font-mono text-[13px] text-[var(--ld-text-2)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="ld-display text-[clamp(21px,2vw,26px)] leading-tight font-bold tracking-[-0.025em]">{habit.title}</h3>
              <p className="text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">{habit.description}</p>
            </li>
          ))}
        </ol>

        {areas && areas.length > 0 ? (
          <ul aria-label="Kinds of evaluation work" className="mt-8 flex flex-wrap gap-2">
            {areas.map((area) => (
              <li key={area} className="rounded-full bg-[#e3e8f4] px-3 py-1.5 font-mono text-[12px]">
                {area}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export { AiEvaluation };
