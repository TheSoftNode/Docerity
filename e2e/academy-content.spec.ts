import { test, expect } from "@playwright/test";

import { webDevelopment } from "@/lib/academy/catalog/web-development";
import { normaliseCourse } from "@/lib/academy/normalise";
import { parseNotes } from "@/lib/academy/markdown";
import { SHIPPED_BRIEFS, githubRepo, normaliseBriefs } from "@/lib/academy/briefs";
import {
  PASS_MARK,
  allLessons,
  courseProgress,
  dayKey,
  levelFor,
  liveStreak,
  markQuiz,
  nextLesson,
  nextStreak,
  openModules,
  weekKey,
  youtubeIdFrom,
} from "@/lib/academy/rules";

/*
  Unit tests for the Academy's rules. Like the other *-content specs these
  never open a page.
*/

const quiz = webDevelopment.modules[0].lessons.find((lesson) => lesson.kind === "quiz")!;

test.describe("markQuiz", () => {
  test("all right is a perfect pass", () => {
    const answers = Object.fromEntries(quiz.questions.map((q) => [q.id, q.answer]));
    const result = markQuiz(quiz, answers);
    expect(result).toMatchObject({ score: 100, passed: true, perfect: true });
  });

  test("a multi-answer question needs exactly the right set", () => {
    const multi = quiz.questions.find((q) => q.answer.length > 1)!;
    const answers = Object.fromEntries(quiz.questions.map((q) => [q.id, q.answer]));
    answers[multi.id] = multi.answer.slice(0, 1);
    const result = markQuiz(quiz, answers);
    expect(result.review.find((item) => item.id === multi.id)?.correct).toBe(false);
    expect(result.perfect).toBe(false);
  });

  test("nothing answered scores 0 and fails", () => {
    expect(markQuiz(quiz, {})).toMatchObject({ score: 0, passed: false });
  });

  test("the pass mark is 70", () => {
    expect(PASS_MARK).toBe(70);
  });
});

test.describe("levels", () => {
  test("level thresholds rise", () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(99).level).toBe(1);
    expect(levelFor(100).level).toBe(2);
    expect(levelFor(300).level).toBe(3);
    expect(levelFor(599).level).toBe(3);
    expect(levelFor(600).level).toBe(4);
  });

  test("progress inside a level adds up", () => {
    const level = levelFor(150);
    expect(level).toMatchObject({ level: 2, intoLevel: 50, levelSize: 200, toNext: 150 });
  });
});

test.describe("streaks", () => {
  const start = { count: 0, lastDay: "", freezeWeek: "" };

  test("first day starts at 1, the next day adds one, the same day does not", () => {
    const day1 = nextStreak(start, "2026-11-09");
    expect(day1.count).toBe(1);
    expect(nextStreak(day1, "2026-11-09").count).toBe(1);
    expect(nextStreak(day1, "2026-11-10").count).toBe(2);
  });

  test("one missed day is forgiven once a week", () => {
    const monday = { count: 5, lastDay: "2026-11-09", freezeWeek: "" };
    const wednesday = nextStreak(monday, "2026-11-11");
    expect(wednesday.count).toBe(6);
    expect(wednesday.freezeWeek).toBe("2026-11-09");
    expect(nextStreak({ ...wednesday }, "2026-11-13").count).toBe(1);
  });

  test("a lapsed streak reads as 0", () => {
    expect(liveStreak({ count: 4, lastDay: "2026-11-01", freezeWeek: "" }, "2026-11-10")).toBe(0);
    expect(liveStreak({ count: 4, lastDay: "2026-11-09", freezeWeek: "" }, "2026-11-10")).toBe(4);
  });

  test("weeks start on Monday", () => {
    expect(weekKey("2026-11-15")).toBe("2026-11-09");
    expect(weekKey("2026-11-09")).toBe("2026-11-09");
  });

  test("days are counted in West Africa Time", () => {
    expect(dayKey(new Date("2026-11-12T23:30:00Z"))).toBe("2026-11-13");
  });
});

test.describe("course order", () => {
  test("only the first module is open at the start", () => {
    const open = openModules(webDevelopment, { completed: [], passed: [] });
    expect([...open]).toEqual([webDevelopment.modules[0].id]);
  });

  test("passing a module's quiz opens the next", () => {
    const open = openModules(webDevelopment, { completed: [], passed: [quiz.id] });
    expect(open.has(webDevelopment.modules[1].id)).toBe(true);
    expect(open.has(webDevelopment.modules[2].id)).toBe(false);
  });

  test("progress and the next lesson follow what is done", () => {
    const first = allLessons(webDevelopment)[0];
    expect(nextLesson(webDevelopment, { completed: [], passed: [] })?.id).toBe(first.id);
    const progress = courseProgress(webDevelopment, { completed: [first.id], passed: [] });
    expect(progress.done).toBe(1);
  });

  test("every lesson id in the shipped course is unique", () => {
    const ids = allLessons(webDevelopment).map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every quiz answer points at a real option", () => {
    for (const lesson of allLessons(webDevelopment)) {
      for (const question of lesson.questions) {
        expect(question.answer.length).toBeGreaterThan(0);
        for (const index of question.answer) expect(index).toBeLessThan(question.options.length);
      }
    }
  });
});

test.describe("youtubeIdFrom", () => {
  test("reads every common link shape", () => {
    expect(youtubeIdFrom("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeIdFrom("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe("dQw4w9WgXcQ");
    expect(youtubeIdFrom("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeIdFrom("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("refuses anything else", () => {
    expect(youtubeIdFrom("https://vimeo.com/123")).toBe("");
    expect(youtubeIdFrom("not a link")).toBe("");
  });
});

test.describe("normaliseCourse", () => {
  test("the shipped course survives a round trip unchanged", () => {
    expect(normaliseCourse(webDevelopment, webDevelopment.slug)).toEqual(webDevelopment);
  });

  test("junk is cleaned: answers stay inside options, empty lessons go", () => {
    const course = normaliseCourse(
      {
        title: "  Test  ",
        modules: [
          {
            title: "M",
            lessons: [
              { title: "", kind: "video" },
              { title: "Q", kind: "quiz", questions: [{ prompt: "?", options: ["a", "b"], answer: [5, 1] }] },
            ],
          },
        ],
      },
      "test"
    );
    expect(course.title).toBe("Test");
    expect(course.modules[0].lessons).toHaveLength(1);
    expect(course.modules[0].lessons[0].questions[0].answer).toEqual([1]);
  });
});

test.describe("parseNotes", () => {
  test("reads headings, lists and code", () => {
    const blocks = parseNotes("## Title\n\n- one\n- two\n\n```js\nconst a = 1;\n```\n\nA paragraph.");
    expect(blocks.map((block) => block.kind)).toEqual(["heading", "list", "code", "paragraph"]);
  });
});

test.describe("project pool", () => {
  test("every shipped brief survives normalising unchanged, with unique ids", async () => {
    expect(SHIPPED_BRIEFS.length).toBeGreaterThanOrEqual(12);
    expect(normaliseBriefs(SHIPPED_BRIEFS)).toEqual(SHIPPED_BRIEFS);
    expect(new Set(SHIPPED_BRIEFS.map((brief) => brief.id)).size).toBe(SHIPPED_BRIEFS.length);
    for (const brief of SHIPPED_BRIEFS) expect(brief.requirements.length).toBeGreaterThan(0);
  });

  test("normalising drops untitled briefs, dedupes ids and fixes bad values", async () => {
    const out = normaliseBriefs([
      { title: "  " },
      { title: "Todo App", level: "Expert", hours: -3, stack: "React\n\n", requirements: ["Add", "", "Remove"] },
      { title: "Todo App" },
    ]);
    expect(out.map((brief) => brief.id)).toEqual(["todo-app", "todo-app-2"]);
    expect(out[0]).toMatchObject({ level: "Beginner", hours: 6, stack: ["React"], requirements: ["Add", "Remove"] });
    expect(normaliseBriefs("nope")).toEqual([]);
  });

  test("only https GitHub repositories are accepted", async () => {
    expect(githubRepo("https://github.com/ada/portfolio.git")).toBe("https://github.com/ada/portfolio");
    expect(githubRepo("https://www.github.com/ada/portfolio/tree/main")).toBe("https://github.com/ada/portfolio");
    expect(githubRepo("http://github.com/ada/portfolio")).toBe("");
    expect(githubRepo("https://gitlab.com/ada/portfolio")).toBe("");
    expect(githubRepo("https://github.com/ada")).toBe("");
    expect(githubRepo("not a url")).toBe("");
  });
});
