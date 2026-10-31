"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRightIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { sendRequest, type RequestState } from "@/app/account/actions";
import { budgets, projectTypes, roles, timelines } from "@/lib/contact/schema";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15";

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
      <div role="status" className="rounded-[20px] border border-border bg-card p-8">
        <p className="text-sm font-medium text-brand-teal">Sent</p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground">We have it.</h2>
        <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-muted-foreground">
          A person reads every request, usually within one or two working days. You can follow where it stands in your account, and we&apos;ll
          email you when we reply.
        </p>
        <p className="mt-5 text-sm text-muted-foreground">
          Reference <span className="font-mono text-base font-semibold tracking-[0.06em] text-foreground">{state.reference}</span>
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button nativeButton={false} render={<Link href={`/account/requests/${state.reference}`} />}>
            See your request <ArrowRightIcon />
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/account" />}>
            Back to your account
          </Button>
        </div>
      </div>
    );
  }

  const prompt = PROMPTS[type] ?? PROMPTS.other;

  return (
    <form action={action} className="grid gap-6 rounded-[20px] border border-border bg-card p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-foreground">What is it?</legend>
        <div role="radiogroup" aria-label="What is it?" className="flex flex-wrap gap-2">
          {projectTypes.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={type === option.value}
              onClick={() => setType(option.value)}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                type === option.value ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
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
