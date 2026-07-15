import { CheckIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { siteConfig } from "@/lib/config/site";
import { ContactBackground } from "@/components/sections/contact/contact-background";
import { ContactForm } from "@/components/sections/contact/contact-form";
import { steps } from "@/components/sections/contact/contact-data";

function Contact() {
  return (
    <>
      <section className="border-b border-border/80 bg-background pt-16 pb-14 sm:pt-20 sm:pb-16">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              New project
            </p>
            <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Tell me what you&apos;re building.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              A few details now save a lot of back-and-forth later — I read
              every message myself.
            </p>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#f3f1ea] py-16 sm:py-24">
        <ContactBackground />

        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
            <div className="flex flex-col justify-center">
              <ol className="flex flex-col gap-6">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#0b1330]/15 font-mono text-xs text-[#0b1330]/60">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-heading text-base font-medium text-[#0b1330]">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#0b1330]/60">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex items-center gap-2 border-t border-[#0b1330]/10 pt-6 text-sm text-[#0b1330]/70">
                <CheckIcon className="size-4 shrink-0 text-primary" />
                <span>
                  Prefer email? Reach me directly at{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="font-medium text-[#0b1330] underline underline-offset-4"
                  >
                    {siteConfig.email}
                  </a>
                </span>
              </div>
            </div>

            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}

export { Contact };
