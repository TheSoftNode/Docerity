"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  EyeIcon,
  EyeOffIcon,
  ExternalLinkIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ContentIcon } from "@/components/shared/content-icon";
import { changePostStatus, removePost } from "@/app/admin/posts/actions";

export type PostSummary = {
  id: string;
  type: "explainer" | "article";
  slug: string;
  title: string;
  hook: string;
  status: "draft" | "published";
  tags: string[];
  readTime: string;
  iconName: string;
  publishedAt: string | null;
  updatedAt: string;
  sections: number;
};

function PostRow({ post }: { post: PostSummary }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const live = post.status === "published";

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message ?? "That did not work.");
    });
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-card px-4 py-3.5 transition-opacity sm:px-5",
        live ? "border-border" : "border-amber-500/30",
        pending && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <ContentIcon name={post.iconName} className="size-4 text-primary" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* The title is the edit link: it is the thing you want to click. */}
            <Link
              href={`/admin/posts/${post.id}`}
              className="truncate font-heading text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {post.title || "Untitled"}
            </Link>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wide",
                live ? "bg-brand-teal/15 text-brand-teal" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              {live ? "Live" : "Draft"}
            </span>
            <span className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
              {post.type}
            </span>
          </div>

          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{post.hook}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6875rem] text-muted-foreground">
            <span>/blog/{post.slug}</span>
            <span>
              {post.sections} {post.sections === 1 ? "section" : "sections"}
            </span>
            {post.readTime ? <span>{post.readTime}</span> : null}
            <span>
              {live && post.publishedAt
                ? `published ${new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : `edited ${new Date(post.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {live ? (
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={
                <Link href={`/blog/${post.slug}`} target="_blank" aria-label="View the live post" />
              }
            >
              <ExternalLinkIcon />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href={`/admin/posts/${post.id}`} aria-label={`Edit ${post.title}`} />}
          >
            <PencilIcon />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            aria-label={live ? `Unpublish ${post.title}` : `Publish ${post.title}`}
            onClick={() =>
              run(() => changePostStatus(post.id, live ? "draft" : "published"))
            }
          >
            {live ? <EyeOffIcon /> : <EyeIcon />}
          </Button>

          {confirmingDelete ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => run(() => removePost(post.id))}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label={`Delete ${post.title}`}
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

export { PostRow };
