"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  EyeIcon,
  LoaderCircleIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconPicker } from "@/components/admin/icon-picker";
import { SectionEditor } from "@/components/admin/section-editor";
import { savePost } from "@/app/admin/posts/actions";
import {
  POST_LIMITS,
  slugify,
  validatePost,
  type PostFieldErrors,
  type PostInput,
} from "@/lib/content/post-schema";

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

/**
 * The post editor, for both a new post and an existing one.
 *
 * One component rather than two pages of near-identical form, with `postId`
 * deciding whether saving creates or updates. The difference between the two is
 * one argument to the action.
 */
function PostEditor({
  initial,
  postId,
}: {
  initial: PostInput;
  /** Absent for a new post. */
  postId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [post, setPost] = useState<PostInput>(initial);
  const [errors, setErrors] = useState<PostFieldErrors>({});
  /*
    Seeded from the URL.

    Creating a post replaces /admin/posts/new with /admin/posts/<id>, and that is
    a different route, so this component unmounts and a fresh one mounts in its
    place. A `saved` flag held only in state is lost in that gap, which left the
    first save of a new post with no confirmation at all: the URL changed and
    nothing said it had worked. The flag travels in the URL so it survives the
    remount, and is dropped as soon as anything is edited.
  */
  const [saved, setSaved] = useState(searchParams.get("saved") === "1");
  const [pending, startTransition] = useTransition();

  /*
    Whether the slug follows the title.

    It does for a new post, and stops the moment the slug is edited by hand. For
    an existing post it never does: a published URL that silently changed when a
    typo in the title was fixed would break every inbound link to it.
  */
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(!postId);

  function set<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setPost((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function submit(status: PostInput["status"]) {
    const candidate = { ...post, status };

    /* The client check only saves a round trip; the action revalidates
       everything itself. */
    const found = validatePost(candidate);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await savePost(candidate, postId);

      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      setPost(candidate);
      setSaved(true);

      if (!postId) {
        /* A new post becomes an existing one, so the URL has to change or the
           next save would create a second copy. `saved=1` carries the
           confirmation across the remount that comes with it. */
        router.replace(`/admin/posts/${result.id}?saved=1`);
      }
    });
  }

  const isExplainer = post.type === "explainer";

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/posts" />}
        >
          <ArrowLeftIcon />
          All writing
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {saved ? (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-xs text-brand-teal"
            >
              <CheckIcon className="size-3.5" />
              Saved
            </span>
          ) : null}

          {postId && post.status === "published" ? (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/blog/${post.slug}`} target="_blank" />}
            >
              <ExternalLinkIcon />
              View
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => submit("draft")}
          >
            {pending ? <LoaderCircleIcon className="animate-spin" /> : <SaveIcon />}
            Save draft
          </Button>

          <Button size="sm" disabled={pending} onClick={() => submit("published")}>
            <EyeIcon />
            {post.status === "published" ? "Update live post" : "Publish"}
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

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={post.title}
              onChange={(event) => {
                const title = event.target.value;
                setPost((current) => ({
                  ...current,
                  title,
                  slug: slugFollowsTitle ? slugify(title) : current.slug,
                }));
                setSaved(false);
              }}
              className="h-11 font-heading text-base"
              placeholder={
                isExplainer ? "A sticky note on your monitor" : "What I look for in a review"
              }
            />
            <FieldError message={errors.title} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hook">Hook</Label>
            <Textarea
              id="hook"
              value={post.hook}
              onChange={(event) => set("hook", event.target.value)}
              rows={2}
              maxLength={POST_LIMITS.hookMax}
              className="resize-y"
              placeholder="The one sentence that makes somebody open it."
            />
            <FieldError message={errors.hook} />
          </div>

          {isExplainer ? (
            /*
              The pairing that makes an explainer one: the concept on the left,
              the everyday thing it works like on the right. The index page
              tickers these against each other, which is why both are required.
            */
            <div className="grid gap-4 rounded-xl border border-border bg-card/40 px-4 py-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  The concept
                </Label>
                <Input
                  value={post.concept?.label ?? ""}
                  onChange={(event) =>
                    set("concept", {
                      ...(post.concept ?? { caption: "", iconName: "ZapIcon" }),
                      label: event.target.value,
                    })
                  }
                  placeholder="Caching"
                  className="h-10"
                  aria-label="Concept name"
                />
                <Input
                  value={post.concept?.caption ?? ""}
                  onChange={(event) =>
                    set("concept", {
                      ...(post.concept ?? { label: "", iconName: "ZapIcon" }),
                      caption: event.target.value,
                    })
                  }
                  placeholder="Store it once, reuse it fast"
                  className="h-9 text-xs"
                  aria-label="Concept caption"
                />
                <IconPicker
                  label="Concept"
                  value={post.concept?.iconName ?? "ZapIcon"}
                  onChange={(iconName) =>
                    set("concept", {
                      ...(post.concept ?? { label: "", caption: "" }),
                      iconName,
                    })
                  }
                />
                <FieldError message={errors.concept} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  The everyday thing
                </Label>
                <Input
                  value={post.analogy?.label ?? ""}
                  onChange={(event) =>
                    set("analogy", {
                      ...(post.analogy ?? { caption: "", iconName: "StickyNoteIcon" }),
                      label: event.target.value,
                    })
                  }
                  placeholder="A sticky note on your monitor"
                  className="h-10"
                  aria-label="Analogy name"
                />
                <Input
                  value={post.analogy?.caption ?? ""}
                  onChange={(event) =>
                    set("analogy", {
                      ...(post.analogy ?? { label: "", iconName: "StickyNoteIcon" }),
                      caption: event.target.value,
                    })
                  }
                  placeholder="Quick answer, no digging required"
                  className="h-9 text-xs"
                  aria-label="Analogy caption"
                />
                <IconPicker
                  label="Analogy"
                  value={post.analogy?.iconName ?? "StickyNoteIcon"}
                  onChange={(iconName) =>
                    set("analogy", {
                      ...(post.analogy ?? { label: "", caption: "" }),
                      iconName,
                    })
                  }
                />
                <FieldError message={errors.analogy} />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 rounded-xl border border-border bg-card/40 px-4 py-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={post.topic}
                  onChange={(event) => set("topic", event.target.value)}
                  placeholder="Code review"
                  className="h-10"
                />
                <FieldError message={errors.topic} />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <IconPicker
                  label="Article"
                  value={post.iconName || "PenLineIcon"}
                  onChange={(iconName) => set("iconName", iconName)}
                />
                <FieldError message={errors.iconName} />
              </div>
            </div>
          )}

          <SectionEditor
            sections={post.body}
            onChange={(body) => set("body", body)}
            error={errors.body}
          />
        </div>

        {/* The metadata rail. Sticky, because publishing is reached from the
            bottom of a long body and scrolling back up to find it is a chore. */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card/40 px-4 py-4">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
              Status
            </p>
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                post.status === "published"
                  ? "bg-brand-teal/15 text-brand-teal"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              {post.status === "published" ? "Live" : "Draft"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">URL</Label>
            <div className="flex items-center gap-1 rounded-lg border border-input px-2">
              <span className="shrink-0 font-mono text-xs text-muted-foreground">/blog/</span>
              <Input
                id="slug"
                value={post.slug}
                onChange={(event) => {
                  setSlugFollowsTitle(false);
                  set("slug", event.target.value);
                }}
                className="h-9 border-0 px-0 font-mono text-xs focus-visible:ring-0"
              />
            </div>
            {postId ? (
              <p className="text-xs text-muted-foreground">
                Changing this breaks existing links to the post.
              </p>
            ) : null}
            <FieldError message={errors.slug} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Kind</Label>
            <select
              id="type"
              value={post.type}
              onChange={(event) => {
                const type = event.target.value as PostInput["type"];
                setPost((current) => ({
                  ...current,
                  type,
                  /* Seeded on the switch so an explainer never saves with null
                     terms, which the validator would reject with the fields not
                     yet on screen. */
                  concept:
                    type === "explainer"
                      ? (current.concept ?? { label: "", caption: "", iconName: "ZapIcon" })
                      : null,
                  analogy:
                    type === "explainer"
                      ? (current.analogy ?? {
                          label: "",
                          caption: "",
                          iconName: "StickyNoteIcon",
                        })
                      : null,
                  iconName:
                    type === "article" ? current.iconName || "PenLineIcon" : current.iconName,
                }));
                setSaved(false);
              }}
              className={selectClass}
            >
              <option value="explainer">Explainer</option>
              <option value="article">Article</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="readTime">Read time</Label>
            <Input
              id="readTime"
              value={post.readTime}
              onChange={(event) => set("readTime", event.target.value)}
              placeholder="Worked out on save"
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="publishedAt">Published</Label>
            <Input
              id="publishedAt"
              type="date"
              value={post.publishedAt ? post.publishedAt.slice(0, 10) : ""}
              onChange={(event) => set("publishedAt", event.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to stamp it when you publish.
            </p>
            <FieldError message={errors.publishedAt} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              /* One comma-separated field rather than a chip input. Tags are
                 typed once and rarely edited; a tokenising widget here would be
                 more code than the feature is worth. */
              value={post.tags.join(", ")}
              onChange={(event) =>
                set(
                  "tags",
                  event.target.value.split(",").map((tag) => tag.trimStart())
                )
              }
              placeholder="Performance, Databases"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Comma separated, up to {POST_LIMITS.maxTags}.
            </p>
            <FieldError message={errors.tags} />
          </div>

          {post.tags.filter((tag) => tag.trim()).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {post.tags
                .filter((tag) => tag.trim())
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag.trim()}
                    <button
                      type="button"
                      onClick={() => set("tags", post.tags.filter((t) => t !== tag))}
                      aria-label={`Remove the ${tag.trim()} tag`}
                      className="transition-colors hover:text-foreground"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </span>
                ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export { PostEditor };
