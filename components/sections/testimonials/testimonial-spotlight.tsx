"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QuoteIcon } from "lucide-react";

import { testimonials } from "@/components/sections/testimonials/testimonials-data";

const INTERVAL = 5200;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AvatarButton({
  name,
  isActive,
  onClick,
}: {
  name: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show testimonial from ${name}`}
      className="relative flex shrink-0 items-center justify-center"
    >
      {isActive && (
        <motion.span
          aria-hidden
          className="absolute inset-0 -m-1.5 rounded-full border border-dashed border-primary/40"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        />
      )}
      <span
        className={
          isActive
            ? "flex size-12 items-center justify-center rounded-full border-2 border-primary bg-card font-heading text-sm font-medium text-primary transition-all sm:size-14 sm:text-base"
            : "flex size-9 items-center justify-center rounded-full border border-border bg-card font-heading text-xs font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:text-foreground sm:size-10"
        }
      >
        {getInitials(name)}
      </span>
    </button>
  );
}

function TestimonialSpotlight() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  const testimonial = testimonials[active];

  return (
    <div className="relative mx-auto max-w-2xl text-center">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
        {testimonials.map((t, index) => (
          <AvatarButton
            key={t.name + index}
            name={t.name}
            isActive={index === active}
            onClick={() => setActive(index)}
          />
        ))}
      </div>

      <div className="relative mt-10">
        <QuoteIcon
          aria-hidden
          className="pointer-events-none absolute -top-8 left-1/2 size-28 -translate-x-1/2 text-primary/[0.08] sm:size-36"
          strokeWidth={1}
        />

        <div className="relative min-h-[11rem] sm:min-h-[9rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <blockquote className="line-clamp-4 font-heading text-xl leading-snug font-medium text-foreground sm:text-2xl lg:text-[1.75rem]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <p className="mt-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{testimonial.name}</span>
                {" — "}
                {testimonial.role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { TestimonialSpotlight };
