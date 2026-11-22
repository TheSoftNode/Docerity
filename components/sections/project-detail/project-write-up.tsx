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
      <div className="doc-shell grid grid-cols-1 gap-x-[clamp(28px,5vw,80px)] gap-y-6 py-[clamp(44px,5.5vw,88px)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-[76px] z-20 -mx-5 min-w-0 bg-[var(--ld-paper)]/92 px-5 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:top-28 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <p className="mb-2 text-[13px] text-[var(--ld-text-muted)] lg:mb-3">
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
                className="mb-[clamp(36px,4.5vw,60px)] scroll-mt-40 border-b border-[var(--ld-line)] pb-[clamp(36px,4.5vw,60px)] last:mb-0 last:border-b-0 last:pb-0 lg:scroll-mt-28"
              >
                <p className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--ld-accent)]">
                  <span aria-hidden="true" className="h-0.5 w-6 bg-[var(--ld-accent)]" />
                  Chapter {pad(index + 1)}
                </p>
                <h2
                  id={`${chapters[index].id}-title`}
                  className="ld-display mt-3 text-[clamp(24px,2.4vw,34px)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance"
                >
                  {section.heading}
                </h2>
                {lead ? (
                  <p className="mt-4 text-[clamp(17px,1.35vw,19px)] leading-relaxed font-medium text-pretty">{lead}</p>
                ) : null}
                {rest.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-4 text-[16.5px] leading-[1.75] text-pretty text-[var(--ld-text-2)]">
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
                      <figcaption className="mt-2.5 text-[13px] text-[var(--ld-text-muted)]">
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
