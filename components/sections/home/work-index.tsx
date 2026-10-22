"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CodeIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { WorkMedia } from "@/components/sections/work/work-media";

type Props = {
  projects: Project[];
  media: Partial<Record<string, ProjectMedia>>;
};

/* The preview is the wide column on desktop and the full width below `lg`. */
const PREVIEW_SIZES = "(min-width: 1024px) 60vw, 100vw";

/** Strips the scheme and trailing slash, which is how an address bar shows it. */
function displayHost(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * The featured projects as a numbered index, with one large preview.
 *
 * An index rather than a card grid because the grid gave every project equal,
 * small weight; here one project at a time gets the full width of a browser
 * frame, and the list stays short enough to read at a glance.
 *
 * The list is a set of toggle buttons rather than tabs: the preview is a
 * detail view of the pressed row, and each row's own page is one click away
 * in the preview's actions.
 */
function WorkIndex({ projects, media }: Props) {
  const [selected, setSelected] = useState(0);

  if (projects.length === 0) return null;

  const index = Math.min(selected, projects.length - 1);
  const project = projects[index];
  const total = String(projects.length).padStart(2, "0");
  const live = project.status === "Live";

  const step = (delta: number) =>
    setSelected((value) => (value + delta + projects.length) % projects.length);

  return (
    <div className="grid items-start gap-[clamp(32px,5vw,72px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
      <div className="min-w-0">
        <ul aria-label="Featured projects">
          {projects.map((item, position) => {
            const active = position === index;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(position)}
                  className={cn(
                    "group grid w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3.5 border-t border-[rgb(var(--ld-tint-rgb)/0.16)] py-4 text-left outline-none transition-colors duration-300",
                    "focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                    active ? "text-[var(--ld-paper)]" : "text-[var(--ld-muted-3)] hover:text-[var(--ld-paper)]"
                  )}
                >
                  <span className="font-mono text-xs">{item.index}</span>
                  <span className="flex min-w-0 items-center gap-3 transition-transform duration-300 group-hover:translate-x-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-0.5 shrink-0 bg-[var(--ld-accent)] transition-[width] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                        active ? "w-7" : "w-0"
                      )}
                    />
                    <span className="ld-display truncate text-[clamp(20px,2vw,26px)] font-bold tracking-[-0.02em]">
                      {item.name}
                    </span>
                  </span>
                  <span className="hidden items-center gap-2 font-mono text-[11px] text-[var(--ld-muted-3)] uppercase sm:inline-flex">
                    <span
                      aria-hidden="true"
                      className={cn("size-1.5 rounded-full", item.status === "Live" ? "bg-[#54D696]" : "bg-[#FFC94A]")}
                    />
                    {item.category}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--ld-tint-rgb)/0.16)] pt-5 font-mono text-xs text-[var(--ld-muted-3)]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#54D696]" /> Live
            <span aria-hidden="true" className="ml-2.5 size-1.5 rounded-full bg-[#FFC94A]" /> In progress
          </span>
          <Link href="/projects" className="border-b border-current text-[var(--ld-paper)] hover:opacity-70">
            All projects →
          </Link>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-end gap-3.5">
          <span className="font-mono text-[13px] text-[var(--ld-muted-2)]">
            <span className="text-[var(--ld-paper)]">{project.index}</span> / {total}
          </span>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => step(-1)}
            className="grid size-11 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.3)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => step(1)}
            className="grid size-11 place-items-center rounded-full bg-[var(--ld-accent)] text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowRightIcon className="size-4" />
          </button>
        </div>

        {/* Keyed by project, so changing it replays the entrance instead of
            swapping the screenshot in place under a static frame. */}
        <article key={project.slug} className="ld-zoom">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-[14px_-14px_-14px_14px] rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.22)]"
            />
            <div className="group relative overflow-hidden rounded-[20px] border border-[rgb(var(--ld-tint-rgb)/0.25)] bg-[var(--ld-deep)] shadow-[0_50px_100px_-50px_rgb(0_0_0/0.8)]">
              <div className="flex items-center gap-2.5 border-b border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[var(--ld-ink-2)] px-3.5 py-3">
                <span aria-hidden="true" className="flex gap-1.5">
                  <span className="size-[9px] rounded-full bg-[#FF6B3D]" />
                  <span className="size-[9px] rounded-full bg-[#FFC94A]" />
                  <span className="size-[9px] rounded-full bg-[#54D696]" />
                </span>
                <span className="min-w-0 flex-1 truncate rounded-full bg-[rgb(var(--ld-tint-rgb)/0.1)] px-3 py-1.5 font-mono text-[11px] text-[var(--ld-muted)]">
                  {project.liveUrl ? displayHost(project.liveUrl) : `docerity.com/projects/${project.slug}`}
                </span>
              </div>

              <WorkMedia
                media={media[project.slug]}
                variant={project.preview}
                sizes={PREVIEW_SIZES}
                className="bg-[var(--ld-deep)]"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-x-10 gap-y-5">
            <div className="min-w-0 flex-[1_1_320px]">
              <h3 className="ld-display flex items-center gap-3 text-[clamp(28px,3vw,38px)] font-extrabold tracking-[-0.035em]">
                {project.name}
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[11px] font-normal tracking-normal uppercase",
                    live ? "bg-[#54D696] text-[#06150e]" : "bg-[#FFC94A] text-[#1c1300]"
                  )}
                >
                  {project.status}
                </span>
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--ld-muted)]">{project.description}</p>
              <p className="mt-3 font-mono text-xs leading-relaxed text-[var(--ld-muted-3)]">
                {project.tags.join(" · ")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-4 text-sm font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
                >
                  Visit live site
                  <ArrowUpRightIcon className="size-3.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.3)] px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                Case study
              </Link>
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.3)] px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                >
                  <CodeIcon className="size-3.5" />
                  Code
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export { WorkIndex };
