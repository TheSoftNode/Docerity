"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import type { CertificationView, EducationView } from "@/lib/content/blocks/views";
import { pad } from "@/components/sections/blog-page/blog-content";

/**
 * Credentials: the certificate scans as a wall, with a viewer beside it that
 * shows the chosen one large enough to read, then the education list. A card
 * reading a certificate's name is a claim; the scan is the evidence. One
 * without a scan falls back to its text, in both places.
 */
function AboutCredentials({
  heading,
  certifications,
  education,
}: {
  heading: SectionHeading;
  certifications: CertificationView[];
  education: EducationView[];
}) {
  const [active, setActive] = useState(0);
  if (certifications.length === 0 && education.length === 0) return null;
  const chosen = certifications[active];

  return (
    <section id="credentials" aria-labelledby="credentials-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
          <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">Signed</span>
          {heading.eyebrow}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-[22px]">
          <h2 id="credentials-title" className="ld-display max-w-[14ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
            {heading.title}
          </h2>
          {heading.lede ? <p className="max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
        </div>

        <div className="mt-[clamp(40px,5vw,60px)] grid items-start gap-[clamp(20px,3vw,44px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <ul aria-label="Certifications" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {certifications.map((cert, index) => {
              const on = index === active;
              return (
                <li key={cert.name}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive(index)}
                    className={cn(
                      "block h-full w-full overflow-hidden rounded-2xl border bg-white text-left outline-none transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 hover:-rotate-[0.6deg] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0",
                      on ? "border-[var(--ld-ink)] shadow-[0_24px_50px_-34px_rgb(var(--ld-ink-rgb)/0.6)]" : "border-[var(--ld-line)]"
                    )}
                  >
                    <span className="relative m-2 block aspect-[1.42] overflow-hidden rounded-[9px] bg-[#f4f2ec]">
                      {cert.image ? (
                        <Image src={cert.image} alt="" fill sizes="(min-width: 1024px) 14vw, (min-width: 640px) 30vw, 45vw" className="object-contain p-1" />
                      ) : (
                        <span className="grid h-full place-items-center bg-[#eef1f8] px-2 text-center font-mono text-[10.5px] text-[var(--ld-text-muted)] uppercase">
                          No scan · text only
                        </span>
                      )}
                    </span>
                    <span className="block px-3 pt-1 pb-3">
                      <span className="block text-sm leading-snug font-semibold">{cert.name}</span>
                      <span className="mt-[3px] block text-[12.5px] text-[var(--ld-text-muted)]">{cert.issuer}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="grid gap-4 lg:sticky lg:top-28">
            {chosen ? (
              <figure key={chosen.name} aria-live="polite" className="ld-pop rounded-3xl bg-[var(--ld-ink)] p-[18px] text-[var(--ld-paper)]">
                <div className="relative aspect-[1.42] overflow-hidden rounded-[14px] bg-[#f4f2ec]">
                  {chosen.image ? (
                    <Image src={chosen.image} alt={`${chosen.name} certificate`} fill sizes="(min-width: 1024px) 34vw, 92vw" className="object-contain p-2" />
                  ) : (
                    <span className="grid h-full place-items-center px-6 text-center">
                      <span>
                        <span className="block font-mono text-[11px] tracking-[0.2em] text-[#8a7f62] uppercase">No scan on file</span>
                        <span className="ld-display mt-2 block text-[clamp(18px,2vw,26px)] font-extrabold text-[#3b3626]">{chosen.name}</span>
                      </span>
                    </span>
                  )}
                </div>
                <figcaption className="flex items-start justify-between gap-3.5 px-1.5 pt-4 pb-1">
                  <span>
                    <span className="block text-[17px] font-semibold">{chosen.name}</span>
                    <span className="mt-1 block text-sm text-[var(--ld-muted)]">
                      {chosen.issuer}. {chosen.detail}
                    </span>
                  </span>
                  <span className="flex-none font-mono text-xs text-[var(--ld-muted-3)]">
                    {pad(active + 1)} / {pad(certifications.length)}
                  </span>
                </figcaption>
              </figure>
            ) : null}

            {education.length > 0 ? (
              <div className="rounded-[20px] border border-[var(--ld-line)] bg-white px-[18px] py-2">
                <h3 className="mt-2.5 mb-1 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Education</h3>
                <ul>
                  {education.map((entry) => (
                    <li key={`${entry.qualification}-${entry.institution}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3.5 border-b border-[#eef1f8] py-[11px] last:border-0">
                      <span>
                        <span className="block text-[14.5px] font-semibold">{entry.qualification}</span>
                        <span className="block text-[13px] text-[var(--ld-text-muted)]">{entry.institution}</span>
                      </span>
                      <span className="font-mono text-xs text-[var(--ld-text-muted)]">{entry.period}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export { AboutCredentials };
