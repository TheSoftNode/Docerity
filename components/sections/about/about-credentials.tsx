import { GraduationCapIcon, AwardIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import {
  Bloom,
  Eyebrow,
  HoverCard,
  Lede,
  SectionTitle,
} from "@/components/shared/section-kit";
import {
  certifications,
  education,
} from "@/components/sections/about/about-data";

/*
  Education and certifications share a section because separately each is a
  short list that would need its own heading, lede and band — three screens of
  scroll for information most visitors skim once.
*/
function AboutCredentials() {
  return (
    <section
      id="credentials"
      className="relative overflow-hidden border-b border-border/80 bg-background py-16 lg:py-24"
    >
      <Bloom className="top-0 left-1/4 -translate-y-1/2" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Credentials</Eyebrow>
          <SectionTitle>Studied, and certified.</SectionTitle>
          <Lede className="mt-5">
            The formal side: an engineering degree, two intensive programmes, and
            the certifications picked up along the way.
          </Lede>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="flex items-center gap-2.5 font-heading text-base font-semibold text-foreground">
              <GraduationCapIcon className="size-4 shrink-0 text-primary" />
              Education
            </h3>

            <ol className="mt-5 flex flex-col">
              {education.map((item) => (
                <li
                  key={item.qualification}
                  /* A hairline between rows rather than a card each: seven
                     bordered cards in a column reads as a lot of chrome around
                     three short lines of text. */
                  className="border-b border-border/70 py-4 first:pt-0 last:border-0 last:pb-0"
                >
                  <p className="text-pretty text-[0.9375rem] leading-snug font-medium text-foreground">
                    {item.qualification}
                  </p>
                  <div className="mt-1.5 flex flex-col gap-0.5 text-sm text-muted-foreground sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <span className="min-w-0">{item.institution}</span>
                    <span className="shrink-0 font-mono text-xs tracking-wider uppercase">
                      {item.period}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="flex items-center gap-2.5 font-heading text-base font-semibold text-foreground">
              <AwardIcon className="size-4 shrink-0 text-primary" />
              Certifications
            </h3>

            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {certifications.map((cert) => (
                <li key={cert.name}>
                  <HoverCard className="h-full">
                    <div className="flex h-full flex-col p-4">
                      <p className="text-pretty text-sm leading-snug font-medium text-foreground">
                        {cert.name}
                      </p>
                      <p className="mt-1.5 text-xs text-primary">{cert.issuer}</p>
                      <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                        {cert.detail}
                      </p>
                    </div>
                  </HoverCard>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { AboutCredentials };
