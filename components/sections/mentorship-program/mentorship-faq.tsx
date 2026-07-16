import { Container } from "@/components/shared/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MentorshipFaqBackground } from "@/components/sections/mentorship-program/mentorship-faq-background";
import { faqs } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipFaq() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-card py-16 sm:py-20">
      <MentorshipFaqBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            FAQ
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Questions before you apply.
          </h2>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-border/80 bg-background px-6">
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="font-heading text-base font-medium text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}

export { MentorshipFaq };
