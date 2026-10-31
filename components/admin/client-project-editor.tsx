"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, Loader2Icon, PlusIcon, SendIcon, Trash2Icon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { MILESTONE_STATUS_LABELS, PROJECT_STATUS_LABELS, UPDATE_KIND_LABELS, projectProgress } from "@/lib/account/rules";
import {
  archiveProjectAction,
  createProjectAction,
  deleteProjectAction,
  postUpdateAction,
  removeUpdateAction,
  saveMilestonesAction,
  saveProjectAction,
  type MilestoneFields,
  type ProjectFields,
} from "@/app/admin/client-projects/actions";
import { timeAgo } from "@/components/admin/admin-content";
import { ProgressBar } from "@/components/account/portal-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type EditorUpdate = { id: string; kind: string; title: string; body: string; link: string; by: string; createdAt: string };
export type EditorProject = ProjectFields & {
  id: string;
  archived: boolean;
  milestones: MilestoneFields[];
  updates: EditorUpdate[];
  account: "verified" | "unverified" | "none";
};

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15";

function Section({ title, description, children, action }: { title: string; description?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section aria-label={title} className="rounded-[20px] border border-border bg-card p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">{title}</h2>
          {description ? <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Note({ tone, children }: { tone: "ok" | "error"; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("text-sm font-medium", tone === "error" ? "text-destructive" : "text-brand-teal")}>
      {children}
    </p>
  );
}

const blankFields: ProjectFields = { title: "", clientEmail: "", clientName: "", summary: "", status: "planning", startDate: "", targetDate: "", nextStep: "", links: [] };

/**
 * Everything about one client project in one place: its details, the
 * milestones the client watches tick off, a form to post an update (and email
 * it), the updates so far, and archiving or deleting it. A new project shows
 * only the details; the rest opens once it is saved.
 */
function ClientProjectEditor({ project }: { project?: EditorProject }) {
  const router = useRouter();
  const isNew = !project;

  /* ── Details ── */
  const [fields, setFields] = useState<ProjectFields>(project ?? blankFields);
  const [detailsNote, setDetailsNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [savingDetails, startDetails] = useTransition();
  const set = (key: keyof ProjectFields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  const saveDetails = () =>
    startDetails(async () => {
      const result = isNew ? await createProjectAction(fields) : await saveProjectAction(project.id, fields);
      if (!result.ok) return setDetailsNote({ tone: "error", text: result.message });
      if (isNew && result.id) {
        router.push(`/admin/client-projects/${result.id}`);
        return;
      }
      setDetailsNote({ tone: "ok", text: "Saved" });
      router.refresh();
    });

  /* ── Milestones ── */
  const [milestones, setMilestones] = useState<MilestoneFields[]>(project?.milestones ?? []);
  const [milestoneNote, setMilestoneNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [savingMilestones, startMilestones] = useTransition();
  const editMilestone = (index: number, patch: Partial<MilestoneFields>) =>
    setMilestones((current) => current.map((milestone, at) => (at === index ? { ...milestone, ...patch } : milestone)));
  const moveMilestone = (index: number, by: number) =>
    setMilestones((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });
  const saveAllMilestones = () =>
    startMilestones(async () => {
      if (!project) return;
      const result = await saveMilestonesAction(project.id, milestones);
      setMilestoneNote(result.ok ? { tone: "ok", text: "Milestones saved" } : { tone: "error", text: result.message });
      if (result.ok) router.refresh();
    });

  /* ── Updates ── */
  const [update, setUpdate] = useState({ kind: "update", title: "", body: "", link: "", notify: true });
  const [updateNote, setUpdateNote] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [posting, startPosting] = useTransition();
  const post = () =>
    startPosting(async () => {
      if (!project) return;
      const result = await postUpdateAction(project.id, update);
      if (!result.ok) return setUpdateNote({ tone: "error", text: result.message });
      setUpdate({ kind: "update", title: "", body: "", link: "", notify: update.notify });
      setUpdateNote({ tone: "ok", text: update.notify ? (result.emailed ? "Posted and emailed to the client" : "Posted. The email could not be sent.") : "Posted" });
      router.refresh();
    });

  const [busy, startBusy] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const progress = projectProgress(milestones, fields.status);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/client-projects" />}>
          <ArrowLeftIcon />
          All client projects
        </Button>
      </div>

      <header className="mt-5 pb-7">
        <p className="mb-2 text-sm font-medium text-primary">{isNew ? "New client project" : fields.clientName || fields.clientEmail}</p>
        <h1 className="font-heading text-[clamp(30px,3.4vw,44px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-foreground">
          {fields.title || "Untitled project"}
        </h1>
        {project ? (
          <div className="mt-5 max-w-md">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold text-foreground">{progress}% complete</span>
              <span className="text-muted-foreground">{PROJECT_STATUS_LABELS[fields.status as keyof typeof PROJECT_STATUS_LABELS]}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={progress} label={`${progress}% complete`} />
            </div>
          </div>
        ) : null}
      </header>

      {project && project.account !== "verified" ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {project.account === "none" ? (
            <>
              <span className="font-medium text-foreground">{project.clientEmail} has no account yet.</span> Send them{" "}
              <span className="font-medium text-foreground">docerity.com/account/signup</span> and ask them to sign up with this address; the project
              appears as soon as they confirm it. Update emails still reach them meanwhile.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{project.clientEmail} has signed up but not confirmed the address yet.</span> The project
              appears for them once they click the link in their confirmation email.
            </>
          )}
        </p>
      ) : null}

      <div className={cn("grid items-start gap-4", project && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
        <div className="grid gap-4">
          <Section title="Details" description={isNew ? "The client finds this project by the email below, once they sign up with it." : undefined}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Project name</Label>
                <Input id="title" value={fields.title} onChange={set("title")} maxLength={140} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client&apos;s name</Label>
                <Input id="clientName" value={fields.clientName} onChange={set("clientName")} maxLength={120} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client&apos;s email</Label>
                <Input id="clientEmail" type="email" value={fields.clientEmail} onChange={set("clientEmail")} className="h-11" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="summary">What it is</Label>
                <Textarea id="summary" value={fields.summary} onChange={set("summary")} maxLength={1200} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" value={fields.status} onChange={set("status")} className={selectClass}>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextStep">Next step, for the client</Label>
                <Input id="nextStep" value={fields.nextStep} onChange={set("nextStep")} maxLength={300} placeholder="e.g. Review the first designs by Friday" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Started</Label>
                <Input id="startDate" type="date" value={fields.startDate} onChange={set("startDate")} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target date</Label>
                <Input id="targetDate" type="date" value={fields.targetDate} onChange={set("targetDate")} className="h-11" />
              </div>

              <fieldset className="space-y-2 sm:col-span-2">
                <legend className="text-sm font-medium text-foreground">Links the client can open</legend>
                {fields.links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      aria-label="Label"
                      placeholder="Staging site"
                      value={link.label}
                      onChange={(event) => setFields((current) => ({ ...current, links: current.links.map((item, at) => (at === index ? { ...item, label: event.target.value } : item)) }))}
                      className="h-11 max-w-[40%]"
                    />
                    <Input
                      aria-label="Address"
                      placeholder="https://"
                      value={link.url}
                      onChange={(event) => setFields((current) => ({ ...current, links: current.links.map((item, at) => (at === index ? { ...item, url: event.target.value } : item)) }))}
                      className="h-11"
                    />
                    <Button
                      variant="subtle-danger"
                      size="icon"
                      aria-label="Remove this link"
                      onClick={() => setFields((current) => ({ ...current, links: current.links.filter((_, at) => at !== index) }))}
                      className="mt-1"
                    >
                      <XIcon />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFields((current) => ({ ...current, links: [...current.links, { label: "", url: "" }] }))}>
                  <PlusIcon />
                  Add a link
                </Button>
              </fieldset>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={saveDetails} disabled={savingDetails}>
                {savingDetails ? <Loader2Icon className="animate-spin" /> : null}
                {isNew ? "Create project" : "Save details"}
              </Button>
              {detailsNote ? <Note tone={detailsNote.tone}>{detailsNote.text}</Note> : null}
            </div>
          </Section>

          {project ? (
            <Section title="Milestones" description="The client watches these tick off. In progress counts half, done counts in full.">
              {milestones.length === 0 ? <p className="mb-4 text-sm text-muted-foreground">No milestones yet. Add the stages of the work in order.</p> : null}
              <ol className="grid gap-3">
                {milestones.map((milestone, index) => (
                  <li key={milestone.id ?? `new-${index}`} className="rounded-2xl border border-border p-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-2.5 w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_150px_150px]">
                        <Input aria-label="Milestone" value={milestone.title} onChange={(event) => editMilestone(index, { title: event.target.value })} placeholder="Design approved" className="h-11" />
                        <select aria-label="Status" value={milestone.status} onChange={(event) => editMilestone(index, { status: event.target.value })} className={selectClass}>
                          {Object.entries(MILESTONE_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <Input aria-label="Due" type="date" value={milestone.due} onChange={(event) => editMilestone(index, { due: event.target.value })} className="h-11" />
                        <Input
                          aria-label="Detail"
                          value={milestone.detail}
                          onChange={(event) => editMilestone(index, { detail: event.target.value })}
                          placeholder="A line on what this stage covers (optional)"
                          className="h-11 sm:col-span-3"
                        />
                      </div>
                      <div className="flex shrink-0 flex-col">
                        <Button variant="subtle" size="icon-sm" aria-label="Move up" disabled={index === 0} onClick={() => moveMilestone(index, -1)}>
                          <ArrowUpIcon />
                        </Button>
                        <Button variant="subtle" size="icon-sm" aria-label="Move down" disabled={index === milestones.length - 1} onClick={() => moveMilestone(index, 1)}>
                          <ArrowDownIcon />
                        </Button>
                        <Button variant="subtle-danger" size="icon-sm" aria-label="Remove" onClick={() => setMilestones((current) => current.filter((_, at) => at !== index))}>
                          <Trash2Icon />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setMilestones((current) => [...current, { title: "", detail: "", status: "todo", due: "" }])}>
                  <PlusIcon />
                  Add a milestone
                </Button>
                <Button onClick={saveAllMilestones} disabled={savingMilestones}>
                  {savingMilestones ? <Loader2Icon className="animate-spin" /> : null}
                  Save milestones
                </Button>
                {milestoneNote ? <Note tone={milestoneNote.tone}>{milestoneNote.text}</Note> : null}
              </div>
            </Section>
          ) : null}
        </div>

        {project ? (
          <div className="grid gap-4">
            <Section title="Post an update" description="It goes to the top of the client's timeline, and by email if you leave that ticked.">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kind">Kind</Label>
                  <div id="kind" role="radiogroup" aria-label="Kind" className="flex flex-wrap gap-2">
                    {Object.entries(UPDATE_KIND_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={update.kind === value}
                        onClick={() => setUpdate((current) => ({ ...current, kind: value }))}
                        className={cn(
                          "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                          update.kind === value ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-title">Headline</Label>
                  <Input id="update-title" value={update.title} onChange={(event) => setUpdate((current) => ({ ...current, title: event.target.value }))} maxLength={160} placeholder="The checkout flow is ready to try" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-body">Details</Label>
                  <Textarea id="update-body" value={update.body} onChange={(event) => setUpdate((current) => ({ ...current, body: event.target.value }))} maxLength={6000} rows={5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-link">Link (optional)</Label>
                  <Input id="update-link" value={update.link} onChange={(event) => setUpdate((current) => ({ ...current, link: event.target.value }))} placeholder="https://" className="h-11" />
                </div>
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input type="checkbox" checked={update.notify} onChange={(event) => setUpdate((current) => ({ ...current, notify: event.target.checked }))} className="size-4 accent-[#1c3a8c]" />
                  Email it to {fields.clientEmail || "the client"}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={post} disabled={posting}>
                    {posting ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
                    Post update
                  </Button>
                  {updateNote ? <Note tone={updateNote.tone}>{updateNote.text}</Note> : null}
                </div>
              </div>
            </Section>

            <Section title="Updates so far">
              {project.updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet. The first one you post appears here and on the client&apos;s page.</p>
              ) : (
                <ol>
                  {project.updates.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          {UPDATE_KIND_LABELS[item.kind as keyof typeof UPDATE_KIND_LABELS] ?? "Update"} · {timeAgo(item.createdAt)}
                          {item.by ? ` · ${item.by}` : ""}
                        </p>
                        <p className="mt-0.5 text-[15px] font-semibold text-foreground">{item.title}</p>
                        {item.body ? <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p> : null}
                      </div>
                      <Button
                        variant="subtle-danger"
                        size="icon-sm"
                        aria-label={`Remove "${item.title}"`}
                        disabled={busy}
                        onClick={() =>
                          startBusy(async () => {
                            await removeUpdateAction(project.id, item.id);
                            router.refresh();
                          })
                        }
                      >
                        <Trash2Icon />
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            <Section title="Archive or delete" description="Archiving hides the project from the client and keeps everything. Deleting removes it for good.">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    startBusy(async () => {
                      await archiveProjectAction(project.id, !project.archived);
                      router.refresh();
                    })
                  }
                >
                  {project.archived ? "Restore to the client" : "Archive"}
                </Button>
                {confirmDelete ? (
                  <>
                    <span className="text-sm text-muted-foreground">Delete it permanently?</span>
                    <Button
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        startBusy(async () => {
                          const result = await deleteProjectAction(project.id);
                          if (result.ok) router.push("/admin/client-projects");
                        })
                      }
                    >
                      Delete
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Keep it
                    </Button>
                  </>
                ) : (
                  <Button variant="subtle-danger" onClick={() => setConfirmDelete(true)}>
                    <Trash2Icon />
                    Delete
                  </Button>
                )}
              </div>
            </Section>
          </div>
        ) : null}
      </div>
    </>
  );
}

export { ClientProjectEditor };
