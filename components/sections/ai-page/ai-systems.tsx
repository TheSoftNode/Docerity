import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { AiProjectView } from "@/lib/content/blocks/views";

/**
 * The systems in production, on one path down the page: each a station with
 * what it measured, what it does and what it is built on. The heading is
 * held on the left while the path scrolls past it.
 */
async function AiSystems() {
  const [heading, projects] = await Promise.all([
    getHeading("ai", "ai-projects"),
    getGroup<AiProjectView[]>("ai", "projects"),
  ]);
  if (!projects || projects.length === 0) return null;

  return (
    <section id="systems" aria-labelledby="systems-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell grid gap-[clamp(32px,5vw,88px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
          <h2 id="systems-title" className="ld-display max-w-[12ch] text-[clamp(38px,5vw,68px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
            {heading.title}
          </h2>
          <p className="mt-5 max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">
            {heading.lede || "What you just tried is the idea behind these. Each is in production, measured on what it actually does."}
          </p>
        </div>

        <ol className="relative">
          <span
            aria-hidden="true"
            className="absolute top-[30px] bottom-[30px] left-[27px] w-0.5 bg-[linear-gradient(180deg,var(--ld-deep),rgb(28_58_140/0.15))]"
          />
          {projects.map((project, index) => (
            <li key={project.slug} className="group relative grid grid-cols-[56px_minmax(0,1fr)] gap-[22px] pb-[34px] last:pb-0">
              {/* A stop on the path, not a number: the systems are not a sequence. */}
              <span
                aria-hidden="true"
                className={`relative z-10 mx-auto mt-[26px] size-3.5 rounded-full shadow-[0_0_0_6px_var(--ld-paper)] ${
                  index === 0 ? "bg-[var(--ld-ink)]" : "bg-[var(--ld-paper)] ring-2 ring-[var(--ld-deep)]"
                }`}
              />
              <article className="rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] px-6 pt-[22px] pb-6 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-x-1.5 group-hover:shadow-[0_30px_60px_-44px_rgb(var(--ld-ink-rgb)/0.45)]">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <h3 className="ld-display text-[clamp(24px,2.4vw,32px)] leading-none font-extrabold tracking-[-0.035em]">{project.name}</h3>
                  <span className="ld-display text-lg font-bold text-[var(--ld-deep)]">{project.stat}</span>
                </div>
                <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">{project.description}</p>
                <ul aria-label="Built on" className="mt-3.5 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded-full bg-[#e3e8f4] px-2.5 py-1 font-mono text-[11.5px]">
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export { AiSystems };
