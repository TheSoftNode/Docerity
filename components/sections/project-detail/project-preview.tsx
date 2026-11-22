"use client";

import { LockIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { ProjectMediaFill } from "@/components/sections/work/project-media-fill";
import { hostOf } from "@/components/sections/project-detail/project-detail-content";
import { statusDot } from "@/lib/content/project-schema";

/**
 * The product, in a browser window that sits half in the hero's ink and half
 * on the paper below, so the top of the page and the rest of it read as one
 * composition.
 *
 * The address bar says where the screenshot lives; a private project shows
 * its name there rather than a made-up URL. A client component only because
 * a clip must not start itself under reduced motion.
 */
function ProjectPreview({ project, media }: { project: Project; media?: ProjectMedia }) {
  const reduceMotion = useReducedMotion() ?? false;
  const host = hostOf(project.liveUrl);
  const live = project.status === "Live";

  return (
    <section
      aria-label={`${project.name} preview`}
      className="relative bg-[linear-gradient(var(--ld-ink)_0_52%,var(--ld-paper)_52%_100%)] pt-[clamp(24px,3.5vw,44px)]"
    >
      <div className="doc-shell [perspective:1600px]">
        <figure className="ld-lift mx-auto max-w-[1180px] overflow-hidden rounded-[18px] sm:rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[var(--ld-panel)] shadow-[0_80px_140px_-60px_rgb(var(--ld-ink-rgb)/0.85),0_0_0_10px_rgb(var(--ld-tint-rgb)/0.05)]">
          <div className="flex items-center gap-2 border-b border-[rgb(var(--ld-tint-rgb)/0.12)] bg-[var(--ld-ink-2)] px-4 py-3">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-[#FF6B3D]" />
            <span aria-hidden="true" className="size-2.5 rounded-full bg-[#FFC94A]" />
            <span aria-hidden="true" className="size-2.5 rounded-full bg-[#54D696]" />
            <span className="mx-auto inline-flex max-w-[55%] items-center gap-2 truncate rounded-[9px] bg-[rgb(var(--ld-tint-rgb)/0.08)] px-4 py-1.5 font-mono text-[12.5px] text-[var(--ld-muted)]">
              <LockIcon aria-hidden="true" className="size-3 shrink-0 text-[#54D696]" />
              <span className="truncate">{host || project.name}</span>
            </span>
            <span className="hidden items-center gap-1.5 text-[12.5px] text-[var(--ld-muted)] sm:inline-flex">
              <span aria-hidden="true" className={`size-1.5 rounded-full ${live ? "bg-[#54D696]" : statusDot(project.status)}`} />
              {project.status}
            </span>
          </div>
          {/* Without a screenshot the frame only holds the name again, so it
              stays short rather than taking a screen of its own. */}
          <div className={`relative overflow-hidden bg-[var(--ld-panel)] ${media ? "aspect-[16/9]" : "aspect-[16/8] sm:aspect-[21/7]"}`}>
            <ProjectMediaFill
              project={project}
              media={media}
              reduceMotion={reduceMotion}
              sizes="(min-width: 1280px) 1240px, 100vw"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}

export { ProjectPreview };
