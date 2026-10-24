import Link from "next/link";

import type { BlogEntry } from "@/components/sections/blog/blog-data";
import { SectionMedia } from "@/components/shared/section-media";
import { ChapterRail } from "@/components/sections/project-detail/chapter-rail";
import { chapterId } from "@/components/sections/project-detail/project-detail-content";
import { ShareRow } from "@/components/sections/blog-page/share-row";
import { Byline } from "@/components/sections/blog-page/byline";

/**
 * The piece itself, on white so it reads apart from the hero's paper.
 *
 * A contents rail that follows the reader sits on the left with the sharing
 * links under it. Each section is numbered; an explainer's sidenote is set
 * beside its section as "In the analogy", restating the point in the
 * everyday terms, and drops in under the text on a narrow screen. It ends on
 * who wrote it.
 */
function PostBody({ entry, url, title }: { entry: BlogEntry; url: string; title: string }) {
  const sections = entry.body.map((section, index) => ({ ...section, id: chapterId(section.heading, index) }));
  const explainer = entry.type === "explainer";

  return (
    <article className="bg-white text-[var(--ld-ink)]">
      <div className="doc-shell grid gap-[clamp(28px,4vw,64px)] py-[clamp(56px,7vw,96px)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {sections.length > 1 ? (
            <>
              <p className="mb-4 font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">In this piece</p>
              <ChapterRail chapters={sections.map((section) => ({ id: section.id, heading: section.heading }))} />
            </>
          ) : null}
          <div className="mt-6 border-t border-[var(--ld-line)] pt-5">
            <ShareRow url={url} title={title} />
          </div>
        </aside>

        <div className="min-w-0">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className={`mb-[clamp(40px,5vw,64px)] grid scroll-mt-28 gap-9 border-b border-[var(--ld-line)] pb-[clamp(40px,5vw,64px)] ${
                explainer && section.sidenote ? "xl:grid-cols-[minmax(0,1fr)_260px]" : ""
              }`}
            >
              <div className="max-w-[40rem]">
                <h2
                  id={`${section.id}-title`}
                  className="ld-display text-[clamp(26px,2.8vw,38px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance"
                >
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-[18px] text-[18.5px] leading-[1.75] text-pretty text-[#1f2747]">
                    {paragraph}
                  </p>
                ))}
                {section.media ? <SectionMedia media={section.media} /> : null}
              </div>
              {explainer && section.sidenote ? (
                <aside className="self-start rounded-[20px] border border-[rgb(28_58_140/0.15)] bg-[linear-gradient(160deg,#dfe6fb,#cfdafd)] p-5 xl:mt-[34px]">
                  <p className="flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.1em] text-[#2a3a72] uppercase">
                    <span aria-hidden="true" className="ld-display grid size-6 place-items-center rounded-[7px] bg-[var(--ld-paper)] text-sm font-extrabold text-[var(--ld-deep)]">
                      ≈
                    </span>
                    In the analogy
                  </p>
                  <p className="ld-display mt-3 text-[17px] leading-[1.45] font-medium tracking-[-0.01em] text-[#13204d]">{section.sidenote}</p>
                </aside>
              ) : null}
            </section>
          ))}

          <div className="grid items-center gap-5 rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="mb-3 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Written by</p>
              <Byline author={entry.author} />
            </div>
            <Link
              href="/contribute"
              className="justify-self-start border-b-2 border-[var(--ld-accent)] pb-0.5 text-[14.5px] font-semibold whitespace-nowrap"
            >
              Write for us →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export { PostBody };
