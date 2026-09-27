"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconPicker } from "@/components/admin/icon-picker";
import { MediaPicker } from "@/components/admin/media-picker";
import { StringList } from "@/components/admin/string-list";
import { uploadAttachment, UploadError } from "@/lib/storage/upload-client";
import { cleanBlock, validateBlock, type BlockErrors } from "@/lib/content/blocks/clean";
import type {
  Block,
  BlockData,
  BlockRecord,
  Field,
  Group,
} from "@/lib/content/blocks/schema";
import { resetContentBlock, saveContentBlock } from "@/app/admin/content/actions";

/**
 * One editor for every page section.
 *
 * It renders whatever `block` describes rather than knowing about any
 * particular section, which is the point: adding a section to the site means
 * adding an entry to `lib/content/blocks/schema.ts`, not building another form.
 *
 * There is a cost to that, and it is worth naming. A purpose-built form can lay
 * out the About page's experience entries differently from the client logos.
 * This one gives them the same stacked-card treatment. In exchange, eight
 * sections became editable at once and the ninth is free.
 */
function BlockEditor({
  block,
  initial,
  cloudName,
  /** True when this section has been saved before, which is what Reset undoes. */
  overridden,
  updatedBy,
  updatedAt,
}: {
  block: Block;
  initial: BlockData;
  cloudName: string;
  overridden: boolean;
  updatedBy: string;
  updatedAt: string;
}) {
  const [data, setData] = useState<BlockData>(initial);
  const [errors, setErrors] = useState<BlockErrors>({});
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [pending, startTransition] = useTransition();

  function setGroup(name: string, value: BlockData[string]) {
    setSaved(false);
    setData((current) => ({ ...current, [name]: value }));
  }

  function save() {
    const cleaned = cleanBlock(block.key, data);
    const problems = validateBlock(block.key, cleaned);

    setErrors(problems);
    if (Object.keys(problems).length > 0) {
      setFormError("Some details need correcting.");
      return;
    }

    setFormError("");
    startTransition(async () => {
      const result = await saveContentBlock(block.key, cleaned);
      if (result.ok) {
        /* Replaced with what the server stored, not just marked saved: the
           action cleans again, and showing the stored version means the form
           never disagrees with the page. */
        setData(result.data);
        setSaved(true);
      } else {
        setFormError(result.message);
        setErrors(result.errors ?? {});
      }
    });
  }

  function reset() {
    startTransition(async () => {
      const result = await resetContentBlock(block.key);
      if (result.ok) {
        setData(result.data);
        setConfirmingReset(false);
        setSaved(true);
      } else {
        setFormError(result.message);
      }
    });
  }

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/content" />}>
          <ArrowLeftIcon />
          All sections
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-brand-teal">
              Saved
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={block.path} target="_blank" />}
          >
            View the page
            <ExternalLinkIcon />
          </Button>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            Save
          </Button>
        </div>
      </div>

      <div className="mt-6 max-w-3xl">
        {/* The same eyebrow and rule every other admin page carries, so an
            editor reads as a page of the tool rather than a bare form. */}
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-primary">
          {block.page}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-medium tracking-tight text-foreground">
          {block.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {block.description}
        </p>
        {overridden ? (
          <p className="mt-3 font-mono text-[0.6875rem] text-muted-foreground">
            Edited{updatedBy ? ` by ${updatedBy}` : ""}
            {updatedAt ? ` on ${updatedAt}` : ""}
          </p>
        ) : (
          <p className="mt-3 font-mono text-[0.6875rem] text-muted-foreground">
            Showing the copy built into the site. Saving takes over from it.
          </p>
        )}
      </div>

      {formError ? (
        <p role="alert" className="mt-5 max-w-3xl text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <div className="mt-8 max-w-3xl space-y-10">
        {block.groups.map((group) => (
          <GroupEditor
            key={group.name}
            group={group}
            value={data[group.name]}
            onChange={(next) => setGroup(group.name, next)}
            error={errors[group.name]}
            cloudName={cloudName}
          />
        ))}
      </div>

      {/*
        The undo for an edit somebody regrets. Retyping the original from memory
        is not an undo, so this removes the stored version and lets the built-in
        copy render again.
      */}
      {overridden ? (
        <div className="mt-14 max-w-3xl rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">
            Put this section back to how it shipped
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Removes your version and renders the copy built into the site again.
            Your edits are not kept, so copy anything you want out first.
          </p>
          {confirmingReset ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Discard your version?</span>
              <Button variant="destructive" size="sm" onClick={reset} disabled={pending}>
                Yes, reset it
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
                Keep it
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setConfirmingReset(true)}
            >
              <RotateCcwIcon />
              Reset to the original
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ── Groups ───────────────────────────────────────────────────────────── */

function GroupEditor({
  group,
  value,
  onChange,
  error,
  cloudName,
}: {
  group: Group;
  value: BlockData[string] | undefined;
  onChange: (next: BlockData[string]) => void;
  error?: string;
  cloudName: string;
}) {
  const header = (
    <div>
      {/* A short gradient tick beside each group, so a long form reads as a
          set of sections rather than one column of fields. */}
      <h2 className="flex items-center gap-2 font-heading text-base font-medium text-foreground">
        <span
          aria-hidden
          className="h-3.5 w-0.5 shrink-0 rounded-full bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))]"
        />
        {group.label}
      </h2>
      {group.description ? (
        <p className="mt-1 max-w-[60ch] text-xs leading-relaxed text-muted-foreground">
          {group.description}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );

  if (group.kind === "strings") {
    return (
      <section className="space-y-3">
        {header}
        <StringList
          value={(value as string[]) ?? []}
          onChange={onChange}
          label={group.label}
          placeholder={group.placeholder}
          long={group.long}
          max={group.max}
          addLabel={`Add a ${group.long ? "paragraph" : "line"}`}
        />
      </section>
    );
  }

  if (group.kind === "object") {
    const record = (value as BlockRecord) ?? {};
    return (
      <section className="space-y-3">
        {header}
        <div className="rounded-xl border border-border bg-card/40 px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {group.fields.map((field) => (
              <FieldEditor
                key={field.name}
                field={field}
                value={record[field.name]}
                onChange={(next) => onChange({ ...record, [field.name]: next })}
                idPrefix={`${group.name}-${field.name}`}
                cloudName={cloudName}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (group.kind === "keyed") {
    const stored = (value as Record<string, BlockRecord>) ?? {};
    return (
      <section className="space-y-3">
        {header}
        <div className="space-y-3">
          {group.entries.map((entry) => (
            <fieldset
              key={entry.key}
              className="rounded-xl border border-border bg-card/40 px-4 py-4"
            >
              <legend className="px-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-primary/80">
                {entry.label}
              </legend>
              {entry.hint ? (
                <p className="mb-2 text-[0.6875rem] text-muted-foreground">{entry.hint}</p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <FieldEditor
                    key={field.name}
                    field={field}
                    value={stored[entry.key]?.[field.name]}
                    onChange={(next) =>
                      onChange({
                        ...stored,
                        [entry.key]: { ...stored[entry.key], [field.name]: next },
                      })
                    }
                    idPrefix={`${group.name}-${entry.key}-${field.name}`}
                    label={`${field.label} for ${entry.label}`}
                    cloudName={cloudName}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>
    );
  }

  return (
    <ListGroupEditor
      group={group}
      rows={(value as BlockRecord[]) ?? []}
      onChange={onChange}
      header={header}
      cloudName={cloudName}
    />
  );
}

/**
 * The common case: an ordered set of records.
 *
 * Its own component rather than a branch of the one above, because the helpers
 * below are function declarations and TypeScript will not narrow `group` inside
 * a hoisted function. Taking the narrowed type as a prop states it once.
 */
function ListGroupEditor({
  group,
  rows,
  onChange,
  header,
  cloudName,
}: {
  group: Extract<Group, { kind: "list" }>;
  rows: BlockRecord[];
  onChange: (next: BlockRecord[]) => void;
  header: React.ReactNode;
  cloudName: string;
}) {
  function update(index: number, patch: BlockRecord) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  /* Order is the array's order, so a row's position is not a field anybody has
     to maintain. Buttons rather than drag and drop, which needs a pointer. */
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function blank(): BlockRecord {
    const record: BlockRecord = {};
    for (const field of group.fields) record[field.name] = field.kind === "strings" ? [] : "";
    return record;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        {header}
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {rows.length} / {group.max}
        </span>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <fieldset key={index} className="rounded-xl border border-border bg-card/40 px-4 py-4">
            <legend className="px-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-primary/80">
              {group.itemNoun} {String(index + 1).padStart(2, "0")}
            </legend>

            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                aria-label={`Move ${group.itemNoun} ${index + 1} up`}
              >
                <ChevronUpIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === rows.length - 1}
                onClick={() => move(index, 1)}
                aria-label={`Move ${group.itemNoun} ${index + 1} down`}
              >
                <ChevronDownIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Delete ${group.itemNoun} ${index + 1}`}
              >
                <Trash2Icon />
              </Button>
            </div>

            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              {group.fields.map((field) => (
                <FieldEditor
                  key={field.name}
                  field={field}
                  value={row[field.name]}
                  onChange={(next) => update(index, { [field.name]: next })}
                  idPrefix={`${group.name}-${index}-${field.name}`}
                  label={`${field.label} for ${group.itemNoun} ${index + 1}`}
                  cloudName={cloudName}
                />
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {rows.length < group.max ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, blank()])}>
          <PlusIcon />
          Add {group.itemNoun}
        </Button>
      ) : null}
    </section>
  );
}

/* ── Fields ───────────────────────────────────────────────────────────── */

function FieldEditor({
  field,
  value,
  onChange,
  idPrefix,
  label,
  cloudName,
}: {
  field: Field;
  value: string | string[] | undefined;
  onChange: (next: string | string[]) => void;
  idPrefix: string;
  /** The accessible name, which has to be unique across a list of rows. */
  label?: string;
  cloudName: string;
}) {
  /* A textarea, a list or an image span the card; short text sits two-up. */
  const wide =
    field.kind === "textarea" || field.kind === "strings" || field.kind === "image";

  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <Label htmlFor={idPrefix} className="text-xs text-muted-foreground">
        {field.label}
        {!field.required ? <span className="font-normal">(optional)</span> : null}
      </Label>

      {field.kind === "textarea" ? (
        <Textarea
          id={idPrefix}
          value={(value as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          placeholder={field.placeholder}
          className="resize-y text-sm"
          aria-label={label ?? field.label}
        />
      ) : field.kind === "strings" ? (
        <StringList
          value={(value as string[]) ?? []}
          onChange={onChange}
          label={label ?? field.label}
          placeholder={field.placeholder}
          /* Bullet points are sentences; tags are words. The difference is
             whether the schema gave the field a hint about writing lines. */
          long={field.name === "points"}
          addLabel="Add a point"
        />
      ) : field.kind === "icon" ? (
        <IconPicker
          value={(value as string) ?? ""}
          onChange={onChange}
          label={label ?? field.label}
        />
      ) : field.kind === "image" ? (
        <ImageField
          value={(value as string) ?? ""}
          onChange={onChange}
          label={label ?? field.label}
          cloudName={cloudName}
        />
      ) : (
        <Input
          id={idPrefix}
          value={(value as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="h-9 text-sm"
          aria-label={label ?? field.label}
        />
      )}

      {field.hint ? (
        <p className="text-[0.6875rem] leading-relaxed text-muted-foreground">{field.hint}</p>
      ) : null}
    </div>
  );
}

/**
 * An image: either a file uploaded here, or a path to something already in
 * /public.
 *
 * Both, rather than uploads only, because the logos and certificate scans
 * already on the site are files in the repository and replacing all of them
 * with uploads to make the field work would be a lot of churn for nothing. The
 * path is checked on save; see `safeImagePath`.
 */
function ImageField({
  value,
  onChange,
  label,
  cloudName,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  cloudName: string;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const uploaded = await uploadAttachment(file, { endpoint: "/api/admin/posts/upload" });
      /* Stored as a delivery URL rather than a public_id, because this field
         is rendered straight into an <img src> by sections that know nothing
         about Cloudinary. */
      onChange(
        `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_limit,f_auto,q_auto/${uploaded.publicId}`
      );
    } catch (thrown) {
      setError(
        thrown instanceof UploadError ? thrown.message : "That file could not be uploaded."
      );
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {value ? (
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-8 object-contain" />
          </span>
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            <ImageIcon className="size-4" />
          </span>
        )}

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/clients/name.webp"
          className="h-9 text-xs"
          aria-label={label}
        />

        {cloudName ? (
          <>
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="hidden"
              onChange={choose}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={uploading}
              onClick={() => input.current?.click()}
              aria-label={`Upload ${label}`}
            >
              {uploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
            </Button>
          </>
        ) : null}
      </div>

      {/* Reuse before re-upload: the same logo in two places should be one
          file, not two. */}
      {cloudName ? <MediaPicker onPick={onChange} /> : null}

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { BlockEditor };
