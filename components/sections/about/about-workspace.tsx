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
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-surface-raised py-14 lg:py-20"
    >
      <Bloom tone="violet" className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />
      <Bloom className="right-0 bottom-0 translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12 xl:grid-cols-[16.5rem_1fr]">
        {/*
          Sticky from `lg`, where there is a column for it. Below that it is a
          horizontal scroller above the panel, because a vertical rail on a
          phone is just four rows of chrome before any content.
        */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <p className="hidden font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase lg:block">
            Profile
          </p>

          <nav
            aria-label="About sections"
            className="mt-0 flex gap-2 overflow-x-auto pb-2 lg:mt-4 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {tabs.map((tab) => {
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
                    <span
                      className={
                        "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 " +
                        (isActive
                          ? "border-primary/50 bg-background text-primary"
                          : "border-border bg-card text-muted-foreground group-hover:text-foreground")
                      }
                    >
                      <tab.Icon className="size-4" />
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
              <div className="mb-6 flex items-baseline gap-3 border-b border-border/70 pb-4">
                <h2 className="font-heading text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight text-foreground">
                  {active.caption}.
                </h2>
                <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
                  {active.label}
                </span>
              </div>

              <active.Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

export { AboutWorkspace };
