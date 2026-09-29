"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronUpIcon,
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
import { ImageDrop } from "@/components/admin/image-drop";
import { uploadAttachment, UploadError } from "@/lib/storage/upload-client";
import { saveProject } from "@/app/admin/projects/actions";
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
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

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

  /* Takes Files rather than input events, so the picker, a drop and a paste
     all reach the same upload. */
  async function uploadHero(file: File) {
    setErrors((current) => ({ ...current, media: undefined }));
    setUploading(true);

    /* The browser reports the type; the route decides the Cloudinary namespace
       from it and signs accordingly, so this only needs to record which it
       was. */
    const isVideo = file.type.startsWith("video/");

    try {
      const uploaded = await uploadAttachment(file, {
        endpoint: "/api/admin/work/upload",
      });
      set("media", {
        type: isVideo ? "video" : "image",
        publicId: uploaded.publicId,
        src: "",
        /* Kept if the project already had one, because re-uploading a better
           screenshot of the same thing should not wipe its description. */
        alt: project.media?.alt ?? "",
        /* Cloudinary generates the poster from the clip's first frame, so
           nothing is uploaded for it. */
        poster: "",
      });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        media:
          error instanceof UploadError
            ? error.message
            : "That file could not be uploaded.",
      }));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function uploadSectionImage(index: number, file: File) {
    try {
      const uploaded = await uploadAttachment(file, { endpoint: "/api/admin/work/upload" });
      set(
        "body",
        project.body.map((section, i) =>
          i === index
            ? {
                ...section,
                image: { publicId: uploaded.publicId, src: "", alt: "", caption: "" },
              }
            : section
        )
      );
    } catch {
      /* Reported against the body rather than silently dropped, since the
         upload is the visible act. */
      setErrors((current) => ({ ...current, body: "That image could not be uploaded." }));
    }
  }

  async function addToGallery(files: File[]) {
    if (files.length === 0) return;

    setErrors((current) => ({ ...current, gallery: undefined }));
    setUploadingGallery(true);

    try {
      /* Sequential rather than parallel. Cloudinary rate-limits a free account
         and several large screenshots at once is exactly what trips it; the
         wait is a few seconds either way. */
      const added = [] as typeof project.gallery;
      for (const file of files.slice(0, PROJECT_LIMITS.maxGallery)) {
        const uploaded = await uploadAttachment(file, {
          endpoint: "/api/admin/work/upload",
        });
        added.push({ publicId: uploaded.publicId, src: "", alt: "", caption: "" });
      }
      set("gallery", [...project.gallery, ...added].slice(0, PROJECT_LIMITS.maxGallery));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        gallery:
          error instanceof UploadError
            ? error.message
            : "Those images could not be uploaded.",
      }));
    } finally {
      setUploadingGallery(false);
      if (galleryInput.current) galleryInput.current.value = "";
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

      if (!projectId) router.replace(`/admin/projects/${result.id}?saved=1`);
    });
  }

  /*
    Delivery URLs built here rather than on the server, so a newly uploaded
    file previews before the project has been saved.

    `dpr_2.0` on each, because these are shown on the screen somebody is
    editing on, and a 640px source in a 600px box is soft on every display
    made in the last decade. The hero preview is `c_limit` rather than
    `c_fill` for the same reason the public one is: it should show the
    screenshot, not a crop of it.

    Video comes from its own namespace and its poster is generated from the
    clip, which is why this is not one template with the type swapped in.
  */
  const isVideo = project.media?.type === "video";

  const previewSrc = project.media?.publicId
    ? isVideo
      ? `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${project.media.publicId}`
      : `https://res.cloudinary.com/${cloudName}/image/upload/w_640,c_limit,f_auto,q_auto,dpr_2.0/${project.media.publicId}`
    : (project.media?.src ?? "");

  const galleryUrl = (item: { publicId: string; src: string }) =>
    item.publicId
      ? `https://res.cloudinary.com/${cloudName}/image/upload/w_320,h_200,c_fill,f_auto,q_auto,dpr_2.0/${item.publicId}`
      : item.src;

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/projects" />}>
          <ArrowLeftIcon />
          All projects
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
              render={<Link href={`/projects/${project.slug}`} target="_blank" />}
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

            <ImageDrop
              className="rounded-xl border border-border bg-card/40 p-4"
              disabled={uploading}
              onFile={(file) => void uploadHero(file)}
              hint="Drop a file here, or paste a screenshot"
            >
              {previewSrc ? (
                <div className="space-y-3">
                  {isVideo ? (
                    <video
                      src={previewSrc}
                      controls
                      muted
                      playsInline
                      className="aspect-[16/10] w-full rounded-lg border border-border bg-black object-cover"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewSrc}
                      alt=""
                      className="aspect-[16/10] w-full rounded-lg border border-border object-cover"
                    />
                  )}
                  <Input
                    value={project.media?.alt ?? ""}
                    onChange={(event) =>
                      set("media", {
                        type: project.media?.type ?? "image",
                        publicId: project.media?.publicId ?? "",
                        src: project.media?.src ?? "",
                        alt: event.target.value,
                        poster: project.media?.poster ?? "",
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
                    A screenshot, or a short screen recording. Without one, the
                    card shows a generated placeholder.
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
                        Upload an image or video
                      </>
                    )}
                  </Button>
                </div>
              )}

              <input
                ref={fileInput}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.avif,.mp4,.webm,.mov"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadHero(file);
                }}
                className="sr-only"
              />
            </ImageDrop>
            <FieldError message={errors.media} />
          </div>

          {/*
            More screenshots, shown on the project page below the hero.

            Separate from the hero image on purpose: the card shows exactly one,
            and a gallery that fed the card would make the grid's geometry
            depend on how many screenshots somebody happened to upload.
          */}
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
              <Label>Gallery</Label>
              <span className="font-mono text-xs text-muted-foreground">
                {project.gallery.length}/{PROJECT_LIMITS.maxGallery}
              </span>
            </div>

            <ImageDrop
              className="rounded-xl border border-border bg-card/40 p-4"
              disabled={uploadingGallery || project.gallery.length >= PROJECT_LIMITS.maxGallery}
              /* Appended, not swapped: a gallery is a set, so a pasted
                 screenshot joins it rather than replacing what is there. */
              onFile={(file) => void addToGallery([file])}
              hint="Drop files here, or paste a screenshot"
            >
              {project.gallery.length > 0 ? (
                <ul className="space-y-3">
                  {project.gallery.map((item, index) => (
                    <li key={item.publicId || item.src} className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={galleryUrl(item)}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded border border-border object-cover"
                      />

                      <div className="min-w-0 flex-1 space-y-2">
                        <Input
                          value={item.alt}
                          onChange={(event) =>
                            set(
                              "gallery",
                              project.gallery.map((g, i) =>
                                i === index ? { ...g, alt: event.target.value } : g
                              )
                            )
                          }
                          placeholder="What it shows"
                          className="h-8 text-xs"
                          aria-label={`Description of screenshot ${index + 1}`}
                        />
                        <Input
                          value={item.caption}
                          onChange={(event) =>
                            set(
                              "gallery",
                              project.gallery.map((g, i) =>
                                i === index ? { ...g, caption: event.target.value } : g
                              )
                            )
                          }
                          placeholder="Caption (optional)"
                          className="h-8 text-xs"
                          aria-label={`Caption for screenshot ${index + 1}`}
                        />
                      </div>

                      <div className="flex shrink-0 flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          disabled={index === 0}
                          aria-label={`Move screenshot ${index + 1} earlier`}
                          onClick={() => {
                            const next = [...project.gallery];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            set("gallery", next);
                          }}
                        >
                          <ChevronUpIcon />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Remove screenshot ${index + 1}`}
                          onClick={() =>
                            set("gallery", project.gallery.filter((_, i) => i !== index))
                          }
                        >
                          <XIcon />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-xs text-muted-foreground">
                  Nothing here yet. The project page shows these below the hero.
                </p>
              )}

              {project.gallery.length < PROJECT_LIMITS.maxGallery ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingGallery}
                  className="mt-3 w-full"
                  onClick={() => galleryInput.current?.click()}
                >
                  {uploadingGallery ? (
                    <>
                      <LoaderCircleIcon className="animate-spin" />
                      Uploading
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Add screenshots
                    </>
                  )}
                </Button>
              ) : null}

              <input
                ref={galleryInput}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.avif"
                multiple
                onChange={(event) => void addToGallery(Array.from(event.target.files ?? []))}
                className="sr-only"
              />
            </ImageDrop>
            <FieldError message={errors.gallery} />
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

                  {/* A real image per section. The page used to draw a dashed
                      placeholder box here, which is fine while no case study
                      exists and looks unfinished the moment one does. */}
                  {section.image?.publicId ? (
                    <div className="mt-2 flex gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={galleryUrl({ publicId: section.image.publicId, src: "" })}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded border border-border object-cover"
                      />
                      <Input
                        value={section.image.alt}
                        onChange={(event) =>
                          set(
                            "body",
                            project.body.map((s, i) =>
                              i === index && s.image
                                ? { ...s, image: { ...s.image, alt: event.target.value } }
                                : s
                            )
                          )
                        }
                        placeholder="What it shows"
                        className="h-8 text-xs"
                        aria-label={`Description of the image in section ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove the image from section ${index + 1}`}
                        onClick={() =>
                          set(
                            "body",
                            project.body.map((s, i) =>
                              i === index ? { ...s, image: null } : s
                            )
                          )
                        }
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ) : (
                    <ImageDrop
                      className="mt-2"
                      onFile={(file) => void uploadSectionImage(index, file)}
                      hint="Drop an image here, or paste one"
                    >
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                      <ImageIcon className="size-3.5" />
                      Add an image to this section
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp,.avif"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadSectionImage(index, file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    </ImageDrop>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => set("body", [...project.body, { heading: "", paragraphs: [""], image: null }])}
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
            <Label htmlFor="client">Built for</Label>
            <Input
              id="client"
              value={project.client}
              onChange={(event) => set("client", event.target.value)}
              placeholder="Acme, or leave empty"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for your own projects. Do not name a client who has
              not agreed to it.
            </p>
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
