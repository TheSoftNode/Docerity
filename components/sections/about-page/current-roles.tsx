"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type CurrentRole = {
  /** The short name on its tab: "CTO", "Senior SWE", "Lead engineer". */
  label: string;
  role: string;
  org: string;
  summary: string;
  /** The case study that shows the work, when there is one. */
  project?: { name: string; category: string; status: string; href: string };
};

const STEP_MS = 5200;
/* One colour per tile, in order, so each project reads as its own thing. */
const TILES = ["#c2185b", "#3b5bdb", "#0f8a6c", "#8a5cf6"];

/** "URI Social" → "US", "SmartGuard" → "SG", "QwikPass" → "QP". */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const capitals = name.match(/[A-Z]/g) ?? [];
  return (capitals.length >= 2 ? capitals.slice(0, 2).join("") : name.slice(0, 2)).toUpperCase();
}

/**
 * The roles held now, one at a time: a tab per role, the project it is best
 * shown by, what the role is in plain words, and a link to the work. It moves
 * to the next role on its own (with a bar showing when), holds still while
 * hovered or focused, and never moves under reduced motion. Written for a
 * recruiter: role names and companies, nothing that needs decoding.
 */
function CurrentRoles({ roles }: { roles: CurrentRole[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduceMotion || held || roles.length < 2) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setActive((index) => (index + 1) % roles.length);
        setStep((value) => value + 1);
      }
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, held, roles.length, step]);

  if (roles.length === 0) return null;
  const current = roles[active] ?? roles[0];
  const still = reduceMotion || held || roles.length < 2;

  return (
    <aside
      aria-labelledby="currently-title"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
      className="ld-keep-dark ld-up ld-delay-2 rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(17_35_88/0.5)] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="currently-title" className="ld-display text-[19px] font-semibold tracking-[-0.02em] text-[var(--ld-paper)]">
          Currently
        </h2>
        <span className="inline-flex items-center gap-2 text-[13px] text-[var(--ld-muted)]">
          <span aria-hidden="true" className="ld-live size-2 rounded-full bg-[#54d696]" />
          live
        </span>
      </div>

      <div role="group" aria-label="Current roles" className="mt-4 flex flex-wrap gap-2">
        {roles.map((item, index) => (
          <button
            key={`${item.org}-${item.label}`}
            type="button"
            aria-pressed={index === active}
            onClick={() => {
              setActive(index);
              setStep((value) => value + 1);
            }}
            className={cn(
              "min-h-9 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ld-accent-rgb)/0.7)]",
              index === active
                ? "border-[var(--ld-accent)] bg-[var(--ld-accent)] text-[#08102e]"
                : "border-[rgb(var(--ld-tint-rgb)/0.22)] text-[var(--ld-muted)] hover:border-[rgb(var(--ld-paper-rgb)/0.4)] hover:text-[var(--ld-paper)]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div key={step} className="ld-fade">
        {current.project ? (
          <div className="mt-4 flex items-center gap-3 rounded-[14px] bg-[rgb(var(--ld-paper-rgb)/0.06)] px-3 py-2.5">
            <span
              aria-hidden="true"
              style={{ background: TILES[active % TILES.length] }}
              className="grid size-10 shrink-0 place-items-center rounded-[11px] text-[13px] font-bold tracking-[-0.02em] text-white"
            >
              {initials(current.project.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold text-[var(--ld-paper)]">{current.project.name}</span>
              <span className="block truncate text-[12.5px] text-[var(--ld-muted)]">{current.project.category}</span>
            </span>
            <span
              className={cn(
                "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
                current.project.status === "Live" ? "bg-[rgb(84_214_150/0.14)] text-[#7fe3b0]" : "bg-[rgb(233_196_106/0.14)] text-[#e9c46a]"
              )}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {current.project.status}
            </span>
          </div>
        ) : null}

        <p className="mt-4 text-[15.5px] leading-snug font-semibold text-[var(--ld-paper)]">
          {current.role} <span aria-hidden="true">·</span> {current.org}
        </p>
        {current.summary ? <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-[var(--ld-muted)]">{current.summary}</p> : null}
        {current.project ? (
          <Link
            href={current.project.href}
            className="group mt-3 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--ld-accent)] focus-visible:outline-none focus-visible:underline"
          >
            See the work
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : null}
      </div>

      <div aria-hidden="true" className="mt-4 h-[3px] overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.14)]">
        <div
          className={cn("h-full rounded-full bg-[var(--ld-accent)]", still ? "w-full opacity-35" : step % 2 ? "ld-fill-a" : "ld-fill-b")}
          style={still ? undefined : { animationDuration: `${STEP_MS}ms` }}
        />
      </div>
    </aside>
  );
}

export { CurrentRoles };
