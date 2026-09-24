"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ImageIcon,
  PlusIcon,
  QuoteIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SectionInput } from "@/lib/content/post-schema";

/**
 * The body editor: a list of sections, each a heading plus paragraphs.
 *
 * Structured fields rather than one markdown textarea. The article template
 * renders headings, paragraphs, a pulled-aside sidenote and an optional media
 * frame, and nothing else, so a markdown editor would mean shipping a parser to
 * support syntax that has nowhere to render. This also means a paragraph is a
 * string in a database, which cannot carry a script tag into the page.
 */
function SectionEditor({
  sections,
  onChange,
  error,
}: {
  sections: SectionInput[];
  onChange: (next: SectionInput[]) => void;
  error?: string;
}) {
  function update(index: number, patch: Partial<SectionInput>) {
    onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  function addSection() {
    onChange([...sections, { heading: "", paragraphs: [""], sidenote: "", media: null }]);
  }

  function removeSection(index: number) {
    onChange(sections.filter((_, i) => i !== index));
  }

  /**
   * Moves a section by swapping it with its neighbour.
   *
   * Order is the array's order, so a section's position is not a field anybody
   * has to maintain. Drag and drop was the alternative and needs a pointer;
   * buttons work from the keyboard and on a phone.
   */
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function updateParagraph(sectionIndex: number, paragraphIndex: number, value: string) {
    const section = sections[sectionIndex];
    update(sectionIndex, {
      paragraphs: section.paragraphs.map((p, i) => (i === paragraphIndex ? value : p)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Label>Body</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            One section per idea. The heading becomes an anchor in the article.
          </p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {sections.length} {sections.length === 1 ? "section" : "sections"}
        </span>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {sections.map((section, index) => (
        <fieldset
          key={index}
          className="rounded-xl border border-border bg-card/40 px-4 py-4"
        >
          <legend className="px-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
            Section {String(index + 1).padStart(2, "0")}
          </legend>

          <div className="flex items-start gap-2">
            <Input
              value={section.heading}
              onChange={(event) => update(index, { heading: event.target.value })}
              placeholder="What this section covers"
              className="h-10"
              aria-label={`Heading for section ${index + 1}`}
            />

            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                aria-label={`Move section ${index + 1} up`}
              >
                <ChevronUpIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === sections.length - 1}
                onClick={() => move(index, 1)}
                aria-label={`Move section ${index + 1} down`}
              >
                <ChevronDownIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                /* The last section cannot be removed: an empty body would leave
                   the editor with no textarea and no obvious way back. */
                disabled={sections.length === 1}
                onClick={() => removeSection(index)}
                aria-label={`Delete section ${index + 1}`}
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <div key={paragraphIndex} className="flex items-start gap-2">
                <Textarea
                  value={paragraph}
                  onChange={(event) =>
                    updateParagraph(index, paragraphIndex, event.target.value)
                  }
                  rows={3}
                  placeholder="A paragraph."
                  className="resize-y"
                  aria-label={`Paragraph ${paragraphIndex + 1} of section ${index + 1}`}
                />
                {section.paragraphs.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      update(index, {
                        paragraphs: section.paragraphs.filter(
                          (_, i) => i !== paragraphIndex
                        ),
                      })
                    }
                    aria-label={`Remove paragraph ${paragraphIndex + 1}`}
                  >
                    <XIcon />
                  </Button>
                ) : null}
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => update(index, { paragraphs: [...section.paragraphs, ""] })}
            >
              <PlusIcon />
              Paragraph
            </Button>
          </div>

          <div className="mt-4 space-y-3 border-t border-border/70 pt-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={`sidenote-${index}`}
                className="text-xs text-muted-foreground"
              >
                <QuoteIcon className="size-3" />
                Sidenote
                <span className="font-normal">(optional)</span>
              </Label>
              <Textarea
                id={`sidenote-${index}`}
                value={section.sidenote}
                onChange={(event) => update(index, { sidenote: event.target.value })}
                rows={2}
                placeholder="The everyday comparison, pulled out beside the text."
                className="resize-y"
              />
            </div>

            {section.media ? (
              <div className="rounded-lg border border-border bg-background/50 px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon aria-hidden className="size-3.5 text-muted-foreground" />
                    <select
                      value={section.media.type}
                      onChange={(event) =>
                        update(index, {
                          media: {
                            ...section.media!,
                            type: event.target.value as "image" | "video",
                          },
                        })
                      }
                      aria-label={`Media type for section ${index + 1}`}
                      className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => update(index, { media: null })}
                    aria-label={`Remove the media frame from section ${index + 1}`}
                  >
                    <XIcon />
                  </Button>
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {section.media.type === "image" ? (
                    <Input
                      value={section.media.alt}
                      onChange={(event) =>
                        update(index, { media: { ...section.media!, alt: event.target.value } })
                      }
                      placeholder="Alt text"
                      className="h-9 text-xs"
                      aria-label={`Alt text for section ${index + 1}`}
                    />
                  ) : null}
                  <Input
                    value={section.media.caption}
                    onChange={(event) =>
                      update(index, {
                        media: { ...section.media!, caption: event.target.value },
                      })
                    }
                    placeholder="Caption"
                    className={cn("h-9 text-xs", section.media.type === "video" && "sm:col-span-2")}
                    aria-label={`Caption for section ${index + 1}`}
                  />
                </div>

                {/* Said plainly, because the frame is a placeholder rather than
                    an upload: the article template draws a dashed box, and
                    pretending otherwise would be a surprise at publish time. */}
                <p className="mt-2 text-[0.6875rem] text-muted-foreground">
                  This renders a placeholder frame in the article. Image uploads
                  for post bodies are not wired up yet.
                </p>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  update(index, { media: { type: "image", alt: "", caption: "" } })
                }
              >
                <ImageIcon />
                Media frame
              </Button>
            )}
          </div>
        </fieldset>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addSection}>
        <PlusIcon />
        Add a section
      </Button>
    </div>
  );
}

export { SectionEditor };
