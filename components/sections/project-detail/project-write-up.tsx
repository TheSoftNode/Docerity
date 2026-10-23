import Link from "next/link";

import type { CaseStudySection } from "@/components/sections/work/work-data";
import { SectionMedia } from "@/components/shared/section-media";
import { ChapterRail } from "@/components/sections/project-detail/chapter-rail";
import { chapterId, pad, readingMinutes } from "@/components/sections/project-detail/project-detail-content";

/**
 * The written case study, as chapters beside a contents rail that follows
 * the reader.
 *
 * Each chapter opens with its first paragraph as a lead, then the rest at
 * reading size. A section's image is shown under its text; a media slot with
 * no source yet is left out rather than drawn as an empty frame, because on a
 * public page a placeholder reads as something broken.
 */
function ProjectWriteUp({ sections }: { sections: readonly CaseStudySection[] }) {
  if (sections.length === 0) return null;

  const chapters = sections.map((section, index) => ({ id: chapterId(section.heading, index), heading: section.heading }));

  return (
    <section
      id="write-up"
      aria-label="Case study"
      className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]"
    >
      <div className="doc-shell grid gap-[clamp(28px,5vw,88px)] py-[clamp(72px,9vw,128px)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 font-mono text-xs tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            The write-up · {readingMinutes(sections)} min read
          </p>
          {chapters.length > 1 ? <ChapterRail chapters={chapters} /> : null}
          <div className="mt-8 hidden rounded-[18px] bg-[var(--ld-ink)] p-5 text-[var(--ld-paper)] lg:block">
            <p className="text-[15px] leading-normal text-[var(--ld-muted)]">Need something built to this standard?</p>
            <Link
              href="/contact"
              className="mt-3.5 inline-flex min-h-[42px] items-center rounded-full bg-[var(--ld-accent)] px-[18px] text-sm font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
            >
              Start a project
            </Link>
          </div>
        </aside>

        <div className="max-w-[46rem] min-w-0">
          {sections.map((section, index) => {
            const [lead, ...rest] = section.paragraphs;
            return (
              <article
                key={chapters[index].id}
                id={chapters[index].id}
                aria-labelledby={`${chapters[index].id}-title`}
                className="mb-[clamp(48px,6vw,80px)] scroll-mt-28 border-b border-[var(--ld-line)] pb-[clamp(48px,6vw,80px)] last:mb-0 last:border-b-0 last:pb-0"
              >
                <p className="flex items-center gap-3 font-mono text-xs tracking-[0.1em] text-[var(--ld-accent)] uppercase">
                  <span aria-hidden="true" className="h-0.5 w-7 bg-[var(--ld-accent)]" />
                  Chapter {pad(index + 1)}
                </p>
                <h2
                  id={`${chapters[index].id}-title`}
                  className="ld-display mt-[18px] text-[clamp(32px,3.6vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-balance"
                >
                  {section.heading}
                </h2>
                {lead ? (
                  <p className="mt-6 text-[clamp(19px,1.7vw,22px)] leading-relaxed font-medium text-pretty">{lead}</p>
                ) : null}
                {rest.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-5 text-[17.5px] leading-[1.75] text-pretty text-[var(--ld-text-2)]">
                    {paragraph}
                  </p>
                ))}
                {section.image ? (
                  <figure className="mt-8">
                    {/* A plain <img>: the source is a Cloudinary URL already
                        sized and encoded, so the optimiser would only redo it. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.image.src}
                      alt={section.image.alt}
                      loading="lazy"
                      className="w-full rounded-[18px] border border-[var(--ld-line)]"
                    />
                    {section.image.caption ? (
                      <figcaption className="mt-2.5 font-mono text-xs text-[var(--ld-text-muted)]">
                        {section.image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : section.media?.src ? (
                  <SectionMedia media={section.media} />
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { ProjectWriteUp };
