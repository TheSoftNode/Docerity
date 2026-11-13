"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ChevronDownIcon, PlusIcon, RotateCcwIcon, SaveIcon, Trash2Icon } from "lucide-react";

import { resetCourseAction, saveCourseAction } from "@/app/admin/academy/actions";
import { COURSE_LEVELS, LESSON_KINDS, type Course, type Lesson, type Module, type Question } from "@/lib/academy/types";
import { youtubeIdFrom } from "@/lib/academy/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const KIND_LABEL = { video: "Video", reading: "Reading", quiz: "Quiz", assignment: "Assignment" } as const;
const DEFAULT_RUBRIC = [
  { criterion: "Does what the task asks", points: 40 },
  { criterion: "Clean, readable code with sensible names", points: 30 },
  { criterion: "Explains the choices made", points: 30 },
];
const field = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const select = "h-10 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground";

let counter = 0;
const tempId = (prefix: string) => `${prefix}-new-${Date.now().toString(36)}-${(counter++).toString(36)}`;

function move<T>(list: T[], index: number, by: number): T[] {
  const to = index + by;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

function QuestionEditor({ question, index, onChange, onRemove }: { question: Question; index: number; onChange: (q: Question) => void; onRemove: () => void }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-muted-foreground">Question {index + 1}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Remove question ${index + 1}`}>
          <Trash2Icon />
        </Button>
      </div>
      <div className="mt-2 grid gap-3">
        <Input value={question.prompt} onChange={(event) => onChange({ ...question, prompt: event.target.value })} placeholder="The question" aria-label="Question" />
        <Textarea value={question.code} onChange={(event) => onChange({ ...question, code: event.target.value })} placeholder="Code shown under it (optional)" aria-label="Code" className="font-mono text-[13px]" rows={2} />
        <div className="grid gap-2">
          <p className="text-[12px] text-muted-foreground">Options: tick every right answer (more than one makes it &ldquo;choose all that apply&rdquo;).</p>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={question.answer.includes(optionIndex)}
                aria-label={`Option ${optionIndex + 1} is right`}
                onClick={() =>
                  onChange({
                    ...question,
                    answer: question.answer.includes(optionIndex) ? question.answer.filter((value) => value !== optionIndex) : [...question.answer, optionIndex].sort(),
                  })
                }
                className={cn("grid size-9 shrink-0 place-items-center rounded-xl border", question.answer.includes(optionIndex) ? "border-[#4cc59a] bg-[#e3f6ec] text-[#1d7a52]" : "border-input text-transparent")}
              >
                <CheckIcon className="size-4" />
              </button>
              <Input
                value={option}
                onChange={(event) => onChange({ ...question, options: question.options.map((value, i) => (i === optionIndex ? event.target.value : value)) })}
                placeholder={`Option ${optionIndex + 1}`}
                aria-label={`Option ${optionIndex + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove option ${optionIndex + 1}`}
                onClick={() =>
                  onChange({
                    ...question,
                    options: question.options.filter((_, i) => i !== optionIndex),
                    answer: question.answer.filter((value) => value !== optionIndex).map((value) => (value > optionIndex ? value - 1 : value)),
                  })
                }
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
          {question.options.length < 8 ? (
            <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onChange({ ...question, options: [...question.options, ""] })}>
              <PlusIcon /> Option
            </Button>
          ) : null}
        </div>
        <Textarea value={question.explain} onChange={(event) => onChange({ ...question, explain: event.target.value })} placeholder="Why the right answer is right (shown after answering)" aria-label="Explanation" rows={2} />
      </div>
    </div>
  );
}

function LessonEditor({ lesson, onChange }: { lesson: Lesson; onChange: (lesson: Lesson) => void }) {
  const [link, setLink] = useState(lesson.youtubeId ? `https://youtu.be/${lesson.youtubeId}` : "");
  const parsed = youtubeIdFrom(link);
  return (
    <div className="grid gap-4 border-t border-border p-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px_110px]">
        <label className={field}>
          Title
          <Input value={lesson.title} onChange={(event) => onChange({ ...lesson, title: event.target.value })} />
        </label>
        <label className={field}>
          Kind
          <select
            className={select}
            value={lesson.kind}
            onChange={(event) => {
              const kind = event.target.value as Lesson["kind"];
              onChange(kind === "assignment" ? { ...lesson, kind, handIn: lesson.handIn ?? "text", rubric: lesson.rubric?.length ? lesson.rubric : DEFAULT_RUBRIC } : { ...lesson, kind });
            }}
          >
            {LESSON_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          Minutes
          <Input type="number" min={1} max={600} value={lesson.minutes} onChange={(event) => onChange({ ...lesson, minutes: Number(event.target.value) })} />
        </label>
      </div>
      {lesson.kind === "video" ? (
        <label className={field}>
          YouTube link
          <Input
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              onChange({ ...lesson, youtubeId: youtubeIdFrom(event.target.value) });
            }}
            placeholder="https://youtu.be/… or https://www.youtube.com/watch?v=…"
          />
          <span className={cn("text-[12px]", link && !parsed ? "text-destructive" : "text-muted-foreground")}>
            {link ? (parsed ? `Video ${parsed} will play in this lesson.` : "That doesn't look like a YouTube link.") : "Leave empty until the video is up; the lesson shows its notes meanwhile."}
          </span>
        </label>
      ) : null}
      <label className={field}>
        One-line summary
        <Input value={lesson.summary} onChange={(event) => onChange({ ...lesson, summary: event.target.value })} />
      </label>
      {lesson.kind === "assignment" ? (
        <div className="grid gap-3 rounded-2xl border border-border p-4">
          <label className={cn(field, "max-w-[280px]")}>
            Students hand in
            <select className={select} value={lesson.handIn ?? "text"} onChange={(event) => onChange({ ...lesson, handIn: event.target.value as "text" | "link" })}>
              <option value="text">Written answer or code</option>
              <option value="link">GitHub repo (+ live link)</option>
            </select>
          </label>
          <p className="text-[13px] font-medium text-foreground">Marking guide</p>
          <p className="-mt-2 text-[12px] text-muted-foreground">What earns the points. The AI (and you) mark against exactly these lines; 70% passes.</p>
          {(lesson.rubric ?? []).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item.criterion}
                onChange={(event) => onChange({ ...lesson, rubric: (lesson.rubric ?? []).map((row, i) => (i === index ? { ...row, criterion: event.target.value } : row)) })}
                placeholder="What earns these points"
                aria-label={`Marking line ${index + 1}`}
              />
              <Input
                type="number"
                min={1}
                max={100}
                value={item.points}
                onChange={(event) => onChange({ ...lesson, rubric: (lesson.rubric ?? []).map((row, i) => (i === index ? { ...row, points: Number(event.target.value) } : row)) })}
                aria-label={`Points for line ${index + 1}`}
                className="w-20"
              />
              <Button type="button" variant="ghost" size="sm" aria-label={`Remove line ${index + 1}`} onClick={() => onChange({ ...lesson, rubric: (lesson.rubric ?? []).filter((_, i) => i !== index) })}>
                <Trash2Icon />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onChange({ ...lesson, rubric: [...(lesson.rubric ?? []), { criterion: "", points: 10 }] })}>
            <PlusIcon /> Marking line
          </Button>
        </div>
      ) : null}
      {lesson.kind !== "quiz" ? (
        <label className={field}>
          {lesson.kind === "assignment" ? "The task (what to build or answer, in the same Markdown as notes)" : "Notes (## heading, - list, ```code```, **bold**, `code`, [link](https://…))"}
          <Textarea value={lesson.notes} onChange={(event) => onChange({ ...lesson, notes: event.target.value })} rows={10} className="font-mono text-[13px]" />
        </label>
      ) : (
        <div className="grid gap-3">
          {lesson.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onChange={(next) => onChange({ ...lesson, questions: lesson.questions.map((item) => (item.id === question.id ? next : item)) })}
              onRemove={() => onChange({ ...lesson, questions: lesson.questions.filter((item) => item.id !== question.id) })}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            className="justify-self-start"
            onClick={() => onChange({ ...lesson, questions: [...lesson.questions, { id: tempId("q"), prompt: "", code: "", options: ["", ""], answer: [0], explain: "" }] })}
          >
            <PlusIcon /> Question
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * The course editor: details at the top, then each module with its lessons.
 * A lesson opens in place to edit; paste a YouTube link and the video goes
 * live when the course is saved. Nothing is stored until "Save course".
 */
export function CourseEditor({ initial, shipped }: { initial: Course; shipped: boolean }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course>(initial);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();

  const update = (next: Course) => {
    setCourse(next);
    setDirty(true);
    setMessage(null);
  };
  const setModule = (index: number, module: Module) => update({ ...course, modules: course.modules.map((item, i) => (i === index ? module : item)) });

  function save() {
    start(async () => {
      const result = await saveCourseAction(course.slug, course);
      if (result.ok) {
        setDirty(false);
        setMessage({ ok: true, text: "Saved. Students see the changes now." });
        router.refresh();
      } else setMessage({ ok: false, text: result.message });
    });
  }

  return (
    <div className="grid gap-6 pb-6">
      <section className="grid gap-4 rounded-[24px] border border-border bg-card p-6">
        <h2 className="font-heading text-[20px] font-bold text-foreground">Course details</h2>
        <label className={field}>
          Title
          <Input value={course.title} onChange={(event) => update({ ...course, title: event.target.value })} />
        </label>
        <label className={field}>
          Tagline
          <Textarea value={course.tagline} onChange={(event) => update({ ...course, tagline: event.target.value })} rows={2} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={field}>
            Level
            <select className={select} value={course.level} onChange={(event) => update({ ...course, level: event.target.value as Course["level"] })}>
              {COURSE_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className={field}>
            Status
            <select className={select} value={course.status} onChange={(event) => update({ ...course, status: event.target.value as Course["status"] })}>
              <option value="published">Published</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </label>
          <label className={field}>
            Price in naira (0 = free)
            <Input type="number" min={0} value={course.price} onChange={(event) => update({ ...course, price: Number(event.target.value) })} />
          </label>
        </div>
        <label className={field}>
          By the end, students can (one per line)
          <Textarea value={course.outcomes.join("\n")} onChange={(event) => update({ ...course, outcomes: event.target.value.split("\n") })} rows={4} />
        </label>
      </section>

      {course.modules.map((module, moduleIndex) => (
        <section key={module.id} className="rounded-[24px] border border-border bg-card">
          <div className="grid gap-3 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-muted-foreground">Module {moduleIndex + 1}</p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" aria-label="Move module up" onClick={() => update({ ...course, modules: move(course.modules, moduleIndex, -1) })}>
                  <ArrowUpIcon />
                </Button>
                <Button type="button" variant="ghost" size="sm" aria-label="Move module down" onClick={() => update({ ...course, modules: move(course.modules, moduleIndex, 1) })}>
                  <ArrowDownIcon />
                </Button>
                <Button type="button" variant="ghost" size="sm" aria-label="Remove module" onClick={() => update({ ...course, modules: course.modules.filter((_, i) => i !== moduleIndex) })}>
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <Input value={module.title} onChange={(event) => setModule(moduleIndex, { ...module, title: event.target.value })} aria-label="Module title" className="font-semibold" />
            <Input value={module.summary} onChange={(event) => setModule(moduleIndex, { ...module, summary: event.target.value })} aria-label="Module summary" placeholder="One line about the module" />
          </div>
          <ul className="border-t border-border">
            {module.lessons.map((lesson, lessonIndex) => {
              const isOpen = openLesson === lesson.id;
              const setLesson = (next: Lesson) => setModule(moduleIndex, { ...module, lessons: module.lessons.map((item) => (item.id === lesson.id ? next : item)) });
              return (
                <li key={lesson.id} className="border-t border-border first:border-t-0">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <button type="button" onClick={() => setOpenLesson(isOpen ? null : lesson.id)} aria-expanded={isOpen} className="flex min-h-11 flex-1 items-center gap-3 text-left">
                      <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">{lesson.title || "Untitled lesson"}</span>
                      <span className="shrink-0 text-[12px] text-muted-foreground">
                        {KIND_LABEL[lesson.kind]}
                        {lesson.kind === "video" ? (lesson.youtubeId ? " · video in" : " · no video yet") : lesson.kind === "quiz" ? ` · ${lesson.questions.length} questions` : lesson.kind === "assignment" ? ` · ${(lesson.rubric ?? []).reduce((sum, item) => sum + item.points, 0)} points` : ""}
                      </span>
                    </button>
                    <Button type="button" variant="ghost" size="sm" aria-label="Move lesson up" onClick={() => setModule(moduleIndex, { ...module, lessons: move(module.lessons, lessonIndex, -1) })}>
                      <ArrowUpIcon />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" aria-label="Move lesson down" onClick={() => setModule(moduleIndex, { ...module, lessons: move(module.lessons, lessonIndex, 1) })}>
                      <ArrowDownIcon />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" aria-label="Remove lesson" onClick={() => setModule(moduleIndex, { ...module, lessons: module.lessons.filter((item) => item.id !== lesson.id) })}>
                      <Trash2Icon />
                    </Button>
                  </div>
                  {isOpen ? <LessonEditor lesson={lesson} onChange={setLesson} /> : null}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-2 border-t border-border p-4">
            {LESSON_KINDS.map((kind) => (
              <Button
                key={kind}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const lesson: Lesson = {
                    id: tempId("lesson"),
                    title: `New ${KIND_LABEL[kind].toLowerCase()}`,
                    kind,
                    youtubeId: "",
                    minutes: kind === "quiz" ? 5 : kind === "assignment" ? 30 : 10,
                    summary: "",
                    notes: "",
                    questions: [],
                    ...(kind === "assignment" ? { handIn: "text" as const, rubric: DEFAULT_RUBRIC } : {}),
                  };
                  setModule(moduleIndex, { ...module, lessons: [...module.lessons, lesson] });
                  setOpenLesson(lesson.id);
                }}
              >
                <PlusIcon /> {KIND_LABEL[kind]}
              </Button>
            ))}
          </div>
        </section>
      ))}

      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        onClick={() => update({ ...course, modules: [...course.modules, { id: tempId("module"), title: `Module ${course.modules.length + 1}`, summary: "", lessons: [] }] })}
      >
        <PlusIcon /> Module
      </Button>

      <div className="sticky bottom-4 z-30 rounded-full border border-border bg-background/95 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.6)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 py-2 pr-2 pl-5">
          <p className={cn("text-sm", message ? (message.ok ? "text-[#1d7a52]" : "text-destructive") : "text-muted-foreground")} role="status">
            {message?.text ?? (dirty ? "Unsaved changes." : "No changes yet.")}
          </p>
          <div className="flex gap-2">
            {shipped ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const result = await resetCourseAction(course.slug);
                    if (result.ok) {
                      setMessage({ ok: true, text: "Back to the original version." });
                      router.refresh();
                    } else setMessage({ ok: false, text: result.message });
                  })
                }
              >
                <RotateCcwIcon /> Reset to original
              </Button>
            ) : null}
            <Button type="button" onClick={save} disabled={pending || !dirty}>
              <SaveIcon /> Save course
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
