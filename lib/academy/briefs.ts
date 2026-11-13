import { COURSE_LEVELS, type CourseLevel } from "@/lib/academy/types";
import { slugify } from "@/lib/academy/normalise";

/**
 * The project pool: briefs a student picks, builds and hands in. They ship
 * here and can be edited in the admin; an edited list is stored whole and
 * replaces this one.
 */

export type ProjectBrief = {
  id: string;
  title: string;
  level: CourseLevel;
  stack: string[];
  /** One line on the card. */
  summary: string;
  /** The brief, in the same small Markdown as lesson notes. */
  brief: string;
  /** What must work for the build to be approved. */
  requirements: string[];
  /** Extras for anyone who wants to push further. */
  stretch: string[];
  hours: number;
};

/** XP when a build is approved, by level. */
export const BUILD_XP: Record<CourseLevel, number> = { Beginner: 100, Intermediate: 200, Advanced: 300 };

const brief = (b: ProjectBrief) => b;

export const SHIPPED_BRIEFS: ProjectBrief[] = [
  brief({
    id: "portfolio-site",
    title: "Personal portfolio site",
    level: "Beginner",
    stack: ["HTML", "CSS"],
    summary: "A one-page site that says who you are and shows three projects.",
    brief: "Your portfolio is the first thing anyone hiring you will open. Build a single page that loads fast, reads well on a phone, and shows your best work.",
    requirements: [
      "A short intro: who you are and what you build, in two sentences",
      "Three project cards with a picture, one line, and links to code and live site",
      "A contact section with a mailto link or a working form",
      "Works on a phone (no sideways scrolling) and scores 90+ for accessibility in Lighthouse",
    ],
    stretch: ["A light and dark theme", "Your own domain"],
    hours: 6,
  }),
  brief({
    id: "business-landing-page",
    title: "Landing page for a local business",
    level: "Beginner",
    stack: ["HTML", "CSS"],
    summary: "A real page for a real shop, salon or restaurant near you.",
    brief: "Pick a business near you that has no website, or a bad one, and build the page it deserves. Real photos, real opening hours, a way to call or book.",
    requirements: [
      "A hero with the business name, what it offers and one clear button (call, book or WhatsApp)",
      "Opening hours, address and a map link",
      "A section of services or a menu with prices",
      "Responsive from 360px wide to a laptop",
    ],
    stretch: ["Show it to the owner and add their feedback to your README"],
    hours: 6,
  }),
  brief({
    id: "tip-calculator",
    title: "Bill splitter",
    level: "Beginner",
    stack: ["HTML", "CSS", "JavaScript"],
    summary: "Split a bill between friends, with a tip, as you type.",
    brief: "Enter the bill, the tip percentage and the number of people; see what each person pays. Everything updates as you type, with no button.",
    requirements: [
      "Inputs for bill, tip (preset buttons and a custom value) and people",
      "Shows tip per person and total per person, updating as you type",
      "Handles bad input: no negative numbers, no dividing by zero people",
      "Labels on every input, usable with a keyboard only",
    ],
    stretch: ["Remember the last tip used with localStorage", "Round up to the nearest ₦50"],
    hours: 4,
  }),
  brief({
    id: "quiz-app",
    title: "Quiz game",
    level: "Beginner",
    stack: ["JavaScript"],
    summary: "Ten questions, a timer and a score at the end.",
    brief: "Build a quiz on any topic you like. Questions live in a JavaScript array; the page shows one at a time, marks the answer, and keeps score.",
    requirements: [
      "At least 10 questions stored as an array of objects",
      "One question at a time with four options; shows right or wrong after each",
      "A 15-second timer per question",
      "A final screen with the score and a play-again button",
    ],
    stretch: ["Load questions from an open trivia API", "A high-score table in localStorage"],
    hours: 6,
  }),
  brief({
    id: "weather-dashboard",
    title: "Weather dashboard",
    level: "Intermediate",
    stack: ["JavaScript", "API"],
    summary: "Search a city, see today and the next five days.",
    brief: "Use a free weather API (Open-Meteo needs no key) to show the weather for any city. Handle loading and errors like a real product.",
    requirements: [
      "Search by city name; show current temperature, conditions and wind",
      "A five-day forecast",
      "Loading and error states (unknown city, no network)",
      "Remembers the last city searched",
    ],
    stretch: ["Use the browser's location on first visit", "Switch between °C and °F"],
    hours: 8,
  }),
  brief({
    id: "kanban-board",
    title: "Kanban board",
    level: "Intermediate",
    stack: ["JavaScript", "React"],
    summary: "To do, doing, done: drag cards between columns.",
    brief: "A board with three columns and cards you can add, edit, delete and drag between columns. It keeps its state between visits.",
    requirements: [
      "Add, edit and delete cards",
      "Drag and drop between columns (and a keyboard way to move a card)",
      "Saves to localStorage and restores on reload",
      "Empty states that tell you what to do",
    ],
    stretch: ["Due dates with overdue cards highlighted", "Several boards"],
    hours: 10,
  }),
  brief({
    id: "expense-tracker",
    title: "Expense tracker with charts",
    level: "Intermediate",
    stack: ["React"],
    summary: "Log spending by category and see where the money goes.",
    brief: "Record expenses with an amount, a category and a date. Show the month's total and a chart of spending by category.",
    requirements: [
      "Add, edit and delete expenses with validation",
      "Filter by month",
      "A chart of spending by category (any chart library, or hand-drawn SVG)",
      "Totals that always add up, formatted as naira",
    ],
    stretch: ["Monthly budgets with a warning when one is close", "Export to CSV"],
    hours: 12,
  }),
  brief({
    id: "github-profile-finder",
    title: "GitHub profile finder",
    level: "Intermediate",
    stack: ["React", "API"],
    summary: "Look up any GitHub user and see their profile and top repos.",
    brief: "Search a username with the GitHub REST API. Show the profile and their repositories, sorted by stars, with pagination.",
    requirements: [
      "Profile card: avatar, name, bio, followers, public repos",
      "Repositories sorted by stars, 10 per page with next and previous",
      "Handles a user that does not exist and the API's rate limit",
      "The address updates with the search (?user=…) so a result can be shared",
    ],
    stretch: ["Compare two users side by side", "A chart of languages used"],
    hours: 10,
  }),
  brief({
    id: "notes-app",
    title: "Markdown notes app",
    level: "Intermediate",
    stack: ["Next.js", "React"],
    summary: "Write notes in Markdown with a live preview and search.",
    brief: "A notes app with a list on the left and an editor with live preview on the right. Notes are searchable and survive a reload.",
    requirements: [
      "Create, rename and delete notes",
      "Markdown editor with a live preview",
      "Search across titles and content",
      "Works on a phone (list and editor as separate screens)",
    ],
    stretch: ["Sync to a database with sign-in", "Tags"],
    hours: 14,
  }),
  brief({
    id: "url-shortener",
    title: "URL shortener with analytics",
    level: "Advanced",
    stack: ["Next.js", "Database"],
    summary: "Short links that redirect, and a count of every click.",
    brief: "Paste a long link, get a short one. Every visit redirects and is counted, and each link has a page showing clicks over time.",
    requirements: [
      "Create short links with a random or custom code; refuse duplicates",
      "Redirects fast (a 307) and records the click",
      "A stats page per link with clicks per day",
      "Rate limiting so nobody can fill the database",
    ],
    stretch: ["QR code per link", "Links that expire"],
    hours: 18,
  }),
  brief({
    id: "realtime-chat",
    title: "Realtime chat",
    level: "Advanced",
    stack: ["Next.js", "WebSockets"],
    summary: "Rooms, messages that appear instantly, and who is online.",
    brief: "A chat app with rooms. Messages appear for everyone in the room without a refresh, and you can see who is online.",
    requirements: [
      "Sign in, then join or create a room",
      "Messages appear for everyone instantly (WebSockets or a realtime service)",
      "Message history loads when you join",
      "Shows who is online and who is typing",
    ],
    stretch: ["Image messages", "Read receipts"],
    hours: 24,
  }),
  brief({
    id: "storefront",
    title: "Storefront with checkout",
    level: "Advanced",
    stack: ["Next.js", "Payments"],
    summary: "Products, a cart and a real checkout in Paystack test mode.",
    brief: "A small shop: a product list, product pages, a cart, and checkout through Paystack's test mode. An order only counts once the payment is verified on the server.",
    requirements: [
      "Product list and detail pages from a database or a JSON file",
      "A cart that survives a reload",
      "Checkout with Paystack test keys; verify the payment on the server before marking an order paid",
      "An order confirmation page and email",
    ],
    stretch: ["An admin page to add products", "Stock that goes down with each order"],
    hours: 28,
  }),
];

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const list = (value: unknown, max: number, each: number) =>
  (Array.isArray(value) ? value : typeof value === "string" ? value.split("\n") : []).map((item) => text(item, each)).filter(Boolean).slice(0, max);

/** Cleans a list of briefs from the admin: every field capped, ids unique and URL-safe, empty briefs dropped. */
export function normaliseBriefs(raw: unknown): ProjectBrief[] {
  const used = new Set<string>();
  const out: ProjectBrief[] = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const value = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const title = text(value.title, 120);
    if (!title) continue;
    let id = slugify(text(value.id, 60) || title) || "project";
    for (let n = 2; used.has(id); n += 1) id = `${slugify(text(value.id, 60) || title)}-${n}`;
    used.add(id);
    const hours = Math.round(Number(value.hours));
    out.push({
      id,
      title,
      level: (COURSE_LEVELS as readonly string[]).includes(String(value.level)) ? (value.level as CourseLevel) : "Beginner",
      stack: list(value.stack, 6, 30),
      summary: text(value.summary, 200),
      brief: text(value.brief, 6000),
      requirements: list(value.requirements, 12, 240),
      stretch: list(value.stretch, 8, 240),
      hours: Number.isFinite(hours) && hours > 0 ? Math.min(hours, 400) : 6,
    });
    if (out.length >= 100) break;
  }
  return out;
}

/** A GitHub repository address, or "": only https://github.com/<owner>/<repo>. */
export function githubRepo(value: string): string {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.replace(/^www\./, "") !== "github.com") return "";
    const [owner, repo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !repo || !/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return "";
    return `https://github.com/${owner}/${repo.replace(/\.git$/, "")}`;
  } catch {
    return "";
  }
}
