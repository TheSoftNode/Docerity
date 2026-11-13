/**
 * The shape of an Academy course, as the pages, the admin and the grading
 * all read it. A course is a list of modules; a module is a list of lessons;
 * a lesson is a video, a reading, a quiz, or an assignment.
 *
 * Courses ship in code (`lib/academy/catalog`) and can be edited in the
 * admin; an edited course is stored whole and replaces the shipped one.
 */

export const LESSON_KINDS = ["video", "reading", "quiz", "assignment"] as const;
export type LessonKind = (typeof LESSON_KINDS)[number];

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export type Question = {
  id: string;
  prompt: string;
  /** Optional code shown under the prompt ("what does this print?"). */
  code: string;
  options: string[];
  /** Indexes into `options` that are right. More than one = "choose all that apply". */
  answer: number[];
  /** Shown after answering: why the right answer is right. */
  explain: string;
};

/** One line of an assignment's marking guide: what earns the points, and how many. */
export type RubricItem = { criterion: string; points: number };

/** What a student hands in for an assignment: written work (text or code), or a GitHub repo and live link. */
export const HAND_IN_KINDS = ["text", "link"] as const;
export type HandInKind = (typeof HAND_IN_KINDS)[number];

export type Lesson = {
  id: string;
  title: string;
  kind: LessonKind;
  /** The YouTube video id (not the whole link). Empty = the video is not recorded yet. */
  youtubeId: string;
  minutes: number;
  summary: string;
  /** The lesson's notes, in a small subset of Markdown (see `lib/academy/markdown`). */
  notes: string;
  questions: Question[];
  /** Assignments only: how the work is handed in, and the marking guide. The task itself is in `notes`. */
  handIn?: HandInKind;
  rubric?: RubricItem[];
};

export type Module = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export type Course = {
  slug: string;
  title: string;
  tagline: string;
  level: CourseLevel;
  /** What a student can do at the end, one line each. */
  outcomes: string[];
  /** Price in naira; 0 = free. Paid courses are a later phase. */
  price: number;
  status: "draft" | "published";
  modules: Module[];
};

/** A student's answers to a quiz: question id → the option indexes chosen. */
export type QuizAnswers = Record<string, number[]>;

export type QuizResult = {
  score: number;
  passed: boolean;
  perfect: boolean;
  /** Per question: whether it was right, the right answer and why. */
  review: { id: string; correct: boolean; answer: number[]; explain: string }[];
};

/** What a student just earned from an action: XP, a new level, a finished course. */
export type Earned = { xp: number; levelUp: number | null; courseDone: boolean };
