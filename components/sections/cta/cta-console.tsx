"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  CornerDownLeftIcon,
  GraduationCapIcon,
  MailIcon,
  RocketIcon,
} from "lucide-react";

import { siteConfig } from "@/lib/config/site";

/* One row per way in, each in its own accent from the brand vocabulary. */
const routes = [
  {
    Icon: RocketIcon,
    label: "A new project",
    body: "Scope, build and ship production software.",
    href: "/contact",
    external: false,
    accent: "text-primary",
    hoverBorder: "group-hover/row:border-primary/60",
    glow: "group-hover/row:shadow-[0_0_20px_-4px_var(--brand-primary)]",
  },
  {
    Icon: GraduationCapIcon,
    label: "Mentorship",
    body: "Weekly 1:1s and honest code review.",
    href: "/contact?type=mentorship",
    external: false,
    accent: "text-brand-violet",
    hoverBorder: "group-hover/row:border-brand-violet/60",
    glow: "group-hover/row:shadow-[0_0_20px_-4px_var(--brand-violet)]",
  },
  {
    Icon: MailIcon,
    label: siteConfig.email,
    body: "Just a question? Email directly.",
    href: `mailto:${siteConfig.email}`,
    external: true,
    accent: "text-brand-teal",
    hoverBorder: "group-hover/row:border-brand-teal/60",
    glow: "group-hover/row:shadow-[0_0_20px_-4px_var(--brand-teal)]",
  },
] as const;

const phrases = ["start a project", "apply for mentorship", "say hello"];
const TYPE_MS = 65;
const HOLD_MS = 1600;

/** Types a phrase, holds, deletes, moves to the next. */
function useTypedPhrase(enabled: boolean) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const full = phrases[index];

    if (!deleting && text === full) {
      const hold = window.setTimeout(() => setDeleting(true), HOLD_MS);
      return () => window.clearTimeout(hold);
    }

    // Every transition happens inside the timeout. Advancing the phrase
    // synchronously in the effect body triggers a cascading render.
    const tick = window.setTimeout(
      () => {
        if (!deleting) {
          setText(full.slice(0, text.length + 1));
        } else if (text === "") {
          setDeleting(false);
          setIndex((i) => (i + 1) % phrases.length);
        } else {
          setText(full.slice(0, text.length - 1));
        }
      },
      deleting ? TYPE_MS / 2 : TYPE_MS
    );
    return () => window.clearTimeout(tick);
  }, [enabled, text, deleting, index]);

  return enabled ? text : phrases[0];
}

/**
 * The CTA's right half: a console you pick a command from.
 *
 * The prompt types itself, but it is decoration — `aria-hidden`, with the real
 * choices below as ordinary links. A screen reader gets three clear
 * destinations instead of a stuttering string of characters.
 */
function CtaConsole() {
  const reduceMotion = useReducedMotion();
  const typed = useTypedPhrase(!reduceMotion);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-background/70 backdrop-blur-md">
      {/* Chrome */}
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-primary/70" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
          <span className="size-2 rounded-full bg-muted-foreground/30" />
        </span>
        <p className="ml-1 font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
          docerity &mdash; start
        </p>
      </div>

      {/* Prompt */}
      <p aria-hidden className="flex items-center gap-2 px-4 py-4 font-mono text-sm">
        <span className="text-brand-teal">&rsaquo;</span>
        <span className="text-foreground">{typed}</span>
        <motion.span
          className="inline-block h-4 w-[2px] bg-primary"
          animate={reduceMotion ? undefined : { opacity: [1, 0, 1] }}
          transition={{ duration: 1, ease: "linear", repeat: Infinity }}
        />
      </p>

      <ul className="border-t border-border/70 p-2">
        {routes.map(({ Icon, label, body, href, external, accent, hoverBorder, glow }, index) => {
          const content = (
            <>
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card transition-all duration-300 ${accent} ${hoverBorder} ${glow}`}
              >
                <Icon className="size-4.5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {label}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {body}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="hidden font-mono text-[0.625rem] text-muted-foreground/70 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex size-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors duration-300 group-hover/row:border-primary/40 group-hover/row:text-foreground">
                  <CornerDownLeftIcon className="size-3.5" />
                </span>
              </span>
            </>
          );

          const className =
            "group/row flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-muted/60";

          return (
            <li key={label}>
              {external ? (
                <a href={href} className={className}>
                  {content}
                </a>
              ) : (
                <Link href={href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { CtaConsole };
