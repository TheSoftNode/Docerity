"use client";

import { useState, useTransition } from "react";
import {
  CheckIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  MailIcon,
  Trash2Icon,
  UndoIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StarDisplay } from "@/components/sections/reviews/star-rating";
import { initialsOf } from "@/components/sections/reviews/review-card";
import {
  approveReview,
  rejectReview,
  removeReview,
  type ActionResult,
} from "@/app/admin/reviews/actions";

export type ModeratedReview = {
  id: string;
  fullName: string;
  title: string;
  body: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  contactEmail: string;
  photoUrl: string;
  links: { title: string; url: string }[];
  submittedAt: string;
};

function ReviewRow({ review }: { review: ModeratedReview }) {
  /* `useTransition` rather than a boolean: it also keeps the row responsive
     while the action runs, and the pending flag ends when the server's
     re-render arrives rather than when the promise resolves. */
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-card px-4 py-4 transition-opacity sm:px-5",
        review.status === "pending" ? "border-amber-500/30" : "border-border",
        pending && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {review.photoUrl ? (
            /* Cloudinary already returns this at 96px in a modern format, so
               next/image would refetch and re-encode an optimised file. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.photoUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[0.6875rem] font-semibold text-primary"
            >
              {initialsOf(review.fullName)}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {review.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{review.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StarDisplay rating={review.rating} />
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wide",
              review.status === "pending" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
              review.status === "approved" && "bg-brand-teal/15 text-brand-teal",
              review.status === "rejected" && "bg-muted text-muted-foreground"
            )}
          >
            {review.status}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
        {review.body}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <a
          href={`mailto:${review.contactEmail}`}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <MailIcon className="size-3.5" />
          {review.contactEmail}
        </a>
        <time dateTime={review.submittedAt}>
          {new Date(review.submittedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
        {review.links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            {link.title}
            <ExternalLinkIcon className="size-3" />
          </a>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
        {review.status !== "approved" ? (
          <Button size="sm" disabled={pending} onClick={() => run(() => approveReview(review.id))}>
            {pending ? <LoaderCircleIcon className="animate-spin" /> : <CheckIcon />}
            {review.status === "rejected" ? "Approve after all" : "Approve"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => rejectReview(review.id))}
          >
            <UndoIcon />
            Unpublish
          </Button>
        )}

        {review.status === "pending" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => rejectReview(review.id))}
          >
            <XIcon />
            Reject
          </Button>
        ) : null}

        {/*
          Two-step delete, and the only destructive action here that asks.
          Approve and reject are reversible from this same row; removing the
          document and its Cloudinary asset is not.
        */}
        <div className="ml-auto flex items-center gap-2">
          {confirmingDelete ? (
            <>
              <span className="text-xs text-muted-foreground">Delete permanently?</span>
              <Button
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() => run(() => removeReview(review.id))}
              >
                Yes, delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Delete the review from ${review.fullName}`}
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2Icon />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export { ReviewRow };
