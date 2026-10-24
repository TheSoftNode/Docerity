import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { CapabilityView } from "@/lib/content/blocks/views";
import { ContentIcon } from "@/components/shared/content-icon";

/**
 * What we build: the editable capabilities as a numbered spec row on ink,
 * rather than boxed cards, so the four read as one statement.
 */
async function ProjectsCapabilities() {
  const [heading, capabilities] = await Promise.all([
    getHeading("services", "work-capabilities"),
    getGroup<CapabilityView[]>("services", "capabilities"),
  ]);

  return (
    <section aria-labelledby="capabilities-title" className="bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <div className="doc-shell py-16 sm:py-24 lg:py-28">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              {heading.eyebrow}
            </p>
            <h2
              id="capabilities-title"
              className="ld-display max-w-[16ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
            >
              {heading.title}
            </h2>
          </div>
          {heading.lede ? (
            <p className="max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
          ) : null}
        </div>

        <ol className="grid border-t border-[rgb(var(--ld-tint-rgb)/0.2)] sm:grid-cols-2 lg:grid-cols-4">
          {(capabilities ?? []).map((capability, index) => (
            <li
              key={capability.title}
              className="border-b border-[rgb(var(--ld-tint-rgb)/0.14)] py-7 sm:px-6 sm:odd:pl-0 lg:border-r lg:border-b-0 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
            >
              <span className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--ld-accent)]">{String(index + 1).padStart(2, "0")}</span>
                <ContentIcon name={capability.iconName} className="size-5 text-[var(--ld-muted-3)]" strokeWidth={1.75} />
              </span>
              <h3 className="ld-display mt-10 text-2xl font-bold tracking-[-0.02em]">{capability.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ld-muted)]">{capability.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export { ProjectsCapabilities };
