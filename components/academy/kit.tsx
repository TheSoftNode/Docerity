import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";

import { AcademyNav } from "@/components/academy/academy-nav";
import type { CourseLevel } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

/**
 * The Academy's shared pieces, so every Academy page speaks the same
 * language as the rest of the site: the deep sapphire hero with its light
 * beams, display headings with the lede set beside them, and cards in the
 * site's three tones (ink, sapphire, light).
 */

type HeroProps = {
  /** Which Academy room this is (shows the room pills), or a link back. */
  current?: Parameters<typeof AcademyNav>[0]["current"];
  back?: { href: string; label: string };
  /** A short line above the title: level, phase, module. */
  meta?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Sits beside the title instead of the lede on wide screens (a panel). */
  aside?: ReactNode;
  /** A band under the title row: a picture, a timeline, a console. */
  children?: ReactNode;
  size?: "xl" | "lg";
};

export function AcademyHero({ current, back, meta, title, lede, actions, aside, children, size = "xl" }: HeroProps) {
  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[linear-gradient(180deg,var(--ld-ink)_0%,#0b1844_58%,#13296b_100%)] pt-[124px] pb-[clamp(44px,6vw,88px)] text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="ld-beam pointer-events-none absolute -top-[20%] left-[6%] h-[140%] w-[44%] rotate-[14deg] bg-[linear-gradient(100deg,transparent_30%,rgb(var(--ld-tint-rgb)/0.08)_50%,transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="ld-beam pointer-events-none absolute -top-[20%] right-[4%] h-[140%] w-[36%] -rotate-12 bg-[linear-gradient(100deg,transparent_30%,rgb(var(--ld-tint-rgb)/0.06)_50%,transparent_70%)] [animation-delay:2.5s]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[34%] left-1/2 aspect-[2.4/1] w-[min(120vw,1700px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(64_110_230/0.42),transparent_62%)]"
      />
      <div className="doc-shell relative">
        {current ? <AcademyNav current={current} /> : null}
        {back ? (
          <Link href={back.href} className="-my-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]">
            <ArrowLeftIcon className="size-4" /> {back.label}
          </Link>
        ) : null}
        <div className={cn("grid items-end gap-[clamp(24px,4vw,72px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]", current || back ? "mt-[clamp(28px,4vw,52px)]" : "")}>
          <div className="min-w-0">
            {meta ? <p className="ld-up mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] text-[var(--ld-muted)]">{meta}</p> : null}
            <h1
              className={cn(
                "ld-display ld-up ld-delay-1 font-extrabold text-balance",
                size === "xl" ? "text-[clamp(46px,7.4vw,116px)] leading-[0.9] tracking-[-0.055em]" : "text-[clamp(40px,5.8vw,86px)] leading-[0.94] tracking-[-0.05em]"
              )}
            >
              {title}
            </h1>
          </div>
          <div className="ld-up ld-delay-2 min-w-0 pb-1">
            {aside ?? (
              <>
                {lede ? <div className="text-[clamp(16.5px,1.35vw,19px)] leading-relaxed text-[var(--ld-muted)]">{lede}</div> : null}
                {actions ? <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">{actions}</div> : null}
              </>
            )}
          </div>
        </div>
        {children ? <div className="ld-up ld-delay-3 mt-[clamp(32px,4.5vw,64px)]">{children}</div> : null}
      </div>
    </section>
  );
}

/** The site's section heading: large on the left, a short lede or a link on the right. */
export function SectionHead({ id, title, lede, action, className }: { id?: string; title: ReactNode; lede?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-12", className)}>
      <h2 id={id} className="ld-display max-w-[18ch] text-[clamp(36px,5vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
        {title}
      </h2>
      {lede || action ? (
        <div className="max-w-[24rem] text-[16.5px] leading-relaxed text-[var(--ld-text-2)]">
          {lede}
          {action ? <div className={cn(lede && "mt-3")}>{action}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/** The site's buttons, in the hero (on dark) and on paper. */
export const btn = {
  accent: "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[var(--ld-accent)] px-6 text-[15px] font-semibold text-[#08102e] transition-transform hover:-translate-y-0.5",
  ghostDark:
    "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.22)] px-[22px] text-[15px] font-semibold text-[var(--ld-paper)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[rgb(var(--ld-paper-rgb)/0.5)]",
  ink: "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5",
  ghost: "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-[var(--ld-line-2)] px-[22px] text-[15px] font-semibold text-[var(--ld-ink)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[var(--ld-ink)]",
};

/**
 * Card tones by level, matching the site's three: light for beginners,
 * sapphire for intermediate, ink for advanced.
 */
export const LEVEL_TONE: Record<CourseLevel, { card: string; text: string; soft: string; chip: string; accent: string; numeral: string }> = {
  Beginner: {
    card: "bg-[linear-gradient(160deg,#e4eafc,#cdd9fd)] text-[#08102e]",
    text: "text-[#323953]",
    soft: "text-[#4f556b]",
    chip: "border-[rgb(8_16_46/0.14)] bg-[rgb(255_255_255/0.55)]",
    accent: "text-[#1c3a8c]",
    numeral: "text-[rgb(28_58_140/0.12)]",
  },
  Intermediate: {
    card: "bg-[#1c3a8c] text-white",
    text: "text-[#d5dffc]",
    soft: "text-[#afc4ff]",
    chip: "border-[rgb(255_255_255/0.22)] bg-[rgb(255_255_255/0.06)]",
    accent: "text-[#afc4ff]",
    numeral: "text-[rgb(175_196_255/0.14)]",
  },
  Advanced: {
    card: "ld-keep-dark bg-[#0b1433] text-[#f4f5fa] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.12)]",
    text: "text-[#c4cbe3]",
    soft: "text-[#9aa7cf]",
    chip: "border-[rgb(175_196_255/0.2)] bg-[rgb(175_196_255/0.05)]",
    accent: "text-[#ff9a80]",
    numeral: "text-[rgb(255_122_89/0.12)]",
  },
};

/** A light card on paper: the quiet surface for reading. */
export const paperCard = "rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)]";

/** A dark card that stays dark in light mode. */
export const inkCard = "ld-keep-dark rounded-[28px] bg-[#0b1433] text-[#f4f5fa] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.12),0_30px_60px_-36px_rgb(8_16_46/0.6)]";

/**
 * A browser window with the site's address in its bar: the cover for a
 * student's build in the showcase and in battles.
 */
export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  let host = url;
  try {
    host = new URL(url).host.replace(/^www\./, "");
  } catch {
    /* keep what was given */
  }
  return (
    <div className={cn("overflow-hidden rounded-[18px] bg-[#0b1433] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.14)]", className)}>
      <div className="flex items-center gap-2 border-b border-[rgb(175_196_255/0.12)] px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff7a59]" />
          <span className="size-2.5 rounded-full bg-[#afc4ff]/60" />
          <span className="size-2.5 rounded-full bg-[#afc4ff]/30" />
        </span>
        <span className="ml-2 min-w-0 flex-1 truncate rounded-full bg-[rgb(175_196_255/0.08)] px-3 py-1 font-mono text-[11.5px] text-[#9aa7cf]">{host}</span>
      </div>
      {children}
    </div>
  );
}

/** Initials in a disc, for a student's name. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const letters =
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <span aria-hidden="true" className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(140deg,#1c3a8c,#2e4b9a)] text-[14px] font-bold text-white ring-2 ring-[rgb(255_255_255/0.7)]", className)}>
      {letters}
    </span>
  );
}

/** A few deterministic colours for a build's cover, chosen from its id so each card looks its own. */
const COVERS = [
  "bg-[radial-gradient(120%_90%_at_10%_0%,#2e4b9a,transparent_60%),linear-gradient(160deg,#13296b,#08102e)]",
  "bg-[radial-gradient(120%_90%_at_90%_0%,rgb(255_122_89/0.55),transparent_55%),linear-gradient(160deg,#1c3a8c,#0b1844)]",
  "bg-[radial-gradient(120%_90%_at_50%_120%,#afc4ff,transparent_60%),linear-gradient(160deg,#1c3a8c,#13296b)]",
  "bg-[radial-gradient(100%_80%_at_0%_100%,rgb(255_122_89/0.45),transparent_55%),linear-gradient(200deg,#2e4b9a,#08102e)]",
];
export function coverFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVERS[hash % COVERS.length];
}
