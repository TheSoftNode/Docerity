"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AwardIcon,
  BriefcaseIcon,
  UserRoundIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { Bloom } from "@/components/shared/section-kit";
import { CornerBrackets } from "@/components/sections/explainers/explainer-corner-brackets";
import {
  certifications,
  education,
  experience,
  skillGroups,
  tools,
} from "@/components/sections/about/about-data";
import { StoryPanel } from "@/components/sections/about/panels/story-panel";
import { ExperiencePanel } from "@/components/sections/about/panels/experience-panel";
import { ToolkitPanel } from "@/components/sections/about/panels/toolkit-panel";
import { CredentialsPanel } from "@/components/sections/about/panels/credentials-panel";

type Tab = {
  id: string;
  label: string;
  caption: string;
  count: number;
  Icon: LucideIcon;
  Panel: () => React.ReactElement;
};

const tabs: Tab[] = [
  {
    id: "story",
    label: "Story",
    caption: "How this started",
    count: 3,
    Icon: UserRoundIcon,
    Panel: StoryPanel,
  },
  {
    id: "experience",
    label: "Experience",
    caption: "Where it comes from",
    count: experience.length,
    Icon: BriefcaseIcon,
    Panel: ExperiencePanel,
  },
  {
    id: "toolkit",
    label: "Toolkit",
    caption: "What I build with",
    count: skillGroups.length + tools.length,
    Icon: WrenchIcon,
    Panel: ToolkitPanel,
  },
  {
    id: "credentials",
    label: "Credentials",
    caption: "Studied and certified",
    count: education.length + certifications.length,
    Icon: AwardIcon,
    Panel: CredentialsPanel,
  },
];

/**
 * The About page's body: a sticky rail on the left, one panel at a time on
 * the right.
 *
 * This replaces four stacked sections. Stacked, the page was ~4000px of
 * scroll with no way to reach the certificates without passing everything
 * else, and no sense of what the page even contained until you had scrolled
 * it all. A rail states the whole shape up front and gets anywhere in one
 * click.
 *
 * Panels render only when selected, so a tab's contents cost nothing until
 * it is opened — the credentials panel alone holds eight images.
 */
function AboutWorkspace() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(tabs[0].id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <section
      id="profile"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-surface-raised py-10 lg:py-14"
    >
      <Bloom tone="violet" className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />
      <Bloom className="right-0 bottom-0 translate-x-1/3 translate-y-1/3" />

      <Container className="relative">
        {/*
          The same panel as the hero: gradient hairline, registration marks,
          a mono rail across the top. The two bands were a dossier followed by
          a plain two-column layout, which made the page look like it changed
          its mind halfway down. Continuing the frame makes them read as one
          document — a cover sheet and the pages behind it.
        */}
        <div className="rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-violet),transparent_66%),var(--border)_42%,color-mix(in_oklch,var(--brand-primary),transparent_70%))] p-px shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)]">
          <div className="relative rounded-[calc(1.5rem-1px)] bg-card">
            <CornerBrackets />

            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b border-border/70 px-5 py-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-7">
              <span className="text-primary">Index</span>
              <span className="text-muted-foreground/70">
                {tabs.length} sections ·{" "}
                <span className="text-foreground/80">{active.label}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-7 px-5 py-6 sm:px-7 lg:grid-cols-[14.5rem_1fr] lg:gap-10 lg:py-8 xl:grid-cols-[16rem_1fr]">
        {/*
          Sticky from `lg`, where there is a column for it. Below that it is a
          horizontal scroller above the panel, because a vertical rail on a
          phone is just four rows of chrome before any content.
        */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
          <nav
            aria-label="About sections"
            className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {tabs.map((tab, index) => {
              const isActive = tab.id === active.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="group relative shrink-0 rounded-xl px-3 py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:w-full lg:px-3.5 lg:py-3"
                >
                  {/*
                    One element that travels between tabs rather than four that
                    fade in and out. `layoutId` makes Framer animate the shared
                    element from its old box to its new one, which is what
                    makes the rail feel like a control instead of four
                    independent buttons.
                  */}
                  {isActive ? (
                    <motion.span
                      layoutId="about-rail-active"
                      aria-hidden
                      className="absolute inset-0 rounded-xl border border-primary/40 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--brand-primary),transparent_88%),color-mix(in_oklch,var(--brand-violet),transparent_90%))]"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 36 }
                      }
                    />
                  ) : null}

                  <span className="relative flex items-center gap-3">
                    {/* The icon carries a number on hover and while open, so
                        the rail reads as an index rather than four unrelated
                        buttons. Swapping in place keeps the box the same size
                        and the row from shifting. */}
                    <span
                      className={
                        "relative flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 " +
                        (isActive
                          ? "border-primary/50 bg-background text-primary"
                          : "border-border bg-card text-muted-foreground group-hover:text-foreground")
                      }
                    >
                      <tab.Icon className="size-4 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0 data-[open=true]:opacity-0" data-open={isActive} />
                      <span
                        aria-hidden
                        data-open={isActive}
                        className="absolute inset-0 flex items-center justify-center font-mono text-[0.625rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 data-[open=true]:opacity-100"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span
                        className={
                          "block text-sm font-medium transition-colors duration-300 " +
                          (isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")
                        }
                      >
                        {tab.label}
                      </span>
                      {/* The caption is the section's old heading, kept so the
                          rail says what each tab holds rather than relying on
                          a one-word label. */}
                      <span className="hidden text-[0.6875rem] leading-snug text-muted-foreground lg:block">
                        {tab.caption}
                      </span>
                    </span>

                    <span
                      className={
                        "ml-auto hidden font-mono text-[0.6875rem] transition-colors duration-300 lg:block " +
                        (isActive ? "text-primary" : "text-muted-foreground/60")
                      }
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {/* `mode="wait"` so the outgoing panel finishes before the next
              arrives — overlapping them made the column jump between two very
              different heights mid-transition. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
            >
              <h2 className="mb-5 border-b border-border/70 pb-3.5 font-heading text-[clamp(1.25rem,2vw,1.6rem)] font-semibold tracking-tight text-foreground">
                {active.caption}.
              </h2>

              <active.Panel />
            </motion.div>
          </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { AboutWorkspace };
