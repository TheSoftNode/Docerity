"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, PlusIcon, RotateCcwIcon, SaveIcon, Trash2Icon } from "lucide-react";

import { resetBriefsAction, saveBriefsAction } from "@/app/admin/academy/actions";
import type { ProjectBrief } from "@/lib/academy/briefs";
import { COURSE_LEVELS } from "@/lib/academy/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const field = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const select = "h-10 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground";
let counter = 0;

/** The project pool's briefs: open one in place to edit; nothing is stored until "Save projects". */
export function BriefsEditor({ initial }: { initial: ProjectBrief[] }) {
  const router = useRouter();
  const [briefs, setBriefs] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const update = (next: ProjectBrief[]) => {
    setBriefs(next);
    setDirty(true);
    setMessage(null);
  };
  const set = (id: string, patch: Partial<ProjectBrief>) => update(briefs.map((brief) => (brief.id === id ? { ...brief, ...patch } : brief)));
  const move = (index: number, by: number) => {
    const to = index + by;
    if (to < 0 || to >= briefs.length) return;
    const next = [...briefs];
    [next[index], next[to]] = [next[to], next[index]];
    update(next);
  };

  return (
    <div className="grid gap-4 pb-6">
      <ul className="overflow-hidden rounded-[24px] border border-border bg-card">
        {briefs.map((brief, index) => {
          const isOpen = open === brief.id;
          return (
            <li key={brief.id} className="border-t border-border first:border-t-0">
              <div className="flex items-center gap-2 px-4 py-2">
                <button type="button" onClick={() => setOpen(isOpen ? null : brief.id)} aria-expanded={isOpen} className="flex min-h-11 flex-1 items-center gap-3 text-left">
                  <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">{brief.title || "Untitled project"}</span>
                  <span className="shrink-0 text-[12px] text-muted-foreground">{brief.level}</span>
                </button>
                <Button type="button" variant="ghost" size="sm" aria-label="Move up" onClick={() => move(index, -1)}>
                  <ArrowUpIcon />
                </Button>
                <Button type="button" variant="ghost" size="sm" aria-label="Move down" onClick={() => move(index, 1)}>
                  <ArrowDownIcon />
                </Button>
                <Button type="button" variant="ghost" size="sm" aria-label="Remove project" onClick={() => update(briefs.filter((item) => item.id !== brief.id))}>
                  <Trash2Icon />
                </Button>
              </div>
              {isOpen ? (
                <div className="grid gap-4 border-t border-border p-4">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px_110px]">
                    <label className={field}>
                      Title
                      <Input value={brief.title} onChange={(event) => set(brief.id, { title: event.target.value })} />
                    </label>
                    <label className={field}>
                      Level
                      <select className={select} value={brief.level} onChange={(event) => set(brief.id, { level: event.target.value as ProjectBrief["level"] })}>
                        {COURSE_LEVELS.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </label>
                    <label className={field}>
                      Hours
                      <Input type="number" min={1} value={brief.hours} onChange={(event) => set(brief.id, { hours: Number(event.target.value) })} />
                    </label>
                  </div>
                  <label className={field}>
                    Stack (comma separated)
                    <Input value={brief.stack.join(", ")} onChange={(event) => set(brief.id, { stack: event.target.value.split(",").map((item) => item.trim()) })} />
                  </label>
                  <label className={field}>
                    One-line summary
                    <Input value={brief.summary} onChange={(event) => set(brief.id, { summary: event.target.value })} />
                  </label>
                  <label className={field}>
                    The brief
                    <Textarea value={brief.brief} onChange={(event) => set(brief.id, { brief: event.target.value })} rows={4} />
                  </label>
                  <label className={field}>
                    What must work (one per line)
                    <Textarea value={brief.requirements.join("\n")} onChange={(event) => set(brief.id, { requirements: event.target.value.split("\n") })} rows={5} />
                  </label>
                  <label className={field}>
                    If you want to go further (one per line)
                    <Textarea value={brief.stretch.join("\n")} onChange={(event) => set(brief.id, { stretch: event.target.value.split("\n") })} rows={3} />
                  </label>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        onClick={() => {
          const id = `new-project-${Date.now().toString(36)}-${counter++}`;
          update([...briefs, { id, title: "New project", level: "Beginner", stack: [], summary: "", brief: "", requirements: [], stretch: [], hours: 6 }]);
          setOpen(id);
        }}
      >
        <PlusIcon /> Project
      </Button>

      <div className="sticky bottom-4 z-30 rounded-full border border-border bg-background/95 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.6)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 py-2 pr-2 pl-5">
          <p role="status" className={cn("text-sm", message ? (message.ok ? "text-[#1d7a52]" : "text-destructive") : "text-muted-foreground")}>
            {message?.text ?? (dirty ? "Unsaved changes." : "No changes yet.")}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const result = await resetBriefsAction();
                  if (result.ok) {
                    setMessage({ ok: true, text: "Back to the original projects." });
                    router.refresh();
                  } else setMessage({ ok: false, text: result.message });
                })
              }
            >
              <RotateCcwIcon /> Reset to original
            </Button>
            <Button
              type="button"
              disabled={pending || !dirty}
              onClick={() =>
                start(async () => {
                  const result = await saveBriefsAction(briefs);
                  if (result.ok) {
                    setDirty(false);
                    setMessage({ ok: true, text: "Saved. The pool shows the changes now." });
                    router.refresh();
                  } else setMessage({ ok: false, text: result.message });
                })
              }
            >
              <SaveIcon /> Save projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
