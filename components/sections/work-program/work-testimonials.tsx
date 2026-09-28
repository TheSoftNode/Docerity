import { QuoteIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, SectionTitle } from "@/components/shared/section-kit";
import { WorkTestimonialsBackground } from "@/components/sections/work-program/work-testimonials-background";
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
 * Reviews from people we built something for, or nothing at all.
 *
 * It used to read the placeholder set and pick the entries whose role happened
 * to contain the word "Company", which is how "Client Name, Founder, Company"
 * ended up quoted on the work page. Who left a review is now a field on the
 * review (`kind`) chosen by the person writing it, not a guess made from their
 * job title.
 *
 * Same rule as the mentorship page: below the minimum the section is absent
 * rather than fictional. See TESTIMONIAL_MINIMUM.
 */
async function WorkTestimonials() {
  const heading = await getHeading("services", "work-testimonials");
  const reviews = await getPublicReviews(4, "client");

  if (reviews.length < TESTIMONIAL_MINIMUM) return null;

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      <WorkTestimonialsBackground />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <SectionTitle>{heading.title}</SectionTitle>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-14 lg:gap-6">
          {reviews.map((testimonial) => (
            <HoverCard key={testimonial.id} innerClassName="p-6 sm:p-8">
              <figure className="flex h-full flex-col">
                <QuoteIcon className="size-7 text-primary/50" strokeWidth={1.25} />
                <blockquote className="mt-5 flex-1 font-heading text-lg leading-snug font-medium text-foreground sm:text-xl">
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
                    <span className="block text-xs text-muted-foreground">
                      {testimonial.title}
                    </span>
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
