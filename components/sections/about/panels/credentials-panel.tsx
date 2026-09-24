import Image from "next/image";

import { certifications, education } from "@/components/sections/about/about-data";

/*
  The certificates show their actual scans. A card reading "Google IT Support
  Specialist" is a claim; the certificate is the evidence, and it was sitting
  unused in the portfolio's assets.
*/
function CredentialsPanel() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h3 className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          Education
        </h3>

        <ol className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          {education.map((item) => (
            <li
              key={item.qualification}
              /* A hairline between rows rather than a card each: seven
                 bordered cards is a lot of chrome around three short lines. */
              className="border-b border-border/70 py-3.5 last:border-0"
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
        <h3 className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          Certifications
        </h3>

        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {certifications.map((cert) => (
            <li key={cert.name}>
              <div className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/40">
                {/*
                  `contain`, not `cover`. These are documents ranging from 1.29
                  to 1.78 against a 16:10 frame, and the widest cropped the
                  recipient's name off both sides, which is the one thing on a
                  certificate worth seeing.
                */}
                {cert.image ? (
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/70 bg-background p-2">
                    <Image
                      src={cert.image}
                      alt={`${cert.name} certificate`}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 40vw, 90vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : null}

                <div className="p-4">
                  <p className="text-pretty text-sm leading-snug font-medium text-foreground">
                    {cert.name}
                  </p>
                  <p className="mt-1.5 text-xs text-primary">{cert.issuer}</p>
                  <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                    {cert.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { CredentialsPanel };
