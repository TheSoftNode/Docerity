"use client";

import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { CheckIcon, LoaderCircleIcon, UserRoundIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadAttachment, UploadError } from "@/lib/storage/upload-client";
import {
  ACCEPTED_PHOTO_EXTENSIONS,
  REVIEW_KINDS,
  REVIEW_LIMITS,
  validateReview,
  type ReviewFieldErrors,
  type ReviewKind,
} from "@/lib/reviews/schema";
import { RATING_WORDS, kindOption } from "@/components/sections/reviews-page/reviews-content";

/* "uploading" is separate from "submitting" because a photo can take a moment
   on a phone connection, and one "Sending" label for both reads as a hang. */
type Status = "idle" | "uploading" | "submitting" | "success" | "error";

/* The kinds' marks on their cards. */
const KIND_ICONS: Record<ReviewKind, string> = { client: "⌘", mentee: "⇡", reader: "✳" };

const INPUT =
  "h-[46px] w-full rounded-xl border border-[var(--ld-line)] bg-white px-3.5 text-[15px] text-[var(--ld-ink)] outline-none transition-[border-color,box-shadow] placeholder:text-[#9aa0b1] focus:border-[var(--ld-deep)] focus:shadow-[0_0_0_3px_rgb(28_58_140/0.15)] aria-[invalid=true]:border-[#c2492b]";

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional ? <span className="font-normal text-[var(--ld-text-muted)]"> (optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[13px] text-[var(--ld-text-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-[#c2492b]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The review form: how we know each other, a rating, then the review.
 *
 * Both choices are real radio groups, so arrow keys move between options and
 * a screen reader says "4 out of 5" without any ARIA; the inputs are visually
 * hidden and the cards are their labels. Validation runs here to save a round
 * trip and again on the server, which is the authority. A photo that fails to
 * upload does not fail the review.
 */
function ReviewForm({ submitLabel = "Send for reading" }: { submitLabel?: string }) {
  const id = useId();
  const [rating, setRating] = useState(0);
  const [kind, setKind] = useState<ReviewKind>("client");
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ReviewFieldErrors>({});
  const [bodyLength, setBodyLength] = useState(0);
  const photoInput = useRef<HTMLInputElement>(null);

  const busy = status === "uploading" || status === "submitting";

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setErrors((current) => ({ ...current, photo: undefined }));

    if (file && file.size > REVIEW_LIMITS.maxPhotoBytes) {
      setErrors((current) => ({ ...current, photo: "Keep it under 5MB." }));
      event.target.value = "";
      return;
    }

    setPhoto(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const input = {
      fullName: String(data.get("fullName") ?? ""),
      title: String(data.get("title") ?? ""),
      body: String(data.get("body") ?? ""),
      rating,
      kind,
      contactEmail: String(data.get("contactEmail") ?? ""),
      links: [
        {
          title: String(data.get("linkTitle") ?? ""),
          url: String(data.get("linkUrl") ?? ""),
        },
      ],
    };

    /* The same validator the route runs. This one only saves a round trip;
       the server's is the authority. */
    const found = validateReview(input);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setStatus("error");
      /* Moves focus to the first problem, so a keyboard or screen-reader user
         is not left to hunt for what changed. */
      const firstField = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      return;
    }

    setErrors({});

    let photoPublicId = "";
    if (photo) {
      setStatus("uploading");
      try {
        const uploaded = await uploadAttachment(photo, {
          endpoint: "/api/reviews/upload",
        });
        photoPublicId = uploaded.publicId;
      } catch (error) {
        /*
          A failed photo does not fail the review. The text is what matters and
          the display falls back to initials, so this reports the problem and
          carries on rather than making someone retype everything.
        */
        setErrors({
          photo:
            error instanceof UploadError
              ? `${error.message} Your review will be sent without a photo.`
              : "That photo could not be uploaded. Your review will be sent without it.",
        });
      }
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          photoPublicId,
          links: input.links.filter((link) => link.title && link.url),
          /* The honeypot. Always empty when a person fills this in. */
          website: String(data.get("website") ?? ""),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok: boolean; error?: { message: string; fields?: ReviewFieldErrors } }
        | null;

      if (!response.ok || !payload?.ok) {
        setErrors(
          payload?.error?.fields ?? {
            form: payload?.error?.message ?? "Something went wrong. Please try again.",
          }
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
      setRating(0);
      setPhoto(null);
      setBodyLength(0);
    } catch {
      setErrors({ form: "Could not reach the server. Please try again." });
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      /* Announced, because the form it replaced is gone and a sighted user sees
         the change while a screen reader user would not. */
      <div role="status" className="ld-pop rounded-3xl border border-[#cfe9dc] bg-[#f1faf5] px-6 py-12 text-center">
        <span className="inline-grid size-11 place-items-center rounded-full bg-[#2f9e6b] text-white">
          <CheckIcon className="size-5" />
        </span>
        <h3 className="ld-display mt-4 text-2xl font-extrabold tracking-[-0.02em]">Thank you, genuinely.</h3>
        <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-[var(--ld-text-2)]">
          Every review is read before it goes up, so it will appear on this page shortly rather than instantly. If anything
          needs checking we will email you first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-[22px]">
      {/* Off-screen rather than type="hidden": bots parse the markup and skip
          hidden inputs, but fill anything that looks like a real field. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Asked rather than inferred from the role: "Engineer at Acme" could be a
          client's engineer or a mentee, and guessing wrong puts a client's
          quote on the mentorship page. */}
      <fieldset>
        <legend className="mb-2.5 text-[15px] font-semibold">How do we know each other?</legend>
        <div role="radiogroup" aria-label="How do we know each other" className="grid gap-2 sm:grid-cols-3">
          {REVIEW_KINDS.map((option) => {
            const on = kind === option.value;
            const { where } = kindOption(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-[14px] border p-3.5 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ld-accent)] has-[:focus-visible]:ring-offset-2",
                  on ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "border-[var(--ld-line)] bg-white hover:border-[var(--ld-ink)]"
                )}
              >
                <input type="radio" name="kind" value={option.value} checked={on} onChange={() => setKind(option.value)} className="sr-only" />
                <span aria-hidden="true" className="block text-lg">
                  {KIND_ICONS[option.value]}
                </span>
                <span className="mt-2 block text-sm font-semibold">{option.label}</span>
                {where ? <span className="mt-0.5 block text-xs opacity-70">Shown on {where.replace(/ page$/, "").replace(/ only$/, "")}</span> : null}
              </label>
            );
          })}
        </div>
        {errors.kind ? <p className="mt-2 text-[13px] text-[#c2492b]">{errors.kind}</p> : null}
      </fieldset>

      {/* The one field with no default and the one people skip. */}
      <fieldset>
        <legend className="mb-2.5 text-[15px] font-semibold">How was it?</legend>
        <div
          role="radiogroup"
          aria-label="Rating out of five"
          aria-invalid={Boolean(errors.rating) || undefined}
          className="flex gap-1.5"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const lit = value <= rating;
            return (
              <label
                key={value}
                className={cn(
                  "ld-display grid min-h-12 flex-1 cursor-pointer place-items-center rounded-xl border text-lg font-extrabold transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--ld-accent)] has-[:focus-visible]:ring-offset-2",
                  lit ? "border-[var(--ld-deep)] bg-[var(--ld-deep)] text-white" : "border-[var(--ld-line)] bg-white hover:border-[var(--ld-deep)]",
                  errors.rating && !lit && "border-[#c2492b]"
                )}
              >
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => {
                    setRating(value);
                    setErrors((current) => ({ ...current, rating: undefined }));
                  }}
                  className="sr-only"
                />
                {value}
                <span className="sr-only"> out of 5</span>
              </label>
            );
          })}
        </div>
        <p aria-hidden="true" className="mt-2 font-mono text-[11.5px] text-[var(--ld-text-muted)] uppercase">
          {rating ? `${rating} out of 5 · ${RATING_WORDS[rating]}` : "Pick from 1 to 5"}
        </p>
        {errors.rating ? <p className="mt-1 text-[13px] text-[#c2492b]">{errors.rating}</p> : null}
      </fieldset>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field id="fullName" label="Your name" error={errors.fullName}>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            className={INPUT}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
        </Field>
        <Field id="title" label="Role and company" hint="Shown under your name." error={errors.title}>
          <input
            id="title"
            name="title"
            placeholder="CTO, Acme"
            className={INPUT}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : "title-hint"}
          />
        </Field>
      </div>

      <Field id="body" label="What you would tell someone considering working with us" error={errors.body}>
        <textarea
          id="body"
          name="body"
          rows={6}
          maxLength={REVIEW_LIMITS.bodyMax}
          onChange={(event) => setBodyLength(event.target.value.length)}
          className={cn(INPUT, "h-auto resize-y py-3 leading-relaxed")}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "body-error" : "body-count"}
        />
        <p
          id="body-count"
          className={cn(
            "text-right font-mono text-[11px]",
            bodyLength > REVIEW_LIMITS.bodyMax - 100 ? "text-[#c2492b]" : "text-[var(--ld-text-muted)]"
          )}
        >
          {bodyLength}/{REVIEW_LIMITS.bodyMax}
        </p>
      </Field>

      <Field
        id="contactEmail"
        label="Your email"
        hint="Never shown on the site. It is how we check a review is really from you."
        error={errors.contactEmail}
      >
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          autoComplete="email"
          className={INPUT}
          aria-invalid={Boolean(errors.contactEmail)}
          aria-describedby={errors.contactEmail ? "contactEmail-error" : "contactEmail-hint"}
        />
      </Field>

      {/* The optional pieces under one legend, so the required fields above
          read as the real length of the form. */}
      <fieldset className="rounded-2xl border border-dashed border-[var(--ld-line-2)] px-4 pt-2 pb-4">
        <legend className="px-1.5 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Optional</legend>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="linkTitle" label="A link" hint="Your company, or the project.">
            <input id="linkTitle" name="linkTitle" placeholder="Acme" className={INPUT} />
          </Field>
          <Field id="linkUrl" label="Its address" error={errors.links}>
            <input id="linkUrl" name="linkUrl" placeholder="acme.com" className={INPUT} />
          </Field>
        </div>
        <Field id={`${id}-photo`} label="A photo of you" error={errors.photo} className="mt-3.5">
          <div className="flex items-center gap-3">
            <span className="inline-grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--ld-line)] bg-white">
              {photo ? (
                /* A blob: URL for a file not uploaded anywhere yet, so there is
                   nothing for next/image to optimise. */
                // eslint-disable-next-line @next/next/no-img-element
                <img src={URL.createObjectURL(photo)} alt="" className="size-full object-cover" />
              ) : (
                <UserRoundIcon className="size-5 text-[var(--ld-text-muted)]" />
              )}
            </span>
            <input
              ref={photoInput}
              id={`${id}-photo`}
              type="file"
              accept={ACCEPTED_PHOTO_EXTENSIONS}
              onChange={choosePhoto}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="min-h-10 rounded-full border border-[var(--ld-line-2)] bg-white px-4 text-sm font-semibold outline-none hover:border-[var(--ld-ink)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
            >
              {photo ? "Change" : "Choose a photo"}
            </button>
            {photo ? (
              <button
                type="button"
                aria-label="Remove the photo"
                onClick={() => {
                  setPhoto(null);
                  if (photoInput.current) photoInput.current.value = "";
                }}
                className="grid size-9 place-items-center rounded-full outline-none hover:bg-[#eef1f8] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
              >
                <XIcon className="size-4" />
              </button>
            ) : null}
          </div>
        </Field>
      </fieldset>

      {errors.form ? (
        <p role="alert" className="rounded-xl border border-[#f3c6b8] bg-[#fff3ef] px-3.5 py-2.5 text-sm text-[#c2492b]">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col gap-3.5 border-t border-[var(--ld-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] text-[var(--ld-text-muted)]">Reviews are read before they appear. Nothing goes up automatically.</p>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-[50px] shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-semibold text-[var(--ld-paper)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-70"
        >
          {busy ? (
            <>
              <LoaderCircleIcon className="size-4 animate-spin" />
              {status === "uploading" ? "Uploading photo" : "Sending"}
            </>
          ) : (
            <>
              {submitLabel} <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export { ReviewForm };
