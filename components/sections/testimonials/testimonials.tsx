import { Container } from "@/components/shared/container";
import { TestimonialsBackground } from "@/components/sections/testimonials/testimonials-background";
import { TestimonialSpotlight } from "@/components/sections/testimonials/testimonial-spotlight";

function Testimonials() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-20 sm:py-24">
      <TestimonialsBackground />

      <Container className="relative">
        <p className="text-center font-mono text-xs tracking-[0.2em] text-primary uppercase">
          What people say
        </p>

        <div className="mt-8">
          <TestimonialSpotlight />
        </div>
      </Container>
    </section>
  );
}

export { Testimonials };
