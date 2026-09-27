"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * A list of plain strings: tags, a stack, the paragraphs of the About story.
 *
 * Two shapes from one component. Short entries are chips with an add box, which
 * is how anybody expects to type a list of technologies. Long ones are stacked
 * textareas, because a paragraph in a chip is unreadable and a paragraph typed
 * into a one-line input is worse.
 */
function StringList({
  value,
  onChange,
  label,
  placeholder,
  long = false,
  max,
  addLabel,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  label: string;
  placeholder?: string;
  long?: boolean;
  max?: number;
  addLabel?: string;
}) {
  const [draft, setDraft] = useState("");
  const full = max !== undefined && value.length >= max;

  function add() {
    const entry = draft.trim();
    if (!entry || full) return;
    /* Silently ignored rather than warned about: adding a tag that is already
       there is a slip, not a mistake worth a message. */
    if (value.includes(entry)) {
      setDraft("");
      return;
    }
    onChange([...value, entry]);
    setDraft("");
  }

  if (long) {
    return (
      <div className="space-y-2">
        {value.map((entry, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={entry}
              onChange={(event) =>
                onChange(value.map((v, i) => (i === index ? event.target.value : v)))
              }
              rows={4}
              className="resize-y"
              aria-label={`${label} ${index + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            >
              <XIcon />
            </Button>
          </div>
        ))}
        {!full ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...value, ""])}>
            <PlusIcon />
            {addLabel ?? "Add"}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((entry, index) => (
            <li key={`${entry}-${index}`}>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
                {entry}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  aria-label={`Remove ${entry}`}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {!full ? (
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              /*
                Enter adds the entry rather than submitting the form. Without
                this, typing a tag and pressing Enter saves the whole page,
                which is the opposite of what the keystroke means here.
              */
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            placeholder={placeholder ?? "Add one and press Enter"}
            className={cn("h-9 text-xs")}
            aria-label={`Add to ${label.toLowerCase()}`}
          />
          <Button type="button" variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
            <PlusIcon />
            Add
          </Button>
        </div>
      ) : (
        <p className="text-[0.6875rem] text-muted-foreground">
          That is the maximum of {max}.
        </p>
      )}
    </div>
  );
}

export { StringList };
