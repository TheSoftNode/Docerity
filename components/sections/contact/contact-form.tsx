"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckIcon, PaperclipIcon, SendIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  ACCEPTED_FILE_EXTENSIONS,
  FILE_LIMITS,
  budgets,
  formatBytes,
  projectTypes,
  roles,
  timelines,
  validateEnquiry,
  type FieldErrors,
  type ProjectType,
} from "@/lib/contact/schema";

/* "uploading" is distinct from "submitting" because attachments can now be
   tens of megabytes: a single "Sending…" label for a 20MB upload reads as a
   hung form. */
type Status = "idle" | "uploading" | "submitting" | "success" | "error";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** A label with its field's error wired up for assistive tech. */
function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ContactForm() {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get("type");
  const initialType = projectTypes.some((type) => type.value === requestedType)
    ? (requestedType as ProjectType)
    : projectTypes[0].value;

  const [projectType, setProjectType] = useState<ProjectType>(initialType);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, FILE_LIMITS.maxFiles);
    setFiles(next);
    setErrors((current) => ({ ...current, files: undefined }));
    // Let the same file be picked again after it is removed.
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
    setErrors((current) => ({ ...current, files: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const input = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      role: String(data.get("role") ?? ""),
      projectType,
      budget: String(data.get("budget") ?? ""),
      timeline: String(data.get("timeline") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    // Validated here with the same function the server uses, so the person
    // sees problems without waiting for a round trip.
    const found = validateEnquiry(
      input,
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("idle");
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");

    /*
      Attachments go from the browser straight to Blob storage, and only their
      URLs are posted to the enquiry route. A route handler receives the whole
      body in memory and the platform caps that at 4.5MB, so posting the bytes
      through it put a hard ceiling on file size — a PRD exported to PDF with
      screenshots clears that easily. This path has no such limit.
    */
    let attachments: { name: string; url: string; contentType: string; size: number }[] = [];

    try {
      if (files.length > 0) {
        setStatus("uploading");
        const { upload } = await import("@vercel/blob/client");

        attachments = await Promise.all(
          files.map(async (file) => {
            const blob = await upload(file.name, file, {
              access: "public",
              handleUploadUrl: "/api/contact/upload",
            });
            return {
              name: file.name,
              url: blob.url,
              contentType: file.type,
              size: file.size,
            };
          })
        );
        setStatus("submitting");
      }
    } catch (reason) {
      /*
        An upload failure must not cost the whole enquiry. It is reported
        against the attachments field, with the rest of the form untouched, so
        the person can remove the files and still send their message.
      */
      const message =
        reason instanceof Error
          ? reason.message
          : "Those files couldn't be uploaded.";
      setErrors({ files: `${message} You can remove the files and send the enquiry without them.` });
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          website: String(data.get("website") ?? ""),
          attachments,
        }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { ok: boolean; errors?: FieldErrors }
        | null;

      if (!res.ok) {
        // The server is the authority: surface its field errors rather than
        // a generic failure, so the person knows what to change.
        if (payload?.errors) {
          setErrors(payload.errors);
          setStatus("idle");
          return;
        }
        throw new Error("Request failed");
      }

      setStatus("success");
      form.reset();
      setFiles([]);
      setProjectType(projectTypes[0].value);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Card className="relative border border-border bg-card p-2 shadow-2xl shadow-black/30">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal">
            <CheckIcon className="size-5" />
          </span>
          <p className="font-heading text-lg font-semibold text-foreground">
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

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Card className="relative border border-border bg-card p-2 shadow-2xl shadow-black/30">
      <CardContent className="pt-2">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
          {/* ── About you ─────────────────────────────────────────────── */}
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              About you
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Name" error={errors.name}>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  className="h-10"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="h-10"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="company" label="Company">
                <Input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  className="h-10"
                  placeholder="Optional"
                />
              </Field>
              <Field id="role" label="Your role">
                <select id="role" name="role" className={selectClass} defaultValue="">
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </fieldset>

          {/* ── About the project ─────────────────────────────────────── */}
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              About the project
            </legend>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="budget" label="Budget">
                <select id="budget" name="budget" className={selectClass} defaultValue="">
                  {budgets.map((budget) => (
                    <option key={budget.value} value={budget.value}>
                      {budget.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="timeline" label="Timeline">
                <select id="timeline" name="timeline" className={selectClass} defaultValue="">
                  {timelines.map((timeline) => (
                    <option key={timeline.value} value={timeline.value}>
                      {timeline.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              id="message"
              label="Message"
              error={errors.message}
              hint="What are you building, who is it for, and what does success look like?"
            >
              <Textarea
                id="message"
                name="message"
                rows={6}
                placeholder="The more context you give, the more useful my first reply will be."
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "message-error" : "message-hint"}
              />
            </Field>
          </fieldset>

          {/* ── Attachments ───────────────────────────────────────────── */}
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              Attachments
            </legend>

            <Field
              id="files"
              label="PRD, spec or designs"
              error={errors.files}
              hint={`Up to ${FILE_LIMITS.maxFiles} files, ${formatBytes(FILE_LIMITS.maxBytesTotal)} total.`}
            >
              <input
                ref={fileInputRef}
                id="files"
                type="file"
                multiple
                accept={ACCEPTED_FILE_EXTENSIONS}
                onChange={(event) => addFiles(event.target.files)}
                aria-invalid={Boolean(errors.files)}
                aria-describedby={errors.files ? "files-error" : "files-hint"}
                className="block w-full cursor-pointer rounded-lg border border-dashed border-input bg-transparent px-3 py-3 text-sm text-muted-foreground transition-colors file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              />
            </Field>

            {files.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-border/80 bg-background px-3 py-2"
                  >
                    <PaperclipIcon className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">
                        {file.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {formatBytes(file.size)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                      className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </li>
                ))}
                <li className="pt-0.5 text-right font-mono text-[0.6875rem] text-muted-foreground">
                  {files.length}/{FILE_LIMITS.maxFiles} files · {formatBytes(totalBytes)}
                </li>
              </ul>
            ) : null}
          </fieldset>

          {/* Bots fill every field they find; this one is never shown. */}
          <div aria-hidden className="hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="h-11 w-full text-sm"
              disabled={status === "submitting" || status === "uploading"}
            >
              {status === "uploading"
                ? "Uploading files…"
                : status === "submitting"
                  ? "Sending…"
                  : "Send message"}
              <SendIcon />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Your details stay between us and are never shared.
            </p>
          </div>

          <div aria-live="polite" className="empty:hidden">
            {errors.form ? (
              <p className="text-center text-sm text-destructive">{errors.form}</p>
            ) : null}
            {status === "error" ? (
              <p className="text-center text-sm text-destructive">
                Something went wrong — please try again, or email{" "}
                <a href={`mailto:${siteConfig.email}`} className="underline">
                  {siteConfig.email}
                </a>{" "}
                directly.
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ContactFormFallback() {
  return (
    <Card className="relative border border-border bg-card p-2 shadow-2xl shadow-black/30">
      <CardContent className="pt-2">
        <div aria-hidden className="flex flex-col gap-6 opacity-50">
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Company</Label>
              <Input disabled className="h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Your role</Label>
              <Input disabled className="h-10" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Message</Label>
            <Textarea disabled rows={6} />
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
