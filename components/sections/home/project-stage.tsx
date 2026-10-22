"use client";

import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { ProjectMediaFill } from "@/components/sections/work/project-media-fill";

/* The stage is the wide column on desktop and the full width below `lg`. */
const STAGE_SIZES = "(min-width: 1024px) 60vw, 100vw";

/** Strips the scheme and trailing slash, which is how an address bar shows it. */
function displayHost(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
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
          <ProjectMediaFill project={project} media={media} reduceMotion={reduceMotion} sizes={STAGE_SIZES} />

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
