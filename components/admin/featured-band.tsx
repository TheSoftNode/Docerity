"use client";

import { useState, useTransition } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  StarOffIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { reorderFeatured, setProjectFeatured } from "@/app/admin/projects/actions";

export type FeaturedProject = {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  published: boolean;
};

/**
 * The homepage band, in the order the homepage shows it.
 *
 * Separate from the list below it, and arranged separately, because the two
 * orders answer different questions. The catalogue on /projects is ordered so
 * twenty-five entries read well; this is six picked to make a case to somebody
 * four seconds into the site. Sharing one order meant every homepage
 * rearrangement quietly reshuffled the catalogue.
 *
 * The band renders in this order top to bottom, which is why it is a list
 * rather than the grid it becomes on the site: the grid's wrapping depends on
 * the viewport, and "first" is the only position that is the same everywhere.
 */
function FeaturedBand({
  projects,
  max,
}: {
  projects: FeaturedProject[];
  max: number;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message ?? "That did not work.");
    });
  }

  const free = max - projects.length;

  return (
    <section
      aria-labelledby="homepage-band"
      className="mt-5 overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <div>
          <h2
            id="homepage-band"
            className="font-heading text-sm font-semibold text-foreground"
          >
            On the homepage
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Shown in this order, first at the top. Star a project below to add
            one.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em]",
            free === 0
              ? "bg-amber-500/15 text-amber-500"
              : "bg-primary/10 text-primary"
          )}
        >
          {projects.length} of {max}
        </span>
      </div>

      {projects.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted-foreground">
          Nothing is featured, so the homepage is showing the first {max}{" "}
          projects from the list below. Star the ones you want there instead.
        </p>
      ) : (
        <ol className="divide-y divide-border/60">
          {projects.map((project, index) => (
            <li key={project.id} className="flex items-center gap-3 px-3 py-2.5">
              <span
                aria-hidden
                className="flex w-6 shrink-0 items-center gap-1 font-mono text-[0.6875rem] tabular-nums text-muted-foreground"
              >
                <GripVerticalIcon className="size-3 text-muted-foreground/50" />
                {index + 1}
              </span>

              {project.thumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={project.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="h-9 w-14 shrink-0 rounded-md border border-border object-cover"
                />
              ) : (
                <span className="h-9 w-14 shrink-0 rounded-md border border-dashed border-border" />
              )}

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {project.name}
                </span>
                <span className="block truncate font-mono text-[0.625rem] uppercase tracking-[0.1em] text-muted-foreground">
                  {project.category}
                </span>
              </span>

              {/* A featured draft is on nobody's homepage. Said here rather
                  than left to be discovered by looking at the live site. */}
              {!project.published ? (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-amber-500">
                  Draft
                </span>
              ) : null}

              <span className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="subtle"
                  size="icon-xs"
                  aria-label={`Move ${project.name} up`}
                  disabled={pending || index === 0}
                  onClick={() => run(() => reorderFeatured(project.id, -1))}
                >
                  <ChevronUpIcon />
                </Button>
                <Button
                  variant="subtle"
                  size="icon-xs"
                  aria-label={`Move ${project.name} down`}
                  disabled={pending || index === projects.length - 1}
                  onClick={() => run(() => reorderFeatured(project.id, 1))}
                >
                  <ChevronDownIcon />
                </Button>
                <Button
                  variant="subtle-danger"
                  size="icon-xs"
                  aria-label={`Take ${project.name} off the homepage`}
                  title="Take off the homepage"
                  disabled={pending}
                  onClick={() => run(() => setProjectFeatured(project.id, false))}
                >
                  <StarOffIcon />
                </Button>
              </span>
            </li>
          ))}
        </ol>
      )}

      {error ? (
        <p role="alert" className="border-t border-border/70 px-4 py-2.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export { FeaturedBand };
