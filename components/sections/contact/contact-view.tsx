"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, LockIcon, PaperclipIcon, UploadIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadAttachment, type UploadedAttachment } from "@/lib/storage/upload-client";
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
import { fieldsFor, progressOf, type FormCopy } from "@/components/sections/contact/contact-content";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";

export type ContactHeading = { eyebrow: string; title: string; lede: string };
export type ContactStep = { title: string; description: string; when: string };
type Audience = { title: string; startsAt: string };

/* "uploading" is distinct from "submitting" because attachments can be tens
   of megabytes: a single "Sending…" for a 20MB upload reads as a hung form. */
type Status = "idle" | "uploading" | "submitting" | "error";

const INPUT =
  "w-full rounded-[14px] border-[1.5px] border-transparent bg-[#eef1fa] px-4 text-base text-[var(--ld-ink)] outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-[#9aa1b8] hover:bg-[#e7ebf7] focus:border-[var(--ld-ink)] focus:bg-white focus:shadow-[0_0_0_4px_rgb(var(--ld-tint-rgb)/0.45)] aria-invalid:border-[#c9502f]";

/** A labelled field with its hint or error wired up for assistive tech. */
function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-[7px]", className)}>
      <label htmlFor={id} className="font-mono text-[11.5px] tracking-[0.08em] text-[var(--ld-text-muted)] uppercase">
        {label}
        {optional ? <span className="ml-1.5 tracking-normal text-[#8a90a6] normal-case">optional</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[13px] text-[var(--ld-text-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-[#b2432a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A single choice set as chips: real radio inputs, so the choice posts with
 * the form and the arrow keys move through it, drawn as pills.
 */
function ChipGroup({
  name,
  legend,
  options,
}: {
  name: string;
  legend: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-[7px] font-mono text-[11.5px] tracking-[0.08em] text-[var(--ld-text-muted)] uppercase">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option.value || "none"} className="cursor-pointer">
            <input type="radio" name={name} value={option.value} className="peer sr-only" />
            <span className="inline-flex min-h-[38px] items-center rounded-full border border-[var(--ld-line)] bg-white px-3.5 text-[13.5px] font-medium text-[var(--ld-text-2)] transition-colors hover:border-[var(--ld-ink)] peer-checked:border-[var(--ld-ink)] peer-checked:bg-[var(--ld-ink)] peer-checked:text-[var(--ld-paper)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ld-accent)] peer-focus-visible:ring-offset-2">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <legend className="ld-display mb-3.5 flex items-center gap-3 text-[22px] font-bold tracking-[-0.02em]">
      {children}
    </legend>
  );
}

/**
 * The contact page's one screen.
 *
 * Left: the heading for what somebody came for (edited per kind in the
 * admin), and what happens after they send. Right: the form, which asks only
 * what that kind of enquiry needs, so a mentee is not asked for a budget.
 * Sending replaces the form with a receipt carrying the stored reference.
 *
 * The validation is the server's own function, run here first so mistakes
 * show without a round trip; the server stays the authority and its field
 * errors are put back against their fields.
 */
function ContactView({
  initialType,
  headings,
  steps,
  audiences,
  email,
  forms,
  workLink = "",
}: {
  initialType: ProjectType;
  headings: Record<ProjectType, ContactHeading>;
  /** The form's wording per kind, as edited in the admin. */
  forms: Record<ProjectType, FormCopy>;
  steps: ContactStep[];
  audiences: Audience[];
  email: string;
  /** The link to How we work, shown to someone starting a software project. */
  workLink?: string;
}) {
  const [type, setType] = useState<ProjectType>(initialType);
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState<string | null | undefined>(undefined);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [draft, setDraft] = useState({ name: "", email: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const copy = forms[type];
  const fields = fieldsFor(type, copy);
  const heading = headings[type];
  const sent = reference !== undefined;
  const busy = status === "uploading" || status === "submitting";
  const done = progressOf(draft);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    setFiles((current) => [...current, ...Array.from(incoming)].slice(0, FILE_LIMITS.maxFiles));
    setErrors((current) => ({ ...current, files: undefined }));
    /* So the same file can be picked again after it is removed. */
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, position) => position !== index));
    setErrors((current) => ({ ...current, files: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "");

    const input = {
      name: value("name"),
      email: value("email"),
      company: fields.company ? value("company") : "",
      role: fields.role ? value("role") : "",
      projectType: type,
      budget: fields.budget ? value("budget") : "",
      timeline: fields.timeline ? value("timeline") : "",
      message: value("message"),
      stage: fields.stage ? value("stage") : "",
      codeLink: fields.codeLink ? value("codeLink") : "",
    };

    const found = validateEnquiry(
      input,
      files.map((file) => ({ name: file.name, size: file.size, type: file.type }))
    );
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("idle");
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setErrors({});
    /*
      Attachments go from the browser straight to Cloudinary and only their
      identifiers are posted, so the route's body limit never caps file size.
      Uploaded one at a time, so a failure names the file that failed.
    */
    const attachments: UploadedAttachment[] = [];
    try {
      if (fields.files && files.length > 0) {
        setStatus("uploading");
        for (const file of files) attachments.push(await uploadAttachment(file));
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Those files couldn't be uploaded.";
      setErrors({ files: `${message} You can remove the files and send without them.` });
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website: value("website"), attachments }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; data: { reference: string | null } }
        | { ok: false; error: { message: string; fields?: FieldErrors } }
        | null;

      if (!response.ok || !payload?.ok) {
        const failure = payload && !payload.ok ? payload.error : null;
        if (failure?.fields) {
          setErrors(failure.fields);
          setStatus("idle");
          return;
        }
        if (failure?.message) {
          setErrors({ form: failure.message });
          setStatus("idle");
          return;
        }
        throw new Error("Request failed");
      }

      setStatus("idle");
      setReference(payload.data.reference);
      setFiles([]);
      setDraft({ name: "", email: "", message: "" });
      /* The receipt replaces the form; bring its top into view. */
      sheetRef.current?.scrollIntoView({ block: "nearest" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(ellipse_70%_55%_at_85%_35%,rgb(28_58_140/0.75),transparent_70%),radial-gradient(ellipse_60%_50%_at_10%_0%,rgb(19_41_107/0.8),transparent_70%),var(--ld-ink)] pt-[124px] text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="ld-beam absolute -top-[20%] -left-[6%] h-[150%] w-[44%] rotate-[16deg] bg-[linear-gradient(100deg,transparent_30%,rgb(var(--ld-tint-rgb)/0.08)_50%,transparent_70%)]"
      />

      <div className="doc-shell relative grid items-start gap-[clamp(36px,5vw,88px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        {/* Left: what this is, and what happens next. */}
        <div className="lg:sticky lg:top-[100px]">
          <p className="ld-up mb-6 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
            {heading.eyebrow}
          </p>
          {/* Keyed by kind, so a change replays the entrance. */}
          <div key={type}>
            <h1 className="ld-display ld-up text-[clamp(46px,6vw,92px)] leading-[0.9] font-extrabold tracking-[-0.055em] text-balance">
              <TitlePieces title={heading.title} />
            </h1>
            {heading.lede ? (
              <p className="ld-up ld-delay-1 mt-6 max-w-[30rem] text-[clamp(17px,1.35vw,19px)] leading-relaxed text-[var(--ld-muted)]">
                {heading.lede}
              </p>
            ) : null}
          </div>

          {steps.length > 0 ? (
            <div className="mt-[clamp(36px,4.5vw,56px)]">
              <p className="mb-[18px] font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">What happens next</p>
              <ol className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-2 bottom-[26px] left-[5px] w-px bg-[linear-gradient(180deg,rgb(var(--ld-accent-rgb)/0.7),rgb(var(--ld-tint-rgb)/0.3)_35%,rgb(var(--ld-tint-rgb)/0.12))]"
                />
                {steps.map((step, index) => (
                  <li key={step.title} className="relative pb-[22px] pl-8">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-[5px] left-0 size-[11px] rounded-full shadow-[0_0_0_4px_#0c1a4a]",
                        index === 0 ? "bg-[var(--ld-accent)]" : "bg-[var(--ld-tint)]"
                      )}
                    />
                    <span
                      className={cn(
                        "block font-mono text-[11px] tracking-[0.08em] uppercase",
                        index === 0 ? "text-[var(--ld-paper)]" : "text-[var(--ld-muted-3)]"
                      )}
                    >
                      {step.when}
                    </span>
                    <span className="mt-1.5 block text-[17px] font-semibold">{step.title}</span>
                    <span className="mt-1 block max-w-[26rem] text-[15px] leading-normal text-[var(--ld-muted)]">{step.description}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {type === "software" && workLink ? (
            <Link
              href="/how-we-work"
              className="mb-[22px] inline-block border-b border-[rgb(var(--ld-tint-rgb)/0.5)] pb-0.5 text-[15px] font-semibold text-[var(--ld-paper)] transition-colors hover:border-[var(--ld-paper)]"
            >
              {workLink} <span aria-hidden="true">→</span>
            </Link>
          ) : null}

          <p className="mt-2.5 flex flex-wrap items-center gap-x-[18px] gap-y-2.5 border-t border-[rgb(var(--ld-tint-rgb)/0.14)] pt-[22px] text-[14.5px] text-[var(--ld-muted-3)]">
            Prefer email?
            <a href={`mailto:${email}`} className="border-b border-[rgb(var(--ld-tint-rgb)/0.5)] text-[var(--ld-paper)]">
              {email}
            </a>
          </p>
        </div>

        {/* Right: the sheet. */}
        <div ref={sheetRef} className="ld-up ld-delay-2 relative scroll-mt-28">
          <span
            aria-hidden="true"
            className="absolute inset-[18px_-14px_-14px_18px] rounded-[30px] border border-[rgb(var(--ld-tint-rgb)/0.14)] bg-[rgb(var(--ld-tint-rgb)/0.08)]"
          />

          {sent ? (
            <div
              role="status"
              className="ld-pop relative overflow-hidden rounded-[30px] bg-[var(--ld-paper)] p-[clamp(28px,4vw,56px)] text-[var(--ld-ink)] shadow-[0_60px_120px_-50px_rgb(0_0_0/0.75)]"
            >
              <span aria-hidden="true" className="absolute -top-20 -right-20 size-[260px] rounded-full border border-[rgb(var(--ld-ink-rgb)/0.08)]" />
              <span className="grid size-16 place-items-center rounded-[20px] bg-[var(--ld-ink)] text-[#8de3b6]">
                <CheckIcon aria-hidden="true" className="size-7" />
              </span>
              <h2 className="ld-display mt-[26px] text-[clamp(36px,4.4vw,60px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                {copy.sentTitle}
                <span className="text-[var(--ld-accent)]">.</span>
              </h2>
              <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">
                A person reads every message and replies within 1–2 business days.
                {reference ? " Keep this reference if you write again." : ""}
              </p>
              {reference ? (
                <p className="mt-[26px] inline-flex items-center gap-3.5 rounded-2xl border border-dashed border-[#c3cce3] bg-[#eef1fa] px-[18px] py-3.5">
                  <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Reference</span>
                  <span className="font-mono text-xl font-medium tracking-[0.06em]">{reference}</span>
                </p>
              ) : null}
              <div className="mt-[34px] flex flex-wrap gap-2.5">
                <Link
                  href={copy.next.href}
                  className="inline-flex min-h-12 items-center rounded-full bg-[var(--ld-ink)] px-[22px] text-[15px] font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
                >
                  {copy.next.label}
                </Link>
                <button
                  type="button"
                  onClick={() => setReference(undefined)}
                  className="inline-flex min-h-12 items-center rounded-full border border-[var(--ld-line-2)] px-5 text-[15px] font-semibold transition-colors hover:border-[var(--ld-ink)]"
                >
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative rounded-[30px] bg-[var(--ld-paper)] p-[clamp(22px,3.2vw,44px)] text-[var(--ld-ink)] shadow-[0_60px_120px_-50px_rgb(0_0_0/0.75)]"
            >
              <div className="mb-[26px] flex items-center justify-between gap-3">
                <span className="font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{copy.sheetLabel}</span>
                <span className="inline-flex items-center gap-2.5 font-mono text-[11px] text-[var(--ld-text-muted)]">
                  <span
                    role="progressbar"
                    aria-label="Form progress"
                    aria-valuemin={0}
                    aria-valuemax={3}
                    aria-valuenow={done}
                    className="h-[3px] w-[74px] overflow-hidden rounded-full bg-[#dfe4f2]"
                  >
                    <span
                      className="block h-full bg-[var(--ld-ink)] transition-[width] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
                      style={{ width: `${Math.round((done / 3) * 100)}%` }}
                    />
                  </span>
                  {done} / 3
                </span>
              </div>

              {/* 01: what brings you here */}
              <fieldset>
                <SectionTitle>
                  What brings you here?
                </SectionTitle>
                <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                  {projectTypes.map((option) => {
                    const on = option.value === type;
                    const tile = forms[option.value];
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={on}
                        aria-label={tile.label}
                        onClick={() => setType(option.value)}
                        className={cn(
                          "relative flex min-h-[124px] flex-col items-start gap-[22px] rounded-[18px] border p-4 text-left outline-none transition-colors duration-300 hover:border-[var(--ld-ink)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2",
                          on ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "border-transparent bg-[#eef1fa]"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid size-[34px] place-items-center rounded-[10px] text-[15px]",
                            on ? "bg-[var(--ld-deep)] text-[var(--ld-paper)]" : "bg-white text-[var(--ld-deep)]"
                          )}
                        >
                          {tile.icon}
                        </span>
                        <span aria-hidden="true">
                          <span className="block text-[15px] leading-tight font-bold">{tile.label}</span>
                          <span className={cn("mt-1 block text-[12.5px] leading-snug", on ? "text-[var(--ld-tint)]" : "text-[var(--ld-text-muted)]")}>
                            {tile.sub}
                          </span>
                        </span>
                        {on ? <span aria-hidden="true" className="absolute top-3.5 right-3.5 size-2 rounded-full bg-[var(--ld-accent)]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 02: about you */}
              <fieldset className="mt-[34px]">
                <SectionTitle>About you</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id="name" label="Name" error={errors.name}>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={cn(INPUT, "h-[54px]")}
                    />
                  </Field>
                  <Field id="email" label="Email" error={errors.email}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ada@company.com"
                      value={draft.email}
                      onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={cn(INPUT, "h-[54px]")}
                    />
                  </Field>
                </div>

                {fields.company ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field id="company" label="Company" optional>
                      <input id="company" name="company" autoComplete="organization" placeholder="Where you work" className={cn(INPUT, "h-[54px]")} />
                    </Field>
                    <ChipGroup name="role" legend="Your role" options={roles.filter((role) => role.value)} />
                  </div>
                ) : null}

                {fields.stage && audiences.length > 0 ? (
                  <fieldset className="mt-4">
                    <legend className="mb-[7px] font-mono text-[11.5px] tracking-[0.08em] text-[var(--ld-text-muted)] uppercase">
                      Which sounds like you?
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {audiences.map((audience) => (
                        <label key={audience.title} className="group cursor-pointer">
                          <input type="radio" name="stage" value={audience.title} className="peer sr-only" />
                          <span className="block h-full rounded-[14px] border border-[var(--ld-line)] bg-white p-3.5 transition-colors hover:border-[var(--ld-ink)] peer-checked:border-[var(--ld-deep)] peer-checked:bg-[var(--ld-deep)] peer-checked:text-[var(--ld-paper)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ld-accent)] peer-focus-visible:ring-offset-2">
                            <span className="block text-sm leading-tight font-bold">{audience.title}</span>
                            {audience.startsAt ? (
                              <span className="mt-1.5 block font-mono text-[10.5px] tracking-[0.04em] text-[var(--ld-text-muted)] uppercase group-has-checked:text-[var(--ld-tint)]">
                                Usually starts at {audience.startsAt}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {fields.codeLink ? (
                  <Field id="codeLink" label="Your code" optional error={errors.codeLink} className="mt-3">
                    <input
                      id="codeLink"
                      name="codeLink"
                      inputMode="url"
                      placeholder="github.com/you, or a project you're proud of"
                      aria-invalid={Boolean(errors.codeLink)}
                      aria-describedby={errors.codeLink ? "codeLink-error" : undefined}
                      className={cn(INPUT, "h-[54px]")}
                    />
                  </Field>
                ) : null}
              </fieldset>

              {/* 03: the details */}
              <fieldset className="mt-[34px]">
                <SectionTitle>{copy.detailsTitle}</SectionTitle>
                <div className="flex flex-col gap-3.5">
                  {fields.budget ? <ChipGroup name="budget" legend="Budget" options={budgets.filter((budget) => budget.value)} /> : null}
                  {fields.timeline ? <ChipGroup name="timeline" legend={copy.timelineLabel} options={timelines.filter((timeline) => timeline.value)} /> : null}

                  <Field id="message" label={copy.messageLabel} hint={copy.hint || undefined} error={errors.message}>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder={copy.placeholder}
                      value={draft.message}
                      onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "message-error" : copy.hint ? "message-hint" : undefined}
                      className={cn(INPUT, "resize-y py-3.5 leading-normal")}
                    />
                  </Field>

                  {fields.files ? (
                    <div>
                      <label
                        htmlFor="files"
                        className={cn(
                          "flex cursor-pointer items-center gap-4 rounded-[18px] border-[1.5px] border-dashed bg-[#f9faff] p-[18px] transition-colors hover:border-[var(--ld-ink)]",
                          errors.files ? "border-[#c9502f]" : "border-[#c3cce3]"
                        )}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          addFiles(event.dataTransfer.files);
                        }}
                      >
                        <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[var(--ld-ink)] text-[var(--ld-tint)]">
                          <UploadIcon className="size-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-semibold">{copy.filesLabel}</span>
                          <span className="mt-0.5 block text-[13px] text-[var(--ld-text-muted)]">
                            Drop files here or <u>browse</u> · up to {FILE_LIMITS.maxFiles} files, {formatBytes(FILE_LIMITS.maxBytesTotal)}
                          </span>
                        </span>
                      </label>
                      <input
                        ref={fileInputRef}
                        id="files"
                        type="file"
                        multiple
                        accept={ACCEPTED_FILE_EXTENSIONS}
                        onChange={(event) => addFiles(event.target.files)}
                        aria-invalid={Boolean(errors.files)}
                        aria-describedby={errors.files ? "files-error" : undefined}
                        className="sr-only"
                      />
                      {errors.files ? (
                        <p id="files-error" className="mt-2 text-[13px] text-[#b2432a]">
                          {errors.files}
                        </p>
                      ) : null}
                      {files.length > 0 ? (
                        <ul className="mt-2.5 flex flex-col gap-2">
                          {files.map((file, index) => (
                            <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-[var(--ld-line)] bg-white px-3 py-2">
                              <PaperclipIcon aria-hidden="true" className="size-4 shrink-0 text-[var(--ld-deep)]" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm">{file.name}</span>
                                <span className="block text-xs text-[var(--ld-text-muted)]">{formatBytes(file.size)}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                aria-label={`Remove ${file.name}`}
                                className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--ld-text-muted)] transition-colors hover:bg-[#eef1fa] hover:text-[var(--ld-ink)]"
                              >
                                <XIcon aria-hidden="true" className="size-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </fieldset>

              {/* Bots fill every field they find; this one is never shown. */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="mt-[30px] flex flex-wrap items-center justify-between gap-4 border-t border-[var(--ld-line)] pt-6">
                <span className="inline-flex items-center gap-2.5 text-[13.5px] text-[var(--ld-text-muted)]">
                  <span aria-hidden="true" className="grid size-[22px] place-items-center rounded-[7px] bg-[#e6eaf5]">
                    <LockIcon className="size-3" />
                  </span>
                  Read by a person. Never shared.
                </span>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-[58px] items-center gap-3 rounded-full bg-[var(--ld-accent)] pr-2.5 pl-[26px] text-base font-bold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
                >
                  {status === "uploading" ? "Uploading files…" : status === "submitting" ? "Sending…" : copy.submit}
                  <span aria-hidden="true" className="grid size-[38px] place-items-center rounded-full bg-[var(--ld-ink)] text-[var(--ld-paper)]">
                    <ArrowRightIcon className="size-4" />
                  </span>
                </button>
              </div>

              <div aria-live="polite" className="empty:hidden">
                {errors.form ? <p className="mt-4 text-right text-sm text-[#b2432a]">{errors.form}</p> : null}
                {status === "error" ? (
                  <p className="mt-4 text-right text-sm text-[#b2432a]">
                    Something went wrong. Please try again, or email{" "}
                    <a href={`mailto:${email}`} className="underline">
                      {email}
                    </a>{" "}
                    directly.
                  </p>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* The seam into the footer: space, then one drawn line with a single
          point of the accent. */}
      <div className="doc-shell">
        <div
          aria-hidden="true"
          className="relative mt-[clamp(72px,9vw,120px)] h-px bg-[linear-gradient(90deg,transparent,rgb(var(--ld-tint-rgb)/0.28)_50%,transparent)]"
        >
          <span className="absolute top-1/2 left-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--ld-accent)] shadow-[0_0_0_6px_var(--ld-ink)]" />
        </div>
      </div>
    </section>
  );
}

export { ContactView };
