import { getHeading } from "@/lib/content/blocks/source";
import { getFeaturedWork } from "@/lib/content/work";
import { WorkIndex } from "@/components/sections/home/work-index";

/**
 * Selected work, as an index beside a preview.
 *
 * The featured projects and their media are read exactly as the previous grid
 * read them (`getFeaturedWork`), so choosing what is featured, and uploading a
 * screenshot or clip, still happens in the admin. The heading is the same
 * editable `home-work` entry.
 */
async function HomeWork() {
  const [heading, work] = await Promise.all([
    getHeading("homepage", "home-work"),
    getFeaturedWork(),
  ]);

  return (
    <section
      id="work"
      aria-labelledby="home-work-title"
      className="scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]"
    >
      <div className="doc-shell py-16 sm:py-24 lg:py-28">
        <div className="mb-[clamp(36px,5vw,64px)] max-w-3xl">
          <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
            {heading.eyebrow}
          </p>
          <h2
            id="home-work-title"
            className="ld-display text-[clamp(40px,5.6vw,80px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
          >
            {heading.title}
          </h2>
          {heading.lede ? (
            <p className="mt-5 max-w-[40rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">
              {heading.lede}
            </p>
          ) : null}
        </div>

        <WorkIndex projects={work.projects} media={work.media} />
      </div>
    </section>
  );
}

export { HomeWork };
