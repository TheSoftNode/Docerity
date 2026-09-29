import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  GitBranchIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { SectionMedia } from "@/components/shared/section-media";
import { WorkMedia } from "@/components/sections/work/work-media";
import { BrowserFrame } from "@/components/sections/work/browser-frame";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";

/*
  Heading ids for the section nav.

  Derived from the heading rather than stored, because these headings are
  edited freely in the admin and a stored id would drift from the text it
  points at the first time one is reworded. A collision only costs a nav link
  that scrolls to the wrong one of two identically-named sections, which is a
  fair trade for ids that cannot go stale.
*/
function anchorFor(heading: string): string {
  return (
    heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** A dot in the status colour: live reads green, anything else amber. */
function StatusDot({ status }: { status: Project["status"] }) {
  return (
    <span className="relative flex size-2 shrink-0" aria-hidden>
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          status === "Live" ? "bg-brand-teal" : "bg-amber-500"
        )}
      />
      {status === "Live" ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-teal/60 motion-reduce:hidden" />
      ) : null}
    </span>
  );
}

/**
 * One fact in the spec strip.
 *
 * A strip rather than the sidebar card this used to be. The card put four
 * short facts in a tall box beside the title, which made the heaviest element
 * on the page the one carrying the least: a row of labelled values reads as a
 * spec sheet, which is what an engineering project page should look like, and
 * it leaves the hero a single column so the title can actually be big.
 */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 flex items-center gap-2 truncate text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

function WorkCaseStudy({
  project,
  projects,
  media,
}: {
  project: Project;
  /* The full published list, for the previous and next links. Passed in
     rather than imported, because it now comes from the database. */
  projects: Project[];
  media?: ProjectMedia;
}) {
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const saidInCategory = project.category
    .toLowerCase()
    .split("·")
    .map((part) => part.replace(/[\s-]/g, "").trim());
  const extraGroups = project.groups.filter(
    (group) => !saidInCategory.includes(group.toLowerCase().replace(/[\s-]/g, ""))
  );

  const sections = project.body ?? [];
  /* The nav earns its space at two sections and not at one, where it would be
     a table of contents for a single entry. */
  const showSectionNav = sections.length > 1;

  return (
    <article>
      {/*
        The hero band, on its own ground.

        The whole page used to sit on one flat background, so the title, the
        write-up and the footer links all read at the same weight and nothing
        said where to start. Giving the hero its own tinted field and a seam at
        the bottom is the cheapest way to make the page have a top.
      */}
      {/* The bottom padding leaves room for the screenshot below to be pulled
          up into this band, so the two read as one composition rather than as
          a header followed by a picture. */}
      <section className="relative border-b border-border/80 pt-10 pb-28 sm:pt-14 sm:pb-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 bg-surface-raised" />
          {/* One soft light source behind the title, not a gradient across the
              whole band: the screenshot below has to stay the brightest thing
              on the page. */}
          <div className="absolute -top-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>

        <Container className="relative">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            All projects
          </Link>

          <div className="mx-auto mt-8 max-w-4xl">
            {/*
              The filter buckets, minus anything the category already said.

              A project's category is "AI · Learning platform" and its groups
              are ["AI", "Full-stack"], so printing both gave
              "AI · Learning platform · AI · Full-stack". Matched case- and
              space-insensitively, because these are two free-text fields edited
              in different places and "Full-stack" is one word to a person.
            */}
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] tracking-[0.2em] text-primary uppercase">
              {project.category}
              {extraGroups.length > 0 ? (
                <>
                  <span aria-hidden className="text-muted-foreground/50">
                    ·
                  </span>
                  <span className="text-muted-foreground">
                    {extraGroups.join(" · ")}
                  </span>
                </>
              ) : null}
            </p>

            <h1 className="mt-4 font-heading text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
              {project.name}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {project.description}
            </p>

            {project.liveUrl || project.repoUrl ? (
              /*
                Real anchors carrying the button's classes, rather than the
                Button component with an anchor rendered into it. Base UI gives
                that arrangement `role="button"`, and these navigate: somebody
                on a screen reader running through the page's links should find
                "Visit MetaPilot" among them, and should be told it opens
                elsewhere before they follow it.
              */
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={buttonVariants({
                      size: "lg",
                      className: "h-11 px-5 text-sm",
                    })}
                  >
                    Visit {project.name}
                    <ArrowUpRightIcon className="size-4 shrink-0" />
                  </a>
                ) : null}
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "h-11 px-5 text-sm",
                    })}
                  >
                    <GitBranchIcon className="size-4 shrink-0" />
                    Source code
                  </a>
                ) : null}
              </div>
            ) : null}

            {/* The spec strip. Only the facts this project actually has:
                an empty "Client" on a personal project reads as missing data
                rather than as a project that had no client. */}
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/70 pt-6 sm:grid-cols-4">
              <Fact label="Status">
                <StatusDot status={project.status} />
                {project.status}
              </Fact>
              {project.client ? <Fact label="Built for">{project.client}</Fact> : null}
              {project.role ? <Fact label="Role">{project.role}</Fact> : null}
              {project.timeline ? <Fact label="Timeline">{project.timeline}</Fact> : null}
            </dl>
          </div>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container>
          {/*
            Lifted into the band above. The screenshot is the point of the
            page, and a seam drawn just above it made the hero look finished
            before the reader had seen what was built.

            `relative z-10` is what makes the lift work rather than merely move
            things: the hero is positioned, so without a stacking position of
            its own this block slides *under* the hero's background and loses
            however much of itself overlaps — which was the frame's whole
            chrome bar.
          */}
          <div className="relative z-10 mx-auto -mt-20 max-w-4xl sm:-mt-28">
            {/*
              The hero shot, in a browser frame.

              Every one of these is a screenshot of something running in a
              browser, and a bare bordered rectangle makes it read as an
              illustration. The chrome says "this is a real product, here is
              its address", which is the single claim the page most wants to
              make above the fold.
            */}
            <BrowserFrame url={project.liveUrl} label={project.name}>
              <WorkMedia
                media={media}
                variant={project.preview}
                /* Wider than a card here, so it asks for a bigger source. */
                sizes="(min-width: 1024px) 56rem, 100vw"
              />
            </BrowserFrame>

            {project.tags.length > 0 ? (
              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
                  Built with
                </span>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/*
              The gallery, below the hero.

              Two columns rather than one, because these are screenshots of the
              same product and seeing two side by side reads as a tour where a
              single column reads as a slideshow you have to scroll through.
            */}
            {project.gallery && project.gallery.length > 0 ? (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {project.gallery.map((image) => (
                  <figure key={image.src} className="group">
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        className="w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    </div>
                    {image.caption ? (
                      <figcaption className="mt-2.5 text-xs text-muted-foreground">
                        {image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </div>

          {/*
            The write-up, with its own navigation on a wide screen.

            A case study runs long, and the old page gave no way to see its
            shape or jump within it. The nav is sticky and marks nothing as
            current: doing that properly needs scroll tracking, and a wrong
            highlight is worse than none.
          */}
          <div
            className={cn(
              "mx-auto mt-16",
              showSectionNav
                ? "max-w-5xl lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14"
                : "max-w-4xl"
            )}
          >
            {showSectionNav ? (
              <nav
                aria-label="Sections of this write-up"
                className="mb-10 hidden lg:sticky lg:top-28 lg:mb-0 lg:block lg:self-start"
              >
                <p className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
                  In this write-up
                </p>
                <ul className="mt-4 space-y-2.5 border-l border-border">
                  {sections.map((section) => (
                    <li key={section.heading}>
                      <a
                        href={`#${anchorFor(section.heading)}`}
                        className="-ml-px block border-l border-transparent pl-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <div className="min-w-0">
              {sections.length > 0 ? (
                sections.map((section) => (
                  <section
                    key={section.heading}
                    id={anchorFor(section.heading)}
                    /* Offset so a jumped-to heading is not under the fixed
                       header. `scroll-mt` rather than padding, so it costs
                       nothing to the layout. */
                    className="mb-12 scroll-mt-28"
                  >
                    <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                      {section.heading}
                    </h2>
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph.slice(0, 24)}
                        className="mt-4 text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.image ? (
                      <figure className="my-7">
                        {/*
                          A plain <img>: the source is a Cloudinary URL that
                          already carries `f_auto,q_auto` at the right width, so
                          routing it through Next's optimiser would refetch and
                          re-encode something already done.
                        */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={section.image.src}
                          alt={section.image.alt}
                          loading="lazy"
                          className="w-full rounded-xl border border-border"
                        />
                        {section.image.caption ? (
                          <figcaption className="mt-2.5 text-xs text-muted-foreground">
                            {section.image.caption}
                          </figcaption>
                        ) : null}
                      </figure>
                    ) : section.media ? (
                      /* The dashed placeholder, still here for the entries in
                         `work-data.ts` that never had a real image. */
                      <SectionMedia media={section.media} tone="dark" />
                    ) : null}
                  </section>
                ))
              ) : (
                /*
                  Most of these projects have no published write-up yet. Rather
                  than pad the page with invented narrative (which is exactly
                  what the placeholder case studies did) it says so plainly and
                  sends the reader to the running thing.
                */
                <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 sm:p-8">
                  <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-primary uppercase">
                    Write-up
                  </p>
                  <p className="mt-3 max-w-[60ch] text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                    A full case study for this project hasn&apos;t been written
                    up yet. In the meantime the build itself is the best
                    description. It&apos;s running, and the source is public
                    where the licence allows &mdash; both are linked at the top
                    of this page.
                  </p>
                  {/* The links themselves are not repeated here. They are the
                      first thing in the hero now, and two links with the same
                      name going to the same place is noise in a tab order and
                      in a screen reader's link list. */}
                </div>
              )}

              {/*
                Results, as cards rather than the bullet list this was.

                Each one is a claim about what the build achieved, and a run of
                ticks down the left edge makes five claims read as one
                paragraph. Separated, each gets looked at.
              */}
              {project.results && project.results.length > 0 ? (
                <div className="mt-4">
                  <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-primary uppercase">
                    Results
                  </p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {project.results.map((result) => (
                      <li
                        key={result}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground/90"
                      >
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-teal" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-4xl">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="font-heading text-xl font-medium tracking-tight text-balance text-foreground sm:text-2xl">
                Got something like this to build?
              </p>
              <p className="max-w-[46ch] text-sm text-pretty text-muted-foreground">
                Tell us what you are working on and we will tell you what it
                would take.
              </p>
              <Button
                size="lg"
                className="mt-1 h-11 px-6 text-sm"
                nativeButton={false}
                render={<Link href="/contact" />}
              >
                Start a project
                <ArrowRightIcon />
              </Button>
            </div>

            {/*
              Previous and next, each carrying the project's own screenshot.

              A name alone gives no reason to click. The picture is the reason,
              and it is already loaded for the grid these come from.
            */}
            {(prevProject || nextProject) && (
              <nav
                aria-label="Other projects"
                className="mt-6 grid gap-3 sm:grid-cols-2"
              >
                {[
                  { project: prevProject, direction: "Previous" as const },
                  { project: nextProject, direction: "Next" as const },
                ].map(({ project: sibling, direction }) =>
                  sibling ? (
                    <Link
                      key={direction}
                      href={`/projects/${sibling.slug}`}
                      className={cn(
                        "group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40",
                        direction === "Next" && "sm:col-start-2 sm:flex-row-reverse sm:text-right"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors group-hover:border-primary/40 group-hover:text-primary"
                        )}
                      >
                        {direction === "Previous" ? (
                          <ArrowLeftIcon className="size-4" />
                        ) : (
                          <ArrowRightIcon className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
                          {direction}
                        </span>
                        <span className="mt-1 block truncate font-heading text-sm font-medium text-foreground">
                          {sibling.name}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    /* An empty cell keeps Next on the right when there is no
                       Previous, so the pair always reads as a pair. */
                    <span key={direction} aria-hidden />
                  )
                )}
              </nav>
            )}
          </div>
        </Container>
      </section>
    </article>
  );
}

export { WorkCaseStudy };
