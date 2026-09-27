"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  ImageIcon,
  LoaderCircleIcon,
  PlusIcon,
  SaveIcon,
  StarIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAttachment, UploadError } from "@/lib/storage/upload-client";
import { saveProject } from "@/app/admin/work/actions";
import {
  PROJECT_LIMITS,
  PROJECT_PREVIEWS,
  PROJECT_STATUSES,
  SUGGESTED_GROUPS,
  slugifyProject,
  validateProject,
  type ProjectFieldErrors,
  type ProjectInput,
} from "@/lib/content/project-schema";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

/**
 * The project editor, for both a new project and an existing one.
 *
 * One component rather than two near-identical forms, with `projectId` deciding
 * whether saving creates or updates. Same arrangement as the post editor.
 */
function ProjectEditor({
  initial,
  projectId,
  cloudName,
}: {
  initial: ProjectInput;
  /** Absent for a new project. */
  projectId?: string;
  /** For previewing an uploaded screenshot before the page is saved. */
  cloudName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [project, setProject] = useState<ProjectInput>(initial);
  const [errors, setErrors] = useState<ProjectFieldErrors>({});
  /* Seeded from the URL: creating one replaces /new with /<id>, which is a
     different route, so a flag held only in state is lost in the remount. */
  const [saved, setSaved] = useState(searchParams.get("saved") === "1");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  /* The slug follows the name for a new project and stops the moment it is
     edited by hand. For an existing one it never does: a published URL that
     changed when a typo was fixed would break every link to it. */
  const [slugFollowsName, setSlugFollowsName] = useState(!projectId);

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setProject((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function toggleGroup(group: string) {
    const has = project.groups.includes(group);
    set(
      "groups",
      has ? project.groups.filter((g) => g !== group) : [...project.groups, group]
    );
  }

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrors((current) => ({ ...current, media: undefined }));
    setUploading(true);

    try {
      const uploaded = await uploadAttachment(file, {
        endpoint: "/api/admin/work/upload",
      });
      set("media", {
        type: "image",
        publicId: uploaded.publicId,
        src: "",
        /* Kept if the project already had one, because re-uploading a better
           screenshot of the same thing should not wipe its description. */
        alt: project.media?.alt ?? "",
        poster: "",
      });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        media:
          error instanceof UploadError
            ? error.message
            : "That image could not be uploaded.",
      }));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function submit(published: boolean) {
    const candidate = { ...project, published };

    const found = validateProject(candidate);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await saveProject(candidate, projectId);

      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      setProject(candidate);
      setSaved(true);

      if (!projectId) router.replace(`/admin/work/${result.id}?saved=1`);
    });
  }

  /* A Cloudinary delivery URL built here rather than on the server, so a newly
     uploaded screenshot previews before the project has been saved. */
  const previewSrc = project.media?.publicId
    ? `https://res.cloudinary.com/${cloudName}/image/upload/w_640,c_fill,f_auto,q_auto/${project.media.publicId}`
    : (project.media?.src ?? "");

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/work" />}>
          <ArrowLeftIcon />
          All work
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {saved ? (
            <span role="status" className="inline-flex items-center gap-1.5 text-xs text-brand-teal">
              <CheckIcon className="size-3.5" />
              Saved
            </span>
          ) : null}

          {projectId && project.published ? (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/work/${project.slug}`} target="_blank" />}
            >
              <ExternalLinkIcon />
              View
            </Button>
          ) : null}

          <Button variant="outline" size="sm" disabled={pending} onClick={() => submit(false)}>
            {pending ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
            Save draft
          </Button>

          <Button size="sm" disabled={pending} onClick={() => submit(true)}>
            {project.published ? "Update live" : "Publish"}
          </Button>
        </div>
      </div>

      {errors.form ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {errors.form}
        </p>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={project.name}
              onChange={(event) => {
                const name = event.target.value;
                setProject((current) => ({
                  ...current,
                  name,
                  slug: slugFollowsName ? slugifyProject(name) : current.slug,
                }));
                setSaved(false);
              }}
              className="h-11 font-heading text-base"
              placeholder="MetaPilot"
            />
            <FieldError message={errors.name} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Caption</Label>
            <Input
              id="category"
              value={project.category}
              onChange={(event) => set("category", event.target.value)}
              className="h-10"
              placeholder="Web3 · DeFi automation"
            />
            <p className="text-xs text-muted-foreground">
              The line under the name. Not a filter, just a description.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">What it does</Label>
            <Textarea
              id="description"
              value={project.description}
              onChange={(event) => set("description", event.target.value)}
              rows={4}
              className="resize-y"
              placeholder="What the thing is and what problem it solves, in a sentence or two."
            />
            <FieldError message={errors.description} />
          </div>

          {/* The screenshot. The card is mostly image, so this is the field
              that decides whether a project looks finished. */}
          <div className="flex flex-col gap-2">
            <Label>Screenshot</Label>

            <div className="rounded-xl border border-border bg-card/40 p-4">
              {previewSrc ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt=""
                    className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                  />
                  <Input
                    value={project.media?.alt ?? ""}
                    onChange={(event) =>
                      set("media", {
                        type: "image",
                        publicId: project.media?.publicId ?? "",
                        src: project.media?.src ?? "",
                        alt: event.target.value,
                        poster: "",
                      })
                    }
                    placeholder="Describe it, for anybody who cannot see it"
                    className="h-9 text-xs"
                    aria-label="Screenshot description"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInput.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => set("media", null)}
                    >
                      <XIcon />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <ImageIcon aria-hidden className="size-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Without one, the card shows a generated placeholder.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    {uploading ? (
                      <>
                        <LoaderCircleIcon className="animate-spin" />
                        Uploading
                      </>
                    ) : (
                      <>
                        <UploadIcon />
                        Upload a screenshot
                      </>
                    )}
                  </Button>
                </div>
              )}

              <input
                ref={fileInput}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.avif"
                onChange={chooseFile}
                className="sr-only"
              />
            </div>
            <FieldError message={errors.media} />
          </div>

          {/* The case study, which most projects will not have. Folded away so
              the required fields read as the real length of the form. */}
          <details className="rounded-xl border border-border/70 px-4 py-3">
            <summary className="cursor-pointer font-mono text-[0.625rem] tracking-[0.16em] uppercase text-muted-foreground">
              Written case study (optional)
            </summary>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="role">Your role</Label>
                  <Input
                    id="role"
                    value={project.role}
                    onChange={(event) => set("role", event.target.value)}
                    className="h-10"
                    placeholder="Sole engineer"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Input
                    id="timeline"
                    value={project.timeline}
                    onChange={(event) => set("timeline", event.target.value)}
                    className="h-10"
                    placeholder="2025, three months"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="results">Results</Label>
                <Textarea
                  id="results"
                  value={project.results.join("\n")}
                  onChange={(event) => set("results", event.target.value.split("\n"))}
                  rows={3}
                  className="resize-y"
                  placeholder={"One per line.\nOnly things you can point at."}
                />
              </div>

              {project.body.map((section, index) => (
                <div key={index} className="rounded-lg border border-border/70 p-3">
                  <div className="flex items-start gap-2">
                    <Input
                      value={section.heading}
                      onChange={(event) =>
                        set(
                          "body",
                          project.body.map((s, i) =>
                            i === index ? { ...s, heading: event.target.value } : s
                          )
                        )
                      }
                      placeholder="Section heading"
                      className="h-9"
                      aria-label={`Heading for section ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove section ${index + 1}`}
                      onClick={() =>
                        set("body", project.body.filter((_, i) => i !== index))
                      }
                    >
                      <XIcon />
                    </Button>
                  </div>
                  <Textarea
                    value={section.paragraphs.join("\n\n")}
                    onChange={(event) =>
                      set(
                        "body",
                        project.body.map((s, i) =>
                          i === index
                            ? { ...s, paragraphs: event.target.value.split("\n\n") }
                            : s
                        )
                      )
                    }
                    rows={4}
                    className="mt-2 resize-y"
                    placeholder="Paragraphs, separated by a blank line."
                    aria-label={`Body of section ${index + 1}`}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => set("body", [...project.body, { heading: "", paragraphs: [""] }])}
              >
                <PlusIcon />
                Add a section
              </Button>
              <FieldError message={errors.body} />
            </div>
          </details>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card/40 px-4 py-4">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
              Visibility
            </p>
            <p
              className={cn(
                "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                project.published
                  ? "bg-brand-teal/15 text-brand-teal"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              {project.published ? "On the site" : "Draft"}
            </p>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={project.featured}
                onChange={(event) => set("featured", event.target.checked)}
                className="size-4 rounded border-input"
              />
              <StarIcon className="size-3.5 text-amber-400" />
              Show on the homepage
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">URL</Label>
            <div className="flex items-center gap-1 rounded-lg border border-input px-2">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">/work/</span>
              <Input
                id="slug"
                value={project.slug}
                onChange={(event) => {
                  setSlugFollowsName(false);
                  set("slug", event.target.value);
                }}
                className="h-9 border-0 px-0 font-mono text-xs focus-visible:ring-0"
              />
            </div>
            {projectId ? (
              <p className="text-xs text-muted-foreground">
                Changing this breaks existing links.
              </p>
            ) : null}
            <FieldError message={errors.slug} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Filter buckets</Label>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set([...SUGGESTED_GROUPS, ...project.groups])].map((group) => {
                const active = project.groups.includes(group);
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggleGroup(group)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/[0.06] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {group}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.groups} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tech</Label>
            <Input
              id="tags"
              value={project.tags.join(", ")}
              onChange={(event) =>
                set("tags", event.target.value.split(",").map((t) => t.trimStart()))
              }
              placeholder="Next.js, Solidity, Postgres"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Comma separated, up to {PROJECT_LIMITS.maxTags}.
            </p>
            <FieldError message={errors.tags} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={project.status}
              onChange={(event) =>
                set("status", event.target.value as ProjectInput["status"])
              }
              className={selectClass}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              value={project.liveUrl}
              onChange={(event) => set("liveUrl", event.target.value)}
              placeholder="metapilot.app"
              className="h-10"
            />
            <FieldError message={errors.liveUrl} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repoUrl">Repository</Label>
            <Input
              id="repoUrl"
              value={project.repoUrl}
              onChange={(event) => set("repoUrl", event.target.value)}
              placeholder="github.com/you/thing"
              className="h-10"
            />
            <FieldError message={errors.repoUrl} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preview">Placeholder style</Label>
            <select
              id="preview"
              value={project.preview}
              onChange={(event) =>
                set("preview", event.target.value as ProjectInput["preview"])
              }
              className={selectClass}
            >
              {PROJECT_PREVIEWS.map((preview) => (
                <option key={preview} value={preview}>
                  {preview}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              The generated graphic shown when there is no screenshot.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { ProjectEditor };
