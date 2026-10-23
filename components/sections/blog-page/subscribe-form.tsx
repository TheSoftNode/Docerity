"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * The email field and its button, as one pill. Success replaces it with a
 * line saying so; a failure says so too and keeps the address, rather than
 * claiming a subscription that did not happen.
 */
function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setStatus("submitting");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="flex min-h-16 items-center gap-3 rounded-full border border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[rgb(var(--ld-tint-rgb)/0.08)] px-6 text-[15px]">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-[#8de3b6] text-xs text-[var(--ld-ink)]">
          ✓
        </span>
        You&apos;re on the list. Thanks for subscribing.
      </p>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 rounded-full border border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[rgb(var(--ld-tint-rgb)/0.08)] p-1.5 focus-within:border-[rgb(var(--ld-tint-rgb)/0.5)]"
      >
        <label htmlFor="subscribe-email" className="sr-only">
          Email address
        </label>
        <input
          id="subscribe-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="h-[52px] min-w-0 flex-1 rounded-full bg-transparent px-5 text-base text-[var(--ld-paper)] outline-none placeholder:text-[var(--ld-muted-3)]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="min-h-[52px] shrink-0 rounded-full bg-[var(--ld-accent)] px-6 text-[15px] font-bold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
        >
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-[#ffb39c]">
          That didn&apos;t go through. Please try again in a moment.
        </p>
      ) : null}
    </>
  );
}

export { SubscribeForm };
