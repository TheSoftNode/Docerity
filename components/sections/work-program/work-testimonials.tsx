import { Container } from "@/components/shared/container";
import { WorkTestimonialsBackground } from "@/components/sections/work-program/work-testimonials-background";
import { testimonials } from "@/components/sections/testimonials/testimonials-data";

const clientTestimonials = testimonials.filter((t) => t.role.includes("Company"));

function WorkTestimonials() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20">
      <WorkTestimonialsBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            From clients
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            What it&apos;s like to work together.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {clientTestimonials.map((testimonial) => (
            <figure
              key={testimonial.name + testimonial.role}
              className="rounded-xl border border-border/80 bg-card p-6"
            >
              <blockquote className="text-sm leading-relaxed text-foreground/90 sm:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{testimonial.name}</span>{" "}
                &middot; {testimonial.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { WorkTestimonials };
