"use client";

import { useRef, useState } from "react";
import { CheckIcon, LoaderCircleIcon, SendIcon, UserRoundIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/sections/reviews/star-rating";
import { uploadAttachment, UploadError } from "@/lib/storage/upload-client";
import {
  ACCEPTED_PHOTO_EXTENSIONS,
  REVIEW_LIMITS,
  validateReview,
  type ReviewFieldErrors,
} from "@/lib/reviews/schema";

/* "uploading" is separate from "submitting" because a photo can take a moment
   on a phone connection, and one "Sending" label for both reads as a hang. */
type Status = "idle" | "uploading" | "submitting" | "success" | "error";

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground">(optional)</span>
        ) : null}
      </Label>
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

function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ReviewFieldErrors>({});
  const [bodyLength, setBodyLength] = useState(0);
  const photoInput = useRef<HTMLInputElement>(null);

  const busy = status === "uploading" || status === "submitting";

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setErrors((current) => ({ ...current, photo: undefined }));

    if (file && file.size > REVIEW_LIMITS.maxPhotoBytes) {
      setErrors((current) => ({ ...current, photo: "Keep it under 5MB." }));
      event.target.value = "";
      return;
    }

    setPhoto(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const input = {
      fullName: String(data.get("fullName") ?? ""),
      title: String(data.get("title") ?? ""),
      body: String(data.get("body") ?? ""),
      rating,
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
      <div
        /* Announced, because the form it replaced is gone and a sighted user
           sees the change while a screen reader user would not. */
        role="status"
        className="rounded-2xl border border-brand-teal/30 bg-brand-teal/[0.07] px-6 py-10 text-center"
      >
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-teal/15">
          <CheckIcon className="size-5 text-brand-teal" />
        </span>
        <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
          Thank you, genuinely.
        </h3>
        <p className="mx-auto mt-2 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
          I read every review myself before it goes up, so it will appear on this
          page shortly rather than instantly. If I need to check anything I will
          email you first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Off-screen rather than `type="hidden"`: bots parse the markup and skip
          hidden inputs, but fill anything that looks like a real field. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rating-group">How did it go?</Label>
        <div id="rating-group">
          <StarRating
            name="rating"
            value={rating}
            onChange={(next) => {
              setRating(next);
              setErrors((current) => ({ ...current, rating: undefined }));
            }}
            invalid={Boolean(errors.rating)}
          />
        </div>
        {errors.rating ? (
          <p className="text-xs text-destructive">{errors.rating}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label="Your name" error={errors.fullName}>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            className="h-10"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
        </Field>

        <Field
          id="title"
          label="Role and company"
          hint="Shown under your name."
          error={errors.title}
        >
          <Input
            id="title"
            name="title"
            placeholder="CTO, Acme"
            className="h-10"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : "title-hint"}
          />
        </Field>
      </div>

      <Field
        id="contactEmail"
        label="Your email"
        hint="Never shown on the site. It is how I check a review is really from you."
        error={errors.contactEmail}
      >
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          autoComplete="email"
          className="h-10"
          aria-invalid={Boolean(errors.contactEmail)}
          aria-describedby={errors.contactEmail ? "contactEmail-error" : "contactEmail-hint"}
        />
      </Field>

      <Field
        id="body"
        label="What you would tell someone considering working with me"
        error={errors.body}
      >
        <Textarea
          id="body"
          name="body"
          rows={6}
          maxLength={REVIEW_LIMITS.bodyMax}
          onChange={(event) => setBodyLength(event.target.value.length)}
          className="resize-y"
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? "body-error" : "body-count"}
        />
        <p
          id="body-count"
          className={cn(
            "text-right font-mono text-[0.6875rem]",
            bodyLength > REVIEW_LIMITS.bodyMax - 100
              ? "text-amber-500"
              : "text-muted-foreground"
          )}
        >
          {bodyLength}/{REVIEW_LIMITS.bodyMax}
        </p>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="linkTitle" label="A link" optional hint="Your company, or the project." >
          <Input id="linkTitle" name="linkTitle" placeholder="Acme" className="h-10" />
        </Field>
        <Field id="linkUrl" label="Its address" optional error={errors.links}>
          <Input id="linkUrl" name="linkUrl" placeholder="acme.com" className="h-10" />
        </Field>
      </div>

      <Field id="photo" label="A photo of you" optional error={errors.photo}>
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/40">
            {photo ? (
              /* An object URL rather than a FileReader data URL: it does not
                 copy the whole image into a base64 string in memory. */
              /* A blob: URL for a file that has not been uploaded anywhere yet,
                 so there is nothing for next/image to optimise. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(photo)}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <UserRoundIcon className="size-5 text-muted-foreground" />
            )}
          </span>

          <input
            ref={photoInput}
            id="photo"
            type="file"
            accept={ACCEPTED_PHOTO_EXTENSIONS}
            onChange={choosePhoto}
            className="sr-only"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => photoInput.current?.click()}
          >
            {photo ? "Change" : "Choose a photo"}
          </Button>

          {photo ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove the photo"
              onClick={() => {
                setPhoto(null);
                if (photoInput.current) photoInput.current.value = "";
              }}
            >
              <XIcon />
            </Button>
          ) : null}
        </div>
      </Field>

      {errors.form ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Reviews are read before they appear. Nothing goes up automatically.
        </p>
        <Button type="submit" size="lg" disabled={busy} className="h-11 shrink-0 px-6 text-sm">
          {busy ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              {status === "uploading" ? "Uploading photo" : "Sending"}
            </>
          ) : (
            <>
              <SendIcon />
              Submit review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export { ReviewForm };
