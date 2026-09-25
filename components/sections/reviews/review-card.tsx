"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { StarDisplay } from "@/components/sections/reviews/star-rating";
import type { PublicReview } from "@/lib/reviews/display";

/**
 * Initials, for a review with no photo.
 *
 * The portfolio stored "default.jpg" as a sentinel and rendered it as an image,
 * so any review without a photo showed a broken icon once that file moved.
 * Initials cannot 404.
 */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * One review, as a numbered entry in a record.
 *
 * The first version was a rounded card with a quote glyph in the corner, which
 * is what every testimonial section on the internet looks like. This carries the
 * same mono header rail as the About dossier and the blog console: an index, the
 * rating, a hairline under them. The page then reads as one document rather than
 * a pile of cards borrowed from somewhere else.
 */
function ReviewCard({
  review,
  index,
  className,
}: {
  review: PublicReview;
  /** Position in the record, rendered as 01, 02, and so on. */
  index: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.figure
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        /* Capped, so the twentieth review is not still fading in a second and a
           half after it entered the viewport. */
        delay: reduceMotion ? 0 : Math.min(index, 3) * 0.08,
        ease: "easeOut",
      }}
      className={cn(
        "group/review rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_72%),var(--border)_45%)] p-px transition-shadow duration-300 hover:shadow-[0_30px_70px_-45px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-2.5 sm:px-6">
          <span className="font-mono text-[0.625rem] tracking-[0.16em] uppercase text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <StarDisplay rating={review.rating} />
        </div>

        <blockquote className="flex-1 px-5 pt-5 pb-4 text-[0.9375rem] leading-[1.75] text-foreground/90 sm:px-6">
          {review.body}
        </blockquote>

        <figcaption className="flex items-center gap-3 px-5 pb-5 sm:px-6">
          {review.photoUrl ? (
            /*
              A plain <img>, not next/image. The source is a Cloudinary URL that
              already carries `f_auto,q_auto,c_fill,g_face` and comes from their
              CDN, so routing it through Next's optimiser would fetch and
              re-encode an image that is already the right size and format.
            */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.photoUrl}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-[0.6875rem] font-semibold text-primary"
            >
              {initialsOf(review.fullName)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {review.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{review.title}</p>
          </div>

          {review.links.length > 0 ? (
            <a
              href={review.links[0].url}
              target="_blank"
              /*
                `noopener` is what matters: without it the opened page gets a
                `window.opener` handle back to this one and can navigate it.
                `noreferrer` also withholds the referrer header.
              */
              rel="noopener noreferrer nofollow"
              className="inline-flex shrink-0 items-center gap-1 rounded font-mono text-[0.6875rem] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {review.links[0].title}
              <ArrowUpRightIcon className="size-3" />
            </a>
          ) : null}
        </figcaption>
      </div>
    </motion.figure>
  );
}

export { ReviewCard, initialsOf };
