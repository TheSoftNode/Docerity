"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, QuoteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { testimonials as placeholderTestimonials } from "@/components/sections/testimonials/testimonials-data";

/**
 * The shape this renders, which approved reviews are mapped into.
 *
 * Structural, not `typeof testimonials[number]`: that one is a readonly tuple
 * from an `as const` array, so a mapped array of real reviews would not satisfy
 * it.
 */
export type SpotlightQuote = {
  quote: string;
  name: string;
  role: string;
};

const INTERVAL = 5200;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, isActive }: { name: string; isActive: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <span className="relative flex size-10 shrink-0 items-center justify-center">
      {isActive && (
        <motion.span
          aria-hidden
          className="absolute inset-0 -m-1 rounded-full border border-dashed border-primary/50"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        />
      )}
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full border bg-card font-heading text-xs font-semibold transition-colors duration-300",
          isActive
            ? "border-primary text-primary"
            : "border-border text-muted-foreground group-hover:text-foreground"
        )}
      >
        {getInitials(name)}
      </span>
    </span>
  );
}

/**
 * People on the left, their words on the right.
 *
 * The selector used to be a row of bare initials above a centred quote, which
 * said nothing about who was speaking until you clicked. Each entry now shows
 * a name and role, the list and the quote sit side by side from `lg`, and a
 * progress bar makes the auto-advance legible instead of surprising.
 */
function TestimonialSpotlight({
  header,
  quotes,
}: {
  header?: ReactNode;
  /**
   * Approved reviews from the database. Omitted or empty falls back to the
   * placeholder set, so the section renders on a clone with no MONGODB_URI and
   * before the first review is approved. Without the fallback the homepage
   * would show an empty band rather than a section.
   */
  quotes?: SpotlightQuote[];
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const testimonials: SpotlightQuote[] =
    quotes && quotes.length > 0 ? quotes : [...placeholderTestimonials];

  useEffect(() => {
    /*
      Auto-advance stops under reduced motion, matching every other timed
      component here. Content that replaces itself on a timer is movement the
      reader did not ask for (the quote they were halfway through is simply
      gone), and it is the case WCAG's "pause, stop, hide" is about. The
      avatars still step through the list manually.
    */
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, INTERVAL);
    return () => window.clearInterval(id);
    /* `testimonials.length` rather than the array: a new array identity on
       every render would restart the timer on every render, which is the bug
       the About page's CountUp had. */
  }, [active, reduceMotion, testimonials.length]);

  const testimonial = testimonials[active];

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:gap-16">
      <div>
        {header}

        <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {testimonials.map((t, index) => {
            const isActive = index === active;
            return (
              <li key={t.name + index}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show testimonial from ${t.name}`}
                  aria-pressed={isActive}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-300",
                    isActive
                      ? "border-primary/30 bg-card"
                      : "border-transparent hover:border-border hover:bg-card/50"
                  )}
                >
                  <Avatar name={t.name} isActive={isActive} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {t.role}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* The way to the full set, and to the form. Without it the section is
            a dead end and nobody finds the reviews page from the homepage. */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/reviews" />}
          >
            Read all reviews
            <ArrowRightIcon />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/reviews#leave-a-review" />}
          >
            Leave one
          </Button>
        </div>
      </div>

      {/* Framed like the Work and Mentorship cards. */}
      <div className="rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_50%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
        <figure className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-card px-7 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
          {/* Inside the frame. Hung off the corner it was clipped by the
              card's rounded edge into a stray bracket shape. */}
          <QuoteIcon
            aria-hidden
            className="pointer-events-none absolute top-6 right-6 size-16 text-primary/[0.12] sm:top-8 sm:right-8 sm:size-20"
            strokeWidth={1.25}
          />

          <div className="relative min-h-[12rem] sm:min-h-[10rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
              >
                <blockquote className="text-pretty font-heading text-xl leading-snug font-medium text-foreground sm:text-2xl lg:text-[1.75rem]">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <Avatar name={testimonial.name} isActive />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {testimonial.role}
                    </span>
                  </span>
                </figcaption>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Time left on this quote. Restarts whenever the quote changes,
              including on a click, because the interval restarts too. */}
          <div className="mt-8 flex items-center gap-4">
            <span className="h-px flex-1 overflow-hidden bg-border">
              <motion.span
                key={active}
                className="block h-full bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))]"
                initial={{ width: "0%" }}
                animate={{ width: reduceMotion ? "0%" : "100%" }}
                transition={{ duration: INTERVAL / 1000, ease: "linear" }}
              />
            </span>
            <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </figure>
      </div>
    </div>
  );
}

export { TestimonialSpotlight };
