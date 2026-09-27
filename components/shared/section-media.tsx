import { MediaPlaceholder, type Media } from "@/components/shared/media-placeholder";

/**
 * The media slot inside a body section: a real image or clip, or the frame
 * that stands in for one.
 *
 * Post bodies and project case studies both draw this. Until now only the
 * dashed placeholder existed for posts, so an explainer about, say, caching
 * could describe a diagram and never show it.
 *
 * A Server Component. A `<video>` with `controls` needs no JavaScript, and
 * neither does an image, so none of this has to reach the browser as code.
 */
function SectionMedia({ media, tone = "light" }: { media: Media; tone?: "light" | "dark" }) {
  if (!media.src) return <MediaPlaceholder media={media} tone={tone} />;

  return (
    <figure className="my-6">
      {media.type === "video" ? (
        <video
          src={media.src}
          poster={media.poster}
          controls
          preload="metadata"
          /*
            No autoplay and no loop, unlike the clip on a work card. That one
            is decoration behind a heading; this one sits mid-paragraph and is
            the thing the reader is meant to watch, so it waits to be asked.
          */
          aria-label={media.alt || media.caption || "Clip"}
          className="w-full rounded-xl border border-border bg-card"
        />
      ) : (
        /*
          A plain <img>: the source is a Cloudinary URL that already carries
          `f_auto,q_auto` at the right width, so routing it through Next's
          optimiser would refetch and re-encode something already done. The
          same reasoning as the project pages.
        */
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={media.src}
          alt={media.alt ?? ""}
          loading="lazy"
          className="w-full rounded-xl border border-border"
        />
      )}
      {media.caption ? (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export { SectionMedia };
