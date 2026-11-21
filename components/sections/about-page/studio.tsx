import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, Code2Icon, DownloadIcon, GraduationCapIcon, PenLineIcon } from "lucide-react";

import type { SectionHeading } from "@/lib/content/blocks/source";
import type { FactView, FounderView } from "@/lib/content/blocks/views";
import { safeLink } from "@/lib/content/blocks/links";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { cn } from "@/lib/utils";

/*
  The studio half of the About page: what Docerity is, what it does, and who
  started it (with the way through to the founder's own portfolio at /theo).
  Compact on purpose: medium-sized display type, light weights, and the
  site's three card tones.
*/

const HEADSHOT = "/about/headshot.webp";

export function StudioHero({ heading, facts }: { heading: SectionHeading; facts: FactView[] }) {
  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[linear-gradient(180deg,var(--ld-ink)_0%,#0b1844_62%,#13296b_100%)] pt-[124px] pb-[clamp(40px,5vw,64px)] text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="ld-beam pointer-events-none absolute -top-[20%] left-[8%] h-[140%] w-[40%] rotate-[14deg] bg-[linear-gradient(100deg,transparent_30%,rgb(var(--ld-tint-rgb)/0.07)_50%,transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[40%] left-1/2 aspect-[2.4/1] w-[min(120vw,1600px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(64_110_230/0.36),transparent_62%)]"
      />
      <div className="doc-shell relative">
        <div className="grid items-end gap-[clamp(20px,3vw,56px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <h1 className="ld-display ld-up text-[clamp(34px,4.4vw,58px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            <TitlePieces title={heading.title} />
          </h1>
          {heading.lede ? <p className="ld-up ld-delay-2 text-[clamp(15.5px,1.15vw,17.5px)] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}
        </div>
        {facts.length > 0 ? (
          <dl className="ld-up ld-delay-3 mt-[clamp(28px,4vw,48px)] grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.slice(0, 4).map((fact) => (
              <div key={fact.label} title={fact.since} className="rounded-[18px] bg-[rgb(var(--ld-tint-rgb)/0.07)] p-4 ring-1 ring-[rgb(var(--ld-tint-rgb)/0.14)] sm:p-5">
                <dd className="ld-display text-[clamp(24px,2.4vw,32px)] leading-none font-semibold tracking-[-0.02em]">{fact.value}</dd>
                <dt className="mt-2 text-[13px] text-[var(--ld-muted)]">{fact.label}</dt>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

const PILLARS = [
  { key: "build", Icon: Code2Icon, links: [{ href: "/projects", label: "See the work" }], tone: "ld-keep-dark bg-[#0b1433] text-[#f4f5fa]", soft: "text-[#c4cbe3]", accent: "text-[#ff9a80]", chip: "bg-[#ff7a59] text-[#08102e]" },
  { key: "explain", Icon: PenLineIcon, links: [{ href: "/blog", label: "Read the blog" }], tone: "bg-[var(--ld-deep)] text-white", soft: "text-[#d5dffc]", accent: "text-[#afc4ff]", chip: "bg-[rgb(255_255_255/0.12)] text-white" },
  {
    key: "teach",
    Icon: GraduationCapIcon,
    links: [
      { href: "/mentorship", label: "Mentorship" },
      { href: "/academy", label: "The Academy" },
    ],
    tone: "bg-[linear-gradient(160deg,#e4eafc,#cdd9fd)] text-[#08102e]",
    soft: "text-[#323953]",
    accent: "text-[#1c3a8c]",
    chip: "bg-[#1c3a8c] text-white",
  },
] as const;

export function StudioPillars({ headings }: { headings: Record<"build" | "explain" | "teach", SectionHeading> }) {
  return (
    <section aria-label="What the studio does" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(40px,5vw,72px)]">
        <ul className="grid gap-3 md:grid-cols-3">
          {PILLARS.map(({ key, Icon, links, tone, soft, accent, chip }) => {
            const heading = headings[key];
            return (
              <li key={key} className={cn("flex flex-col rounded-[22px] p-6 sm:p-7", tone)}>
                <span className={cn("grid size-10 place-items-center rounded-[12px]", chip)}>
                  <Icon className="size-5" />
                </span>
                <h2 className="ld-display mt-5 text-[22px] leading-tight font-semibold tracking-[-0.02em]">{heading.title}</h2>
                {heading.lede ? <p className={cn("mt-2 text-[15px] leading-relaxed", soft)}>{heading.lede}</p> : null}
                <p className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-5">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} className={cn("group inline-flex min-h-10 items-center gap-1.5 text-[14.5px] font-semibold", accent)}>
                      {link.label} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The card on /about that introduces the founder and leads to the portfolio. */
export function FounderCard({ heading, founder }: { heading: SectionHeading; founder: FounderView }) {
  const cv = founder.cvUrl ? safeLink(founder.cvUrl) : "";
  return (
    <section aria-labelledby="founder-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell pb-[clamp(40px,5vw,72px)]">
        <div className="grid items-center gap-6 rounded-[22px] bg-[var(--ld-card)] p-5 shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] sm:p-7 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Image
            src={founder.portrait || HEADSHOT}
            alt={founder.name}
            width={112}
            height={112}
            className="size-24 rounded-[18px] object-cover sm:size-28"
          />
          <div className="min-w-0">
            <h2 id="founder-title" className="ld-display text-[clamp(20px,1.8vw,26px)] leading-tight font-semibold tracking-[-0.02em] text-balance">
              {heading.title}
            </h2>
            {heading.lede ? <p className="mt-2 max-w-[44rem] text-[15px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
            <p className="mt-3 text-[13.5px] text-[var(--ld-text-muted)]">
              {founder.name} · {founder.role} · {founder.based}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <Link href="/theo" className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ld-ink)] px-5 text-[14.5px] font-semibold text-[var(--ld-paper)]">
              See the portfolio <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {cv ? (
              <a href={cv} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-semibold text-[var(--ld-ink)] ring-1 ring-[var(--ld-line-2)]">
                <DownloadIcon className="size-4" /> CV
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Under the portfolio's hero title: who, where, and the ways to reach or read more. */
export function PortfolioActions({ founder, socials }: { founder: FounderView; socials: { label: string; url: string }[] }) {
  const cv = founder.cvUrl ? safeLink(founder.cvUrl) : "";
  return (
    <div className="mt-6 grid gap-4">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[var(--ld-muted)]">
        <span>{founder.based}</span>
        <span aria-hidden="true">·</span>
        <span>{founder.availability}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-5 text-[14.5px] font-semibold text-[#08102e] transition-transform hover:-translate-y-0.5">
          Get in touch <ArrowRightIcon className="size-4" />
        </Link>
        {cv ? (
          <a href={cv} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.22)] px-5 text-[14.5px] font-semibold text-[var(--ld-paper)] transition-colors hover:border-[rgb(var(--ld-paper-rgb)/0.5)]">
            <DownloadIcon className="size-4" /> Download CV
          </a>
        ) : null}
        {socials
          .filter((social) => safeLink(social.url))
          .slice(0, 3)
          .map((social) => (
            <a
              key={social.url}
              href={safeLink(social.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.22)] px-4 text-[14.5px] font-semibold text-[var(--ld-paper)] transition-colors hover:border-[rgb(var(--ld-paper-rgb)/0.5)]"
            >
              {social.label} <ArrowUpRightIcon className="size-4" />
            </a>
          ))}
      </div>
    </div>
  );
}
