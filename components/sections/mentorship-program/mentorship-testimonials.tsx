import { QuoteIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, SectionTitle } from "@/components/shared/section-kit";
import { MentorshipTestimonialsBackground } from "@/components/sections/mentorship-program/mentorship-testimonials-background";
import { mentorshipTestimonials } from "@/components/sections/mentorship-program/mentorship-program-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MentorshipTestimonials() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24">
      <MentorshipTestimonialsBackground />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>From mentees</Eyebrow>
          <SectionTitle>Real progress, in their words.</SectionTitle>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {mentorshipTestimonials.map((testimonial) => (
            <HoverCard key={testimonial.name + testimonial.role} innerClassName="p-6 sm:p-7">
              <figure className="flex h-full flex-col">
                <QuoteIcon className="size-7 text-primary/50" strokeWidth={1.25} />
                <blockquote className="mt-5 flex-1 font-heading text-lg leading-snug font-medium text-foreground">
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

export { MentorshipTestimonials };
