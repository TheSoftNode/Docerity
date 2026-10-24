import { getGroup, getHeading } from "@/lib/content/blocks/source";

/**
 * The day-to-day stack, written as the source file it would be: an exported
 * `stack` array on paper. The list is editable content, so the "file" grows
 * or shrinks with it; each entry is still a list item to assistive tech.
 */
async function ProjectsStack() {
  const [heading, stack] = await Promise.all([
    getHeading("services", "work-stack"),
    getGroup<string[]>("services", "stack"),
  ]);

  const entries = stack ?? [];

  return (
    <section aria-labelledby="stack-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-center gap-10 py-16 sm:py-24 md:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-28">
        <div>
          <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            {heading.eyebrow}
          </p>
          <h2
            id="stack-title"
            className="ld-display max-w-[14ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
          >
            {heading.title}
          </h2>
          {heading.lede ? (
            <p className="mt-5 max-w-[30rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p>
          ) : null}
        </div>

        <figure className="overflow-hidden rounded-[22px] bg-[var(--ld-ink)] text-[var(--ld-paper)] shadow-[0_50px_100px_-50px_rgb(var(--ld-ink-rgb)/0.7)]">
          <figcaption className="flex items-center gap-2 border-b border-[rgb(var(--ld-tint-rgb)/0.12)] px-[18px] py-3.5 font-mono text-xs text-[var(--ld-muted-3)]">
            <span aria-hidden="true" className="size-[9px] rounded-full bg-[rgb(var(--ld-tint-rgb)/0.25)]" />
            <span aria-hidden="true" className="size-[9px] rounded-full bg-[rgb(var(--ld-tint-rgb)/0.25)]" />
            <span aria-hidden="true" className="size-[9px] rounded-full bg-[rgb(var(--ld-tint-rgb)/0.25)]" />
            <span className="ml-2.5">docerity/stack.ts</span>
          </figcaption>
          <div className="px-6 py-5 font-mono text-[clamp(13px,1.3vw,15px)] leading-8">
            <p aria-hidden="true">
              <span className="text-[var(--ld-tint)]">export const</span> stack ={" "}
              <span className="text-[var(--ld-muted-3)]">[</span>
            </p>
            <ul className="grid gap-x-6 pl-5 sm:grid-cols-2">
              {entries.map((tech) => (
                <li key={tech} className="truncate">
                  <span aria-hidden="true" className="text-[var(--ld-accent)]">&quot;</span>
                  {tech}
                  <span aria-hidden="true" className="text-[var(--ld-accent)]">&quot;</span>
                  <span aria-hidden="true" className="text-[var(--ld-muted-3)]">,</span>
                </li>
              ))}
            </ul>
            <p aria-hidden="true">
              <span className="text-[var(--ld-muted-3)]">]</span>{" "}
              <span className="text-[var(--ld-tint)]">as const</span>;
              <span className="ld-blink ml-1 text-[var(--ld-accent)]">▍</span>
            </p>
          </div>
        </figure>
      </div>
    </section>
  );
}

export { ProjectsStack };
