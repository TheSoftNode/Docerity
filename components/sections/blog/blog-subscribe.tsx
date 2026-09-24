"use client";

import { useState } from "react";
import { MailIcon, SendIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Status = "idle" | "submitting" | "success" | "error";

function BlogSubscribe() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 sm:p-8">
      <div className="mx-auto flex max-w-md flex-col items-center gap-1 text-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
          <MailIcon className="size-4" />
        </span>
        <p className="mt-1 font-heading text-lg font-medium text-foreground">
          New explainers, straight to your inbox
        </p>
        <p className="text-sm text-muted-foreground">
          One email whenever a new concept goes up. No spam, unsubscribe anytime.
        </p>
      </div>

      {status === "success" ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          You&apos;re on the list. Thanks for subscribing.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="subscribe-email" className="sr-only">
            Email address
          </label>
          <Input
            id="subscribe-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-11 flex-1 border-border/80 bg-card text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 px-5 text-sm"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
            <SendIcon />
          </Button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-3 text-center text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}

export { BlogSubscribe };
