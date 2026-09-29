import { QuoteIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, SectionTitle } from "@/components/shared/section-kit";
import { MentorshipTestimonialsBackground } from "@/components/sections/mentorship-program/mentorship-testimonials-background";
import { getPublicReviews, TESTIMONIAL_MINIMUM } from "@/lib/reviews/display";
import { getHeading } from "@/lib/content/blocks/source";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Real mentee reviews, or nothing at all.
 *
 * This section used to render three invented quotes attributed to "Mentee
 * Name, Software Engineer". Invented testimonials are the same liability as
 * the invented case studies the projects page used to carry: the first prospect
 * who asks who said it is a bad moment.
 *
 * So there is no fallback here, unlike every other section. An absent section
 * says nothing; a section of fictional people says something false. It appears
 * once two real mentees have left a review.
 */
async function MentorshipTestimonials() {
  const heading = await getHeading("mentorship", "mentorship-testimonials");
  const reviews = await getPublicReviews(6, "mentee");

  if (reviews.length < TESTIMONIAL_MINIMUM) return null;

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24">
      <MentorshipTestimonialsBackground />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <SectionTitle>{heading.title}</SectionTitle>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {reviews.map((testimonial) => (
            <HoverCard key={testimonial.id} innerClassName="p-6 sm:p-7">
              <figure className="flex h-full flex-col">
                <QuoteIcon className="size-7 text-primary/50" strokeWidth={1.25} />
                <blockquote className="mt-5 flex-1 font-heading text-lg leading-snug font-medium text-foreground">
                  &ldquo;{testimonial.body}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/80 pt-5">
                  <span className="flex size-9 items-center justify-center rounded-full border border-primary/40 bg-background font-heading text-xs font-semibold text-primary">
                    {getInitials(testimonial.fullName)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {testimonial.fullName}
                    </span>
                    <span className="block text-xs text-muted-foreground">{testimonial.title}</span>
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
