"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckIcon, SendIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { projectTypes } from "@/components/sections/contact/contact-data";

type Status = "idle" | "submitting" | "success" | "error";

function ContactForm() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");
  const initialType = projectTypes.some((type) => type.value === requestedType)
    ? (requestedType as (typeof projectTypes)[number]["value"])
    : projectTypes[0].value;

  const [projectType, setProjectType] =
    useState<(typeof projectTypes)[number]["value"]>(initialType);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      projectType,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
      setProjectType(projectTypes[0].value);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Card className="relative border border-white/10 bg-card p-2 shadow-2xl shadow-black/30">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckIcon className="size-5" />
          </span>
          <p className="font-heading text-lg font-medium text-foreground">
            Message sent.
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Thanks for reaching out — I read every message myself and will
            reply within 1–2 business days.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative border border-white/10 bg-card p-2 shadow-2xl shadow-black/30">
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required autoComplete="name" className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>What&apos;s this about?</Label>
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  aria-pressed={projectType === type.value}
                  onClick={() => setProjectType(type.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                    projectType === type.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="What are you building, and how can I help?"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full text-sm"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending…" : "Send message"}
            <SendIcon />
          </Button>

          {status === "error" && (
            <p className="text-center text-sm text-destructive">
              Something went wrong — please try again, or email{" "}
              <a href={`mailto:${siteConfig.email}`} className="underline">
                {siteConfig.email}
              </a>{" "}
              directly.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function ContactFormFallback() {
  return (
    <Card className="relative border border-white/10 bg-card p-2 shadow-2xl shadow-black/30">
      <CardContent className="pt-2">
        <div aria-hidden className="flex flex-col gap-5 opacity-50">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input disabled className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input disabled className="h-10" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>What&apos;s this about?</Label>
            <div className="flex flex-wrap gap-2">
              {projectTypes.map((type) => (
                <span
                  key={type.value}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {type.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Message</Label>
            <Textarea disabled rows={5} />
          </div>
          <Button type="button" size="lg" className="h-11 w-full text-sm" disabled>
            Send message
            <SendIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export { ContactForm, ContactFormFallback };
