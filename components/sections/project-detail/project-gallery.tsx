import type { ProjectImage } from "@/components/sections/work/work-data";

/**
 * More screens from the same product, two to a row, so they read as a tour
 * rather than a slideshow to scroll through.
 */
function ProjectGallery({ images, name }: { images: readonly ProjectImage[]; name: string }) {
  if (images.length === 0) return null;

  return (
    <section aria-labelledby="gallery-title" className="bg-[var(--ld-paper-2)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(56px,7vw,96px)]">
        <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Gallery</p>
        <h2
          id="gallery-title"
          className="ld-display text-[clamp(32px,4vw,56px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
        >
          More of {name}.
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {images.map((image) => (
            <li key={image.src}>
              <figure className="group">
                <div className="overflow-hidden rounded-[18px] border border-[var(--ld-line)] bg-[var(--ld-paper)]">
                  {/* A plain <img>: the source is a Cloudinary URL already
                      sized and encoded, so the optimiser would only redo it. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                {image.caption ? (
                  <figcaption className="mt-2.5 font-mono text-xs text-[var(--ld-text-muted)]">{image.caption}</figcaption>
                ) : null}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { ProjectGallery };
