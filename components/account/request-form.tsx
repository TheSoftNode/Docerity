"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRightIcon, LoaderCircleIcon, MessageCircleIcon, MessageSquareIcon, RocketIcon, UsersIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { sendRequest, type RequestState } from "@/app/account/actions";
import { budgets, projectTypes, roles, timelines } from "@/lib/contact/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15";

/* Each kind as a tile: what it is, in a line, with a mark. */
const KINDS: Record<string, { Icon: LucideIcon; line: string }> = {
  software: { Icon: RocketIcon, line: "Something built, fixed or rebuilt." },
  mentorship: { Icon: UsersIcon, line: "Weekly 1:1s, code review and a plan." },
  speaking: { Icon: MessageSquareIcon, line: "A talk or workshop for your team." },
  other: { Icon: MessageCircleIcon, line: "Anything else on your mind." },
};

const PROMPTS: Record<string, { label: string; placeholder: string }> = {
  software: { label: "What do you need built?", placeholder: "What it is, who it's for, and where things stand today." },
  mentorship: { label: "Tell us about you", placeholder: "Where you are now, what you're working towards, and what's getting in the way." },
  speaking: { label: "Tell us about the event", placeholder: "The audience, the topic, the date and the format." },
  other: { label: "What's on your mind?", placeholder: "Whatever it is, in your own words." },
};

/**
 * A request from inside the account: pick what it is, and the form asks for
 * what that kind needs. Your name and email come from the account, so the
 * request appears under "Your requests" straight away.
 */
function RequestForm({ initialType, stages }: { initialType: string; stages: string[] }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(sendRequest, undefined);
  const [type, setType] = useState(projectTypes.some((option) => option.value === initialType) ? initialType : "software");
  const errors = state?.errors ?? {};

  if (state?.reference) {
    return (
      <div role="status" className="rounded-[26px] bg-[#08102e] p-8 text-[#f4f5fa] sm:p-10">
        <p className="text-sm font-semibold text-[#4cc59a]">Sent</p>
        <h2 className="mt-2 font-heading text-[44px] leading-none font-extrabold tracking-[-0.04em]">We have it.</h2>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-[#c4cbe3]">
          A person reads every request, usually within one or two working days. You can follow where it stands in your account, and we&apos;ll
          email you when we reply.
        </p>
        <p className="mt-6 text-sm text-[#9aa7cf]">
          Reference <span className="font-mono text-lg font-semibold tracking-[0.06em] text-[#afc4ff]">{state.reference}</span>
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            href={`/account/requests/${state.reference}`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#afc4ff] px-5 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5"
          >
            Follow your request <ArrowRightIcon className="size-4" />
          </Link>
          <Link
            href="/account"
            className="inline-flex h-12 items-center rounded-full border border-[rgb(244_245_250/0.2)] px-5 text-[15px] font-semibold transition-colors hover:bg-[rgb(244_245_250/0.08)]"
          >
            Back to your account
          </Link>
        </div>
      </div>
    );
  }

  const prompt = PROMPTS[type] ?? PROMPTS.other;

  return (
    <form action={action} className="grid gap-7 rounded-[26px] border border-border bg-card p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="mb-3 font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">What is it?</legend>
        <div role="radiogroup" aria-label="What is it?" className="grid gap-3 sm:grid-cols-2">
          {projectTypes.map((option) => {
            const on = type === option.value;
            const { Icon, line } = KINDS[option.value] ?? KINDS.other;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setType(option.value)}
                className={cn(
                  "flex items-start gap-3.5 rounded-[18px] border p-4 text-left transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                  on ? "border-[#08102e] bg-[#08102e] text-[#f4f5fa]" : "border-border bg-card text-foreground hover:border-foreground/30"
                )}
              >
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", on ? "bg-[#afc4ff] text-[#08102e]" : "bg-primary/10 text-primary")}>
                  <Icon className="size-[18px]" />
                </span>
                <span>
                  <span className="block font-heading text-[17px] font-bold tracking-[-0.015em]">{option.label}</span>
                  <span className={cn("mt-0.5 block text-[13px] leading-snug", on ? "text-[#c4cbe3]" : "text-muted-foreground")}>{line}</span>
                </span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="projectType" value={type} />
      </fieldset>

      {type === "software" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="role">Your role</Label>
            <select id="role" name="role" className={selectClass} defaultValue="">
              {roles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <select id="budget" name="budget" className={selectClass} defaultValue="">
              {budgets.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">When</Label>
            <select id="timeline" name="timeline" className={selectClass} defaultValue="">
              {timelines.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {type === "mentorship" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {stages.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="stage">Where you&apos;d start</Label>
              <select id="stage" name="stage" className={selectClass} defaultValue={stages[0]}>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="codeLink">Your code (optional)</Label>
            <Input id="codeLink" name="codeLink" placeholder="github.com/you" aria-invalid={Boolean(errors.codeLink)} className="h-11" />
            {errors.codeLink ? <p className="text-sm text-destructive">{errors.codeLink}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="message">{prompt.label}</Label>
        <Textarea id="message" name="message" rows={7} required placeholder={prompt.placeholder} aria-invalid={Boolean(errors.message)} />
        {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
      </div>

      {state?.message ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
          {pending ? "Sending" : "Send request"}
        </Button>
      </div>
    </form>
  );
}

export { RequestForm };
