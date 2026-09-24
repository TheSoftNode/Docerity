import { ExternalLinkIcon, QuoteIcon } from "lucide-react";

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

function ReviewCard({
  review,
  className,
}: {
  review: PublicReview;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_72%),var(--border)_45%)] p-px",
        className
      )}
    >
      <div className="flex h-full flex-col rounded-2xl bg-card px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <StarDisplay rating={review.rating} />
          <QuoteIcon aria-hidden className="size-5 shrink-0 text-primary/25" />
        </div>

        <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-[1.7] text-foreground/90">
          {review.body}
        </blockquote>

        <figcaption className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
          {review.photoUrl ? (
            /*
              A plain <img>, not next/image. The source is a Cloudinary URL that
              already carries `f_auto,q_auto,c_fill,g_face` and is served from
              their CDN, so routing it through Next's optimiser would fetch and
              re-encode an image that is already the right size and format.
            */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.photoUrl}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="size-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary"
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
              className="inline-flex shrink-0 items-center gap-1 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {review.links[0].title}
              <ExternalLinkIcon className="size-3" />
            </a>
          ) : null}
        </figcaption>
      </div>
    </figure>
  );
}

export { ReviewCard, initialsOf };
