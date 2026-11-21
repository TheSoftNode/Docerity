import { ArrowUpRightIcon, AwardIcon, LockIcon } from "lucide-react";

import type { Project } from "@/components/sections/work/work-data";

/**
 * The proof for work that can't be shown by a live link or public code:
 * a note when the client's work is confidential, the prize it won, a
 * walkthrough video, exactly what the author did, and public proof of the
 * same technique. Shown only when at least one of them is filled in.
 */
function ProjectEvidence({ project }: { project: Project }) {
  const mine = project.contributions ?? [];
  const has = project.confidential || project.recognition || project.demoEmbed || mine.length || project.proofUrl;
  if (!has) return null;

  return (
    <section aria-labelledby="evidence-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell pt-[clamp(44px,5vw,80px)]">
        <h2 id="evidence-title" className="sr-only">
          The evidence
        </h2>

        {project.recognition || project.confidential ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {project.recognition ? (
              project.recognitionUrl ? (
                <a
                  href={project.recognitionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#ff7a59] px-4 text-[14px] font-semibold text-[#08102e]"
                >
                  <AwardIcon className="size-4" /> {project.recognition} <ArrowUpRightIcon className="size-3.5" />
                </a>
              ) : (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#ff7a59] px-4 text-[14px] font-semibold text-[#08102e]">
                  <AwardIcon className="size-4" /> {project.recognition}
                </span>
              )
            ) : null}
            {project.confidential ? (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--ld-card)] px-4 text-[14px] text-[var(--ld-text-2)] ring-1 ring-[rgb(8_16_46/0.08)]">
                <LockIcon className="size-4 text-[var(--ld-deep)]" /> Client work under NDA: the code and screens are private, so this page describes the work instead.
              </span>
            ) : null}
          </div>
        ) : null}

        <div className={project.demoEmbed && mine.length ? "grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]" : "grid gap-5"}>
          {project.demoEmbed ? (
            <figure className="overflow-hidden rounded-[22px] bg-[#0b1433] shadow-[0_24px_48px_-32px_rgb(8_16_46/0.45)]">
              <div className="relative aspect-video">
                <iframe
                  src={project.demoEmbed}
                  title={`${project.name}: walkthrough`}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 size-full"
                />
              </div>
              <figcaption className="px-5 py-3 text-[13.5px] text-[#9aa7cf]">A walkthrough of {project.name}.</figcaption>
            </figure>
          ) : null}

          {mine.length ? (
            <div className="rounded-[22px] bg-[var(--ld-card)] p-6 shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] sm:p-7">
              <h3 className="ld-display text-[22px] leading-tight font-semibold tracking-[-0.02em]">My part</h3>
              {project.role ? <p className="mt-1 text-[14px] text-[var(--ld-text-muted)]">{project.role}</p> : null}
              <ul className="mt-4 grid gap-3">
                {mine.map((item) => (
                  <li key={item} className="flex gap-3 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">
                    <span aria-hidden="true" className="mt-[11px] h-[3px] w-3 shrink-0 rounded-full bg-[var(--ld-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {project.proofUrl ? (
          <a
            href={project.proofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 flex items-center justify-between gap-4 rounded-[18px] bg-[var(--ld-deep)] px-5 py-4 text-white"
          >
            <span>
              <span className="block text-[13px] text-[#c9d5ff]">Public proof</span>
              <span className="block text-[15.5px] font-semibold">{project.proofLabel || "The same technique, in the open"}</span>
            </span>
            <ArrowUpRightIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        ) : null}
      </div>
    </section>
  );
}

export { ProjectEvidence };
