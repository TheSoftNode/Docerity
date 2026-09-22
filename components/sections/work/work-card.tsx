"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";

import type { projects } from "@/components/sections/work/work-data";
import { WorkMedia } from "@/components/sections/work/work-media";

const MAX_TILT = 5;

function WorkCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * MAX_TILT * 2);
    rotateX.set(-relY * MAX_TILT * 2);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      /*
        `initial` must not depend on `useReducedMotion()`. That hook reports
        false during SSR and true on a reduced-motion client, so branching here
        made the server emit `opacity: 0` while the client emitted nothing —
        a hydration mismatch React declines to patch, which left every card
        permanently invisible. The entrance is identical on both sides now and
        only its duration responds to the setting.
      */
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: "easeOut", delay: index * 0.1 }
      }
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
      /*
        A 1px gradient frame rather than a flat border: the card is a padded
        gradient with an opaque panel inset into it, so the hairline can go
        from sapphire at the top to violet at the bottom on hover. A plain
        `border-color` transition cannot do that.
      */
      className="group relative rounded-2xl bg-[linear-gradient(to_bottom,var(--border),color-mix(in_oklch,var(--border),transparent_55%))] p-px transition-[background-image,box-shadow] duration-500 hover:bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))] hover:shadow-[0_28px_60px_-28px_color-mix(in_oklch,var(--brand-primary),transparent_55%)] focus-within:bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))]"
    >
      <div className="@container relative flex h-full flex-col overflow-hidden rounded-[calc(1rem-1px)] bg-card">
        <div className="relative">
          <WorkMedia slug={project.slug} variant={project.preview} />

          {/* Scrim: the media dissolves into the card instead of ending on a
              hard rule, so the two halves read as one surface. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--card),color-mix(in_oklch,var(--card),transparent_40%)_45%,transparent)]"
          />

          {/* Sits in the scrim at the foot of the media, not the top-left
              corner — the generated previews draw their own window chrome
              there and the two collided. Here it also reads as the label
              above the project name. */}
          <span className="absolute bottom-3 left-6 rounded-full border border-border/80 bg-background/70 px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-foreground/80 uppercase backdrop-blur-md sm:left-7">
            {project.category}
          </span>

          <span
            aria-hidden
            className="absolute top-2 right-4 font-heading text-[3.5rem] leading-none font-semibold text-foreground/[0.07] transition-colors duration-500 group-hover:text-primary/20"
          >
            {project.index}
          </span>
        </div>

        <div className="relative flex flex-1 flex-col px-6 pt-5 pb-6 sm:px-7 sm:pb-7">
          <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {/*
              Stretched link: the anchor wraps the visible name, and its
              `::after` covers the whole card for the click target. An earlier
              version put an absolute overlay span inside an otherwise empty
              anchor, which left the <a> itself zero-sized — keyboard focus
              landed on nothing visible. The card's `focus-within` frame shows
              focus; the arrow in the footer is decoration.
            */}
            <Link
              href={`/work/${project.slug}`}
              className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-2xl"
            >
              {project.name}
              <span className="sr-only"> — view case study</span>
            </Link>
          </h3>

          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border/80 px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-300 group-hover:border-border"
              >
                {tag}
              </li>
            ))}
          </ul>

          {/*
            `mt-auto` pins every footer to the same line across the row,
            however long a description runs.

            The row splits on the *card's* width, not the viewport's — a
            container query. Viewport breakpoints cannot see that a card is
            narrow, so at 1280 the middle card's metric wrapped while its
            neighbours' did not, knocking the whole row out of alignment.
          */}
          <div className="mt-auto flex flex-col items-start gap-2 border-t border-border/80 pt-5 @[21.5rem]:flex-row @[21.5rem]:items-center @[21.5rem]:justify-between @[21.5rem]:gap-4">
            <p className="flex items-center gap-2 font-heading text-sm font-semibold whitespace-nowrap text-primary">
              <span aria-hidden className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--brand-primary)]" />
              {project.metric}
            </p>
            <span
              aria-hidden
              className="inline-flex items-center gap-1 text-sm whitespace-nowrap text-foreground/60 transition-colors duration-300 group-hover:text-foreground"
            >
              View case study
              <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export { WorkCard };
