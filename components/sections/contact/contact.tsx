import { Suspense } from "react";
import { CheckIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { siteConfig } from "@/lib/config/site";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { ContactBackground } from "@/components/sections/contact/contact-background";
import { ContactForm, ContactFormFallback } from "@/components/sections/contact/contact-form";
import { steps } from "@/components/sections/contact/contact-data";

function Contact() {
  return (
    /*
      One section, two columns — what you're sending on the left, where you
      send it on the right. This used to be a centred header above a light
      ivory panel, which put a hard seam between the dark page and the form.
    */
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-12 sm:py-16 lg:py-20">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

      <Container className="relative grid grid-cols-1 gap-12 md:grid-cols-[0.85fr_1fr] lg:gap-16">
        <div className="flex flex-col">
          <Eyebrow>New project</Eyebrow>
          <HeroTitle>Tell me what you&apos;re building.</HeroTitle>
          <Lede className="mt-6">
            A few details now save a lot of back-and-forth later &mdash; I read
            every message myself.
          </Lede>

          <ol className="mt-10 flex flex-col gap-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-card font-mono text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-heading text-base font-semibold text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex items-center gap-2 border-t border-border/80 pt-6 text-sm text-muted-foreground">
            <CheckIcon className="size-4 shrink-0 text-brand-teal" />
            <span>
              Prefer email? Reach me directly at{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {siteConfig.email}
              </a>
            </span>
          </div>
        </div>

        <div className="relative">
          <ContactBackground />
          <Suspense fallback={<ContactFormFallback />}>
            <ContactForm />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}

export { Contact };
