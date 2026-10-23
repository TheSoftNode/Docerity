import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { pad, type Siblings } from "@/components/sections/project-detail/project-detail-content";

/** The still to show for a project: its screenshot, or a clip's poster. */
function stillOf(media?: ProjectMedia): string | undefined {
  if (!media) return undefined;
  return media.type === "image" ? media.src : media.poster;
}

/**
 * Up next: the next project's name set huge in outline, filling with the
 * accent on hover while its screenshot slides in beside it, over a progress
 * line through the whole catalogue. A name alone gives no reason to click;
 * the picture is the reason.
 */
function UpNext({
  siblings,
  media,
}: {
  siblings: Siblings<Project>;
  media: Partial<Record<string, ProjectMedia>>;
}) {
  const { next, previous, total } = siblings;
  const nextPosition = (siblings.position % total) + 1;
  const still = stillOf(media[next.slug]);

  return (
    <section aria-label="More projects" className="relative overflow-hidden bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <div className="doc-shell pt-[clamp(64px,8vw,112px)] pb-[clamp(24px,3vw,40px)]">
        <div className="flex items-center justify-between gap-3.5 font-mono text-xs tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">
          <span>Up next</span>
          <span>
            {pad(nextPosition)} / {pad(total)}
          </span>
        </div>
        <div aria-hidden="true" className="mt-3.5 h-0.5 rounded-full bg-[rgb(var(--ld-tint-rgb)/0.14)]">
          <div
            className="ld-grow h-full rounded-full bg-[var(--ld-accent)]"
            style={{ width: `${Math.round((nextPosition / total) * 100)}%` }}
          />
        </div>

        <Link
          href={`/projects/${next.slug}`}
          className="group relative flex items-center justify-between gap-6 py-[clamp(40px,5vw,72px)] outline-none"
        >
          <span className="min-w-0">
            <span className="block font-mono text-[12.5px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              {next.category}
            </span>
            <span className="ld-display mt-3.5 block bg-[linear-gradient(90deg,var(--ld-accent)_0_50%,transparent_50%_100%)] bg-[length:200%_100%] bg-clip-text bg-[position:100%_0] text-[clamp(54px,10vw,168px)] leading-[0.86] font-extrabold tracking-[-0.06em] text-transparent transition-[background-position] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] [overflow-wrap:anywhere] [-webkit-text-stroke:1.5px_rgb(var(--ld-paper-rgb)/0.7)] group-hover:bg-[position:0_0] group-focus-visible:bg-[position:0_0] motion-reduce:transition-none">
              <span className="sr-only">Up next: </span>
              {next.name}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="grid size-[clamp(56px,6vw,88px)] shrink-0 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.25)] transition-[transform,background-color,color] duration-300 group-hover:translate-x-2.5 group-hover:bg-[var(--ld-accent)] group-hover:text-[var(--ld-ink)] group-focus-visible:bg-[var(--ld-accent)] group-focus-visible:text-[var(--ld-ink)]"
          >
            <ArrowRightIcon className="size-[40%]" />
          </span>
          {/* The peek: decoration, since the link already names the project. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-[clamp(80px,10vw,140px)] -mt-[120px] hidden aspect-[16/10] w-[clamp(260px,26vw,380px)] translate-x-8 translate-y-5 rotate-[4deg] scale-[0.94] overflow-hidden rounded-2xl border border-[rgb(var(--ld-tint-rgb)/0.25)] bg-[var(--ld-panel)] opacity-0 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:-rotate-3 group-hover:scale-100 group-hover:opacity-100 md:block motion-reduce:transition-none"
          >
            {still ? (
              <Image src={still} alt="" fill sizes="380px" className="object-cover object-left-top" />
            ) : (
              <span className="ld-display absolute inset-0 flex items-end p-5 text-[34px] font-extrabold tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgb(var(--ld-paper-rgb)/0.6)]">
                <span className="absolute -top-10 -right-10 size-40 rounded-full border-[18px] border-[rgb(var(--ld-accent-rgb)/0.75)]" />
                {next.name}
              </span>
            )}
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgb(var(--ld-tint-rgb)/0.14)] pt-5">
          <Link
            href={`/projects/${previous.slug}`}
            className="group inline-flex items-center gap-3 text-[15px] text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>
              <span className="mr-2 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">Previous</span>
              {previous.name}
            </span>
          </Link>
          <Link
            href="/projects"
            className="border-b-2 border-[var(--ld-accent)] pb-0.5 text-[15px] font-semibold text-[var(--ld-paper)]"
          >
            All {total} projects
          </Link>
        </div>
      </div>
    </section>
  );
}

export { UpNext };
