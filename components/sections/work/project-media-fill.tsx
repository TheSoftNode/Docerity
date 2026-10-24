"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";

/**
 * Captures wider than this pan sideways, the rest pan downwards. 16:10 is the
 * frame, so anything noticeably wider has more to show across than down.
 */
const WIDE = 1.75;

/**
 * When a screenshot tours itself: all the time (a single stage that is the
 * focus of its section), or only while its card is hovered (a grid, where
 * thirty pictures moving at once would be noise).
 */
export type TourMode = "always" | "hover";

/**
 * A screenshot that fills its frame and tours itself.
 *
 * Shown with `cover` so the frame is always full, never a capture floating in
 * an empty band, and slowly panned so the parts `cover` crops are still seen:
 * down the page for a tall capture, across it for a wide one. The direction is
 * decided once the image has loaded and its real proportions are known. Under
 * reduced motion it holds still at the top, where the product's own header and
 * headline are.
 */
function TouringImage({
  src,
  alt,
  sizes,
  tour,
}: {
  src: string;
  alt: string;
  sizes: string;
  tour: TourMode;
}) {
  const [axis, setAxis] = useState<"x" | "y">("y");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (image.naturalHeight > 0 && image.naturalWidth / image.naturalHeight > WIDE) setAxis("x");
      }}
      className={cn(
        "object-cover object-top",
        axis === "x" ? "ld-pan-x" : "ld-pan-y",
        tour === "hover" && "ld-pan-on-hover"
      )}
    />
  );
}

/**
 * The poster for a project with no screenshot or clip yet: its name large and
 * outlined, with what it is and what it is built with. Designed, rather than
 * a grey skeleton standing in for a picture that is not there.
 *
 * `compact` is the card-sized version, with a smaller name and no stack.
 */
function ProjectPoster({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between overflow-hidden bg-[var(--ld-panel)]",
        compact ? "p-4" : "p-[clamp(18px,3vw,36px)]"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "ld-drift absolute rounded-full border-[rgb(var(--ld-accent-rgb)/0.75)]",
          compact ? "-right-10 -bottom-16 size-[60%] border-[20px]" : "-right-16 -bottom-24 size-[min(60%,420px)] border-[32px]"
        )}
      />
      <p className="relative font-mono text-[11px] tracking-[0.12em] text-[var(--ld-tint)] uppercase">
        {project.category}
      </p>
      <p
        aria-hidden="true"
        className={cn(
          "ld-display relative leading-[0.9] font-extrabold tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_rgb(var(--ld-paper-rgb)/0.55)]",
          compact ? "text-[clamp(28px,3vw,42px)]" : "text-[clamp(44px,7vw,104px)]"
        )}
      >
        {project.name}
      </p>
      {compact ? null : (
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
      )}
    </div>
  );
}

/**
 * Whatever a project has to show, filling the frame it is put in: a touring
 * screenshot, a silent looping clip, or the poster. The parent owns the frame
 * (its aspect ratio, corners and border); this only fills it.
 */
function ProjectMediaFill({
  project,
  media,
  reduceMotion,
  sizes,
  tour = "always",
  compact = false,
}: {
  project: Project;
  media?: ProjectMedia;
  reduceMotion: boolean;
  sizes: string;
  tour?: TourMode;
  compact?: boolean;
}) {
  if (!media) return <ProjectPoster project={project} compact={compact} />;

  if (media.type === "image") {
    return <TouringImage src={media.src} alt={media.alt} sizes={sizes} tour={tour} />;
  }

  return (
    <video
      src={media.src}
      poster={media.poster}
      muted
      loop
      playsInline
      /* A clip that starts itself is motion nobody asked for, so under reduced
         motion it stays on its poster frame. In a grid it waits for a hover,
         so a page of thirty cards is not thirty videos decoding at once. */
      autoPlay={!reduceMotion && tour === "always"}
      onPointerEnter={(event) => {
        if (!reduceMotion && tour === "hover") void event.currentTarget.play().catch(() => {});
      }}
      onPointerLeave={(event) => {
        if (tour === "hover") event.currentTarget.pause();
      }}
      preload="metadata"
      aria-label={media.alt}
      className="absolute inset-0 h-full w-full object-cover object-top"
    />
  );
}

export { ProjectMediaFill, ProjectPoster };
