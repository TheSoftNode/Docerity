import { MailIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/lib/config/site";
import { Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { MentorshipFaqBackground } from "@/components/sections/mentorship-program/mentorship-faq-background";
import { faqs } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipFaq() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      <MentorshipFaqBackground />

      <Container className="relative grid grid-cols-1 gap-10 md:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <Eyebrow>FAQ</Eyebrow>
          <SectionTitle>Questions before you apply.</SectionTitle>
          <Lede>The things people usually ask before a first call.</Lede>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-7 inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <MailIcon className="size-4 text-primary" />
            Something else? <span className="font-medium text-foreground underline underline-offset-4">{siteConfig.email}</span>
          </a>
        </div>

        <FramedPanel innerClassName="px-6 sm:px-8">
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="py-5 font-heading text-base font-semibold text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { MentorshipFaq };
