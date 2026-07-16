import { QuoteIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { MentorshipTestimonialsBackground } from "@/components/sections/mentorship-program/mentorship-testimonials-background";
import { mentorshipTestimonials } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipTestimonials() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20">
      <MentorshipTestimonialsBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            From mentees
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Real progress, in their words.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {mentorshipTestimonials.map((testimonial) => (
            <figure
              key={testimonial.name + testimonial.role}
              className="flex flex-col rounded-xl border border-border/80 bg-card p-6"
            >
              <QuoteIcon className="size-5 text-primary/60" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {testimonial.name}
                </span>{" "}
                &middot; {testimonial.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { MentorshipTestimonials };
