"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  removeProject,
  reorderProject,
  setProjectFeatured,
  setProjectPublished,
  type SimpleResult,
} from "@/app/admin/work/actions";

export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  category: string;
  groups: string[];
  status: string;
  published: boolean;
  featured: boolean;
  thumbnailUrl: string;
  position: number;
  isFirst: boolean;
  isLast: boolean;
};

function ProjectRow({ project }: { project: ProjectSummary }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function run(action: () => Promise<SimpleResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-card px-3 py-3 transition-opacity sm:px-4",
        project.published ? "border-border" : "border-amber-500/30",
        pending && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 text-center font-mono text-[0.6875rem] text-muted-foreground">
          {String(project.position).padStart(2, "0")}
        </span>

        {project.thumbnailUrl ? (
          /* Already sized by Cloudinary or a pre-optimised file in public/, so
             next/image would refetch and re-encode something that is done. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailUrl}
            alt=""
            className="h-11 w-16 shrink-0 rounded border border-border object-cover"
          />
        ) : (
          <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded border border-dashed border-border">
            <ImageIcon aria-hidden className="size-4 text-muted-foreground" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/work/${project.id}`}
              className="truncate font-heading text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {project.name || "Untitled"}
            </Link>

            {project.featured ? (
              <StarIcon aria-label="On the homepage" className="size-3 fill-amber-400 text-amber-400" />
            ) : null}

            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wide",
                project.published
                  ? "bg-brand-teal/15 text-brand-teal"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              {project.published ? "Live" : "Draft"}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {project.category || project.slug}
          </p>

          <div className="mt-1 flex flex-wrap gap-1">
            {project.groups.map((group) => (
              <span
                key={group}
                className="rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[0.625rem] text-muted-foreground"
              >
                {group}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {/* Order is the grid's order, so it is edited here rather than as a
              number buried in the form. */}
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={pending || project.isFirst}
            aria-label={`Move ${project.name} up`}
            onClick={() => run(() => reorderProject(project.id, -1))}
          >
            <ChevronUpIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={pending || project.isLast}
            aria-label={`Move ${project.name} down`}
            onClick={() => run(() => reorderProject(project.id, 1))}
          >
            <ChevronDownIcon />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={
              project.featured
                ? `Remove ${project.name} from the homepage`
                : `Show ${project.name} on the homepage`
            }
            onClick={() => run(() => setProjectFeatured(project.id, !project.featured))}
          >
            <StarIcon className={project.featured ? "fill-amber-400 text-amber-400" : ""} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={project.published ? `Unpublish ${project.name}` : `Publish ${project.name}`}
            onClick={() => run(() => setProjectPublished(project.id, !project.published))}
          >
            {project.published ? <EyeOffIcon /> : <EyeIcon />}
          </Button>

          {project.published ? (
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={
                <Link href={`/work/${project.slug}`} target="_blank" aria-label={`View ${project.name}`} />
              }
            >
              <ExternalLinkIcon />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href={`/admin/work/${project.id}`} aria-label={`Edit ${project.name}`} />}
          >
            <PencilIcon />
          </Button>

          {confirmingDelete ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => run(() => removeProject(project.id))}
              >
                Delete
              </Button>
              <Button variant="ghost" size="sm" disabled={pending} onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label={`Delete ${project.name}`}
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2Icon />
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </article>
  );
}

export { ProjectRow };
