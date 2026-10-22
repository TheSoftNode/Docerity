"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";

/* The stage is the wide column on desktop and the full width below `lg`. */
const STAGE_SIZES = "(min-width: 1024px) 60vw, 100vw";

/**
 * Captures wider than this pan sideways, the rest pan downwards. 16:10 is the
 * frame, so anything noticeably wider has more to show across than down.
 */
const WIDE = 1.75;

function displayHost(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * A screenshot that fills the frame and tours itself.
 *
 * Shown with `cover` so the frame is always full, never a capture floating in
 * an empty band, and slowly panned across so the parts `cover` crops are
 * still seen: down the page for a tall capture, across it for a wide one. The
 * direction is decided once the image has loaded and its real proportions are
 * known. Under reduced motion it holds still at the top, which is where the
 * product's own header and headline are.
 */
function TouringImage({ src, alt }: { src: string; alt: string }) {
  const [axis, setAxis] = useState<"x" | "y">("y");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={STAGE_SIZES}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (image.naturalHeight > 0 && image.naturalWidth / image.naturalHeight > WIDE) setAxis("x");
      }}
      className={cn("object-cover object-top", axis === "x" ? "ld-pan-x" : "ld-pan-y")}
    />
  );
}

/**
 * The poster for a project with no screenshot or clip yet: its name large and
 * outlined, with what it is and what it is built with. Designed, rather than
 * a grey skeleton standing in for a picture that is not there.
 */
function Poster({ project }: { project: Project }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-[var(--ld-panel)] p-[clamp(18px,3vw,36px)]">
      <div
        aria-hidden="true"
        className="ld-drift absolute -right-16 -bottom-24 size-[min(60%,420px)] rounded-full border-[32px] border-[rgb(var(--ld-accent-rgb)/0.75)]"
      />
      <p className="relative font-mono text-[11px] tracking-[0.12em] text-[var(--ld-tint)] uppercase">
        {project.category}
      </p>
      <p
        aria-hidden="true"
        className="ld-display relative text-[clamp(44px,7vw,104px)] leading-[0.9] font-extrabold tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_rgb(var(--ld-paper-rgb)/0.55)]"
      >
        {project.name}
      </p>
      <ul className="relative flex flex-wrap gap-2">
        {project.tags.slice(0, 5).map((tag, index) => (
          <li
            key={tag}
            className="ld-up rounded-full border border-[rgb(var(--ld-paper-rgb)/0.2)] px-3 py-1.5 font-mono text-[11px] text-[var(--ld-muted)]"
            style={{ animationDelay: `${0.15 + index * 0.08}s` }}
          >
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The project showcase's stage: a browser frame whose whole viewport is the
 * project, and the progress line that times the move to the next one. Nothing
 * is laid over the picture; the project's name, status and links sit below.
 *
 * Keyed by project in the parent, so each change replays the entrance.
 */
function ProjectStage({
  project,
  media,
  reduceMotion,
  progress,
}: {
  project: Project;
  media?: ProjectMedia;
  reduceMotion: boolean;
  /** The auto-advance timer, drawn along the frame's bottom edge; null when it is not running. */
  progress: { durationMs: number; paused: boolean } | null;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute inset-[14px_-14px_-14px_14px] rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.22)]"
      />
      <div className="relative overflow-hidden rounded-[20px] border border-[rgb(var(--ld-tint-rgb)/0.25)] bg-[var(--ld-ink-2)] shadow-[0_50px_100px_-50px_rgb(0_0_0/0.8)]">
        <div className="flex items-center gap-2.5 border-b border-[rgb(var(--ld-tint-rgb)/0.16)] px-3.5 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-[9px] rounded-full bg-[#FF6B3D]" />
            <span className="size-[9px] rounded-full bg-[#FFC94A]" />
            <span className="size-[9px] rounded-full bg-[#54D696]" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-full bg-[rgb(var(--ld-tint-rgb)/0.1)] px-3 py-1.5 font-mono text-[11px] text-[var(--ld-muted)]">
            {project.liveUrl ? displayHost(project.liveUrl) : `docerity.com/projects/${project.slug}`}
          </span>
        </div>

        <div className="ld-stage-in relative aspect-[16/10] overflow-hidden bg-[var(--ld-ink)]">
          {!media ? (
            <Poster project={project} />
          ) : media.type === "image" ? (
            <TouringImage src={media.src} alt={media.alt} />
          ) : (
            <video
              src={media.src}
              poster={media.poster}
              muted
              loop
              playsInline
              /* A clip that starts itself is motion nobody asked for, so under
                 reduced motion it stays on its poster frame. */
              autoPlay={!reduceMotion}
              preload="metadata"
              aria-label={media.alt}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          )}

          {progress ? (
            <span
              aria-hidden="true"
              className="ld-progress absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--ld-accent)]"
              style={{
                animationDuration: `${progress.durationMs}ms`,
                animationPlayState: progress.paused ? "paused" : "running",
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { ProjectStage };
