import { QuoteIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, SectionTitle } from "@/components/shared/section-kit";
import { WorkTestimonialsBackground } from "@/components/sections/work-program/work-testimonials-background";
import { testimonials } from "@/components/sections/testimonials/testimonials-data";

const clientTestimonials = testimonials.filter((t) => t.role.includes("Company"));

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function WorkTestimonials() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      <WorkTestimonialsBackground />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>From clients</Eyebrow>
          <SectionTitle>What it&apos;s like to work together.</SectionTitle>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-14 lg:gap-6">
          {clientTestimonials.map((testimonial) => (
            <HoverCard key={testimonial.name + testimonial.role} innerClassName="p-6 sm:p-8">
              <figure className="flex h-full flex-col">
                <QuoteIcon className="size-7 text-primary/50" strokeWidth={1.25} />
                <blockquote className="mt-5 flex-1 font-heading text-lg leading-snug font-medium text-foreground sm:text-xl">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/80 pt-5">
                  <span className="flex size-9 items-center justify-center rounded-full border border-primary/40 bg-background font-heading text-xs font-semibold text-primary">
                    {getInitials(testimonial.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {testimonial.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">{testimonial.role}</span>
                  </span>
                </figcaption>
              </figure>
            </HoverCard>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { WorkTestimonials };
