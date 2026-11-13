import type { Course, Lesson, Question } from "@/lib/academy/types";

/*
 * The first Academy course, as it ships. Videos are added in the admin by
 * pasting a YouTube link into each lesson; until then a lesson shows its notes
 * and says the video is on its way.
 */

const video = (id: string, title: string, minutes: number, summary: string, notes: string): Lesson => ({
  id,
  title,
  kind: "video",
  youtubeId: "",
  minutes,
  summary,
  notes: notes.trim(),
  questions: [],
});

const quiz = (id: string, title: string, questions: Question[]): Lesson => ({
  id,
  title,
  kind: "quiz",
  youtubeId: "",
  minutes: Math.max(3, questions.length * 2),
  summary: `${questions.length} questions. Pass with 70% to open the next module.`,
  notes: "",
  questions,
});

const q = (id: string, prompt: string, options: string[], answer: number[], explain: string, code = ""): Question => ({
  id,
  prompt,
  code,
  options,
  answer,
  explain,
});

export const webDevelopment: Course = {
  slug: "web-development",
  title: "Web development, from zero to shipped",
  tagline: "HTML, CSS, JavaScript, Git and React, taught the way we build real products, ending with a site of your own on the internet.",
  level: "Beginner",
  outcomes: [
    "Build responsive pages with semantic HTML and modern CSS",
    "Write JavaScript that talks to the page and to APIs",
    "Work with Git and GitHub like a team does",
    "Build a React app with Next.js and deploy it",
  ],
  price: 0,
  status: "published",
  modules: [
    {
      id: "how-the-web-works",
      title: "How the web works",
      summary: "What actually happens between typing an address and seeing a page, and the tools you will use every day.",
      lessons: [
        video(
          "what-happens-when-you-open-a-site",
          "What happens when you open a website",
          12,
          "Domains, DNS, servers, HTTP and the browser, in one trip.",
          `
## The trip, step by step

1. You type \`docerity.com\`. The browser asks **DNS** which server that name points to, and gets back an IP address.
2. It opens a connection to that server and, for an \`https\` address, agrees on encryption (**TLS**).
3. It sends an **HTTP request**: \`GET /\` plus some headers.
4. The server answers with a **response**: a status code (\`200 OK\`, \`404 Not Found\`) and a body, usually HTML.
5. The browser reads the HTML, fetches the CSS, JavaScript and images it points to, and draws the page.

## Words to keep

- **Client**: the browser asking. **Server**: the computer answering.
- **Front end**: what runs in the browser. **Back end**: what runs on the server.
`
        ),
        video(
          "your-tools",
          "Your tools: browser, editor, terminal",
          10,
          "Set up VS Code, the browser's DevTools and a terminal, and open your first file.",
          `
## Install

- **VS Code** (code.visualstudio.com) with the *Prettier* and *Live Server* extensions.
- **Node.js** LTS (nodejs.org). Check it worked: \`node -v\` in a terminal.
- **Git** (git-scm.com). Check: \`git --version\`.

## DevTools

Right-click any page and choose **Inspect**. The *Elements* tab shows the HTML, *Console* runs JavaScript, *Network* shows every request the page makes. You will live in these.
`
        ),
        quiz("quiz-how-the-web-works", "Check: how the web works", [
          q("dns", "What does DNS do?", ["Encrypts the connection", "Turns a domain name into a server address", "Draws the page", "Stores your cookies"], [1], "DNS is the internet's phone book: it maps names like docerity.com to IP addresses."),
          q("status-404", "A server answers 404. What does that mean?", ["Everything worked", "You are not signed in", "The page was not found", "The server crashed"], [2], "404 means the server is fine but has nothing at that path. 500-range codes mean the server failed."),
          q("front-end", "Which of these run in the browser?", ["HTML", "CSS", "JavaScript", "The database"], [0, 1, 2], "HTML, CSS and JavaScript are the front end. The database lives on the server side."),
          q("https", "What does the S in HTTPS add?", ["Speed", "Encryption between browser and server", "Search engine ranking only", "A second server"], [1], "HTTPS is HTTP over TLS: the traffic is encrypted, so others on the network cannot read or change it."),
        ]),
      ],
    },
    {
      id: "html",
      title: "HTML: the structure",
      summary: "Write pages that mean something: headings, text, links, images, forms, and markup that works for everyone.",
      lessons: [
        video(
          "html-structure",
          "The structure of a page",
          14,
          "Elements, attributes and the skeleton every page starts from.",
          `
## The skeleton

\`\`\`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>
\`\`\`

- An **element** is a tag pair and what is inside it: \`<p>Text</p>\`.
- An **attribute** adds information to an element: \`<a href="/about">\`.
- \`<head>\` is about the page; \`<body>\` is the page.
`
        ),
        video(
          "html-text-links-images",
          "Text, links and images",
          12,
          "Headings, paragraphs, lists, links and images, with alt text that matters.",
          `
## Use the right element

- One \`<h1>\` per page, then \`<h2>\`, \`<h3>\` in order. Headings are an outline, not a font size.
- \`<p>\` for paragraphs, \`<ul>\`/\`<ol>\` with \`<li>\` for lists.
- \`<a href="https://example.com">Read more</a>\`: the words inside a link should say where it goes.
- \`<img src="team.jpg" alt="Three engineers around a laptop">\`: **alt** describes the image for people who cannot see it. Decorative images get \`alt=""\`.
`
        ),
        video(
          "html-forms",
          "Forms",
          13,
          "Inputs, labels and buttons, and why every input needs a label.",
          `
## A small form

\`\`\`html
<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Subscribe</button>
</form>
\`\`\`

- \`for\` on the label matches \`id\` on the input: clicking the label focuses the field, and screen readers read it.
- The right \`type\` (\`email\`, \`tel\`, \`number\`, \`date\`) gives phones the right keyboard and free validation.
- \`name\` is what the server receives.
`
        ),
        video(
          "html-semantics",
          "Semantic HTML and accessibility",
          11,
          "header, nav, main, section, article, footer, and buttons that are buttons.",
          `
## Landmarks

\`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<footer>\` tell browsers and assistive technology what each part of the page is.

## Rules that catch most problems

- Something that *does* a thing is a \`<button>\`; something that *goes* somewhere is an \`<a>\`.
- Never remove the focus outline without replacing it.
- Text and background need enough contrast to read.
`
        ),
        quiz("quiz-html", "Check: HTML", [
          q("alt", "What is the alt attribute on an image for?", ["Styling the image", "A description for people who cannot see it", "The image's file size", "A tooltip only"], [1], "Screen readers read alt text aloud, and it shows if the image fails to load."),
          q("h1", "How many h1 elements should a page usually have?", ["None", "One", "One per section", "As many as you like"], [1], "The h1 is the page's title; sections use h2, h3 and so on."),
          q("label", "How do you connect a label to its input?", ["Put them in the same div", "Give the label a for that matches the input's id", "Use the same class", "Add aria-hidden"], [1], "label for=\"email\" + input id=\"email\" ties them together."),
          q("button-vs-link", "A control opens a menu on the same page. Which element should it be?", ["<a href=\"#\">", "<div onclick>", "<button>", "<span>"], [2], "It does something rather than going somewhere, so it is a button: focusable and usable by keyboard for free."),
          q("landmarks", "Which of these are landmark elements?", ["<main>", "<nav>", "<b>", "<footer>"], [0, 1, 3], "main, nav and footer describe regions of the page; b only makes text bold."),
        ]),
      ],
    },
    {
      id: "css",
      title: "CSS: the look and the layout",
      summary: "Selectors, the box model, Flexbox, Grid and pages that work on every screen.",
      lessons: [
        video(
          "css-selectors",
          "Selectors and the cascade",
          13,
          "How CSS finds elements, and which rule wins when two disagree.",
          `
## Selecting

\`\`\`css
p { line-height: 1.6; }          /* every p */
.card { border-radius: 16px; }   /* class="card" */
#signup { scroll-margin: 80px; } /* id="signup" */
nav a:hover { color: coral; }    /* links in nav, on hover */
\`\`\`

## Who wins

1. **Importance** (\`!important\`, rarely the answer).
2. **Specificity**: id beats class beats element.
3. **Order**: later rules beat earlier ones of equal weight.
`
        ),
        video(
          "css-box-model",
          "The box model",
          10,
          "Content, padding, border and margin, and the one setting that makes sizes predictable.",
          `
Every element is a box: **content**, then **padding**, then **border**, then **margin** outside.

\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
\`\`\`

With \`border-box\`, \`width: 300px\` means the whole box is 300px, padding and border included. Put it at the top of every stylesheet.
`
        ),
        video(
          "css-flexbox",
          "Flexbox",
          15,
          "Lay things out in a row or a column, and align them.",
          `
\`\`\`css
.row {
  display: flex;
  gap: 16px;
  justify-content: space-between; /* along the row */
  align-items: center;            /* across it */
}
\`\`\`

Use Flexbox for one direction: a nav bar, a row of buttons, a card's header. \`flex: 1\` on a child makes it take the space left.
`
        ),
        video(
          "css-grid",
          "Grid",
          14,
          "Two-dimensional layouts: columns and rows together.",
          `
\`\`\`css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}
\`\`\`

That one rule gives you a card grid that goes from one column on a phone to four on a laptop, with no media queries.
`
        ),
        video(
          "css-responsive",
          "Responsive design",
          12,
          "Mobile first, media queries, and units that scale.",
          `
- Design for the phone first, then add rules for wider screens:

\`\`\`css
.grid { display: grid; gap: 16px; }
@media (min-width: 768px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
\`\`\`

- Use \`rem\` for type, \`%\` and \`fr\` for layout, \`clamp(2rem, 5vw, 4rem)\` for headings that grow with the screen.
- Test with DevTools' device toolbar.
`
        ),
        quiz("quiz-css", "Check: CSS", [
          q("specificity", "Which selector wins if all three set the colour of the same element?", ["p", ".intro", "#lead"], [2], "An id is more specific than a class, which beats an element selector."),
          q("box-sizing", "With box-sizing: border-box, a box has width: 200px and padding: 20px. How wide is it on screen?", ["160px", "200px", "240px", "220px"], [1], "border-box includes padding and border inside the width."),
          q("flex-vs-grid", "You need a layout of rows AND columns at once. What fits best?", ["Flexbox", "Grid", "float", "position: absolute"], [1], "Grid handles two dimensions; Flexbox is built for one."),
          q("mobile-first", "In mobile-first CSS, which media query adds the laptop layout?", ["@media (max-width: 768px)", "@media (min-width: 768px)", "@media print", "@media (orientation: portrait)"], [1], "Mobile first writes the phone styles plainly, then adds min-width queries for larger screens."),
          q("center", "Which of these centre a child both ways inside a flex container?", ["justify-content: center", "align-items: center", "text-align: center", "margin: auto on the child"], [0, 1], "justify-content centres along the main axis and align-items across it. (margin: auto on a flex child also works, but on its own it is not the standard pair.)"),
        ]),
      ],
    },
    {
      id: "javascript",
      title: "JavaScript: making it work",
      summary: "Values, functions, arrays and objects, the DOM, events, and talking to APIs.",
      lessons: [
        video(
          "js-values",
          "Values, variables and types",
          14,
          "let and const, strings, numbers, booleans, null and undefined.",
          `
\`\`\`js
const name = "Ada";      // can't be reassigned
let count = 0;           // can
count = count + 1;

typeof "hi"   // "string"
typeof 42     // "number"
typeof true   // "boolean"
\`\`\`

Use \`const\` by default and \`let\` only when the value changes. Compare with \`===\`, which does not convert types.
`
        ),
        video(
          "js-functions",
          "Functions",
          13,
          "Declaring, calling and returning, and arrow functions.",
          `
\`\`\`js
function add(a, b) {
  return a + b;
}

const double = (n) => n * 2;

add(2, 3);   // 5
double(4);   // 8
\`\`\`

A function without \`return\` gives back \`undefined\`.
`
        ),
        video(
          "js-arrays-objects",
          "Arrays and objects",
          15,
          "Lists and records, and the array methods you will use daily.",
          `
\`\`\`js
const users = [
  { name: "Ada", age: 36 },
  { name: "Linus", age: 28 },
];

users.map((u) => u.name);           // ["Ada", "Linus"]
users.filter((u) => u.age > 30);    // [{ name: "Ada", ... }]
users.find((u) => u.name === "Linus");
\`\`\`

\`map\` transforms, \`filter\` keeps some, \`find\` returns the first match. None of them change the original array.
`
        ),
        video(
          "js-dom-events",
          "The DOM and events",
          15,
          "Find elements, change them, and respond to clicks and typing.",
          `
\`\`\`js
const button = document.querySelector("#like");
const count = document.querySelector("#count");
let likes = 0;

button.addEventListener("click", () => {
  likes += 1;
  count.textContent = likes;
});
\`\`\`

Use \`textContent\` for text you did not write yourself; \`innerHTML\` with user input is how sites get hacked.
`
        ),
        video(
          "js-fetch",
          "Fetching data with async and await",
          14,
          "Call an API, wait for the answer, handle errors.",
          `
\`\`\`js
async function loadUser(id) {
  const response = await fetch(\`https://api.example.com/users/\${id}\`);
  if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);
  return response.json();
}
\`\`\`

\`await\` pauses the function, not the page. Always check \`response.ok\`: \`fetch\` does not throw on a 404.
`
        ),
        quiz("quiz-javascript", "Check: JavaScript", [
          q("const", "What happens here?", ["Prints 2", "Prints 1", "TypeError: assignment to constant", "Prints undefined"], [2], "A const binding cannot be reassigned.", "const total = 1;\ntotal = 2;\nconsole.log(total);"),
          q("equality", "What does 2 === \"2\" give?", ["true", "false", "undefined", "An error"], [1], "=== compares type and value: a number is not a string."),
          q("map", "What does this print?", ["[1, 2, 3]", "[2, 4, 6]", "6", "undefined"], [1], "map returns a new array with each value doubled.", "console.log([1, 2, 3].map((n) => n * 2));"),
          q("fetch-404", "fetch() gets a 404 response. What happens?", ["fetch throws an error", "The promise resolves; response.ok is false", "The page reloads", "It retries"], [1], "fetch only rejects on network failure. Check response.ok yourself."),
          q("textcontent", "You show a name a user typed. Which is safe?", ["el.innerHTML = name", "el.textContent = name", "document.write(name)", "eval(name)"], [1], "textContent never runs HTML, so a name like <img onerror=...> stays harmless text."),
        ]),
      ],
    },
    {
      id: "git",
      title: "Git and GitHub",
      summary: "Save your work in steps, work on branches, and collaborate through pull requests.",
      lessons: [
        video(
          "git-basics",
          "Commits and branches",
          14,
          "init, add, commit, branch, switch, and reading the log.",
          `
\`\`\`bash
git init
git add index.html
git commit -m "Add the home page"
git switch -c feature/contact-form
git log --oneline
\`\`\`

A **commit** is a saved step with a message. A **branch** is a line of work you can try things on without touching \`main\`. Commit small, and write messages that say what changed and why.
`
        ),
        video(
          "github-pull-requests",
          "GitHub and pull requests",
          13,
          "Push to GitHub, open a pull request, review, merge.",
          `
\`\`\`bash
git remote add origin https://github.com/you/portfolio.git
git push -u origin feature/contact-form
\`\`\`

On GitHub, open a **pull request** from your branch into \`main\`. Describe the change, ask for review, fix what comes back, then merge. This is how every team ships.
`
        ),
        quiz("quiz-git", "Check: Git and GitHub", [
          q("commit", "What does git commit do?", ["Uploads to GitHub", "Saves a snapshot of the staged changes locally", "Deletes a branch", "Downloads changes"], [1], "Commits are local until you push."),
          q("add-before-commit", "You changed a file and ran git commit. Nothing was saved. Why?", ["Git is broken", "You did not git add the file first", "You need sudo", "Files must be under 1 MB"], [1], "Only staged changes go into a commit: git add first."),
          q("branch", "Why work on a branch?", ["Branches are faster", "To change things without touching main until it is ready", "GitHub requires it", "To delete history"], [1], "A branch isolates work; main stays deployable."),
          q("pr", "Where does code review usually happen?", ["In the terminal", "In a pull request", "In git log", "In the README"], [1], "Pull requests show the diff, collect comments and gate the merge."),
        ]),
      ],
    },
    {
      id: "react-next",
      title: "React and Next.js",
      summary: "Build interfaces from components, keep state, and make a real app with routing.",
      lessons: [
        video(
          "react-components",
          "Components and props",
          15,
          "Break a page into components and pass them data.",
          `
\`\`\`jsx
function Card({ title, children }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

<Card title="Hello">Built with React.</Card>
\`\`\`

A component is a function that returns markup. **Props** go in; the component never changes them.
`
        ),
        video(
          "react-state",
          "State and effects",
          15,
          "useState for values that change, useEffect for talking to the outside world.",
          `
\`\`\`jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
\`\`\`

Changing state re-renders the component. Never change state directly (\`count++\`): always use the setter.
`
        ),
        video(
          "nextjs-routing",
          "Next.js pages and routing",
          14,
          "Files become pages, layouts wrap them, and data loads on the server.",
          `
\`\`\`
app/
  page.tsx          → /
  about/page.tsx    → /about
  blog/[slug]/page.tsx → /blog/anything
\`\`\`

\`npx create-next-app@latest\` starts a project. Server components fetch data before the page reaches the browser, so pages arrive ready.
`
        ),
        quiz("quiz-react", "Check: React and Next.js", [
          q("props", "Can a component change its own props?", ["Yes, any time", "No, props are read-only", "Only in useEffect", "Only strings"], [1], "Props come from the parent. To change something, keep it in state."),
          q("state", "What re-renders a component?", ["Changing a regular variable", "Calling its state setter", "console.log", "Adding a comment"], [1], "Calling the setter tells React the value changed."),
          q("route", "Which file gives you the page at /pricing in the Next.js app router?", ["pages/pricing.html", "app/pricing/page.tsx", "app/pricing.tsx", "routes/pricing.js"], [1], "In the app router a folder is a path segment and page.tsx is its page."),
          q("counter", "What does the button show after two clicks?", ["Clicked 0 times", "Clicked 1 times", "Clicked 2 times", "Nothing"], [2], "Each click calls setCount(count + 1) and re-renders.", "const [count, setCount] = useState(0);\n<button onClick={() => setCount(count + 1)}>Clicked {count} times</button>"),
        ]),
      ],
    },
    {
      id: "ship-it",
      title: "Ship it",
      summary: "Put your site on the internet with a domain, then build your capstone.",
      lessons: [
        video(
          "deploy-vercel",
          "Deploying to Vercel",
          12,
          "From a GitHub repo to a live URL in minutes, with previews for every pull request.",
          `
1. Push your project to GitHub.
2. Sign in to vercel.com with GitHub and import the repo.
3. Every push to \`main\` goes live; every pull request gets its own preview link.

Keep secrets (API keys) in the project's **Environment Variables**, never in the code.
`
        ),
        video(
          "domains-performance",
          "Domains, HTTPS and speed",
          11,
          "Point a domain at your site and keep it fast.",
          `
- Add your domain in Vercel and copy the DNS records it gives you to your registrar. HTTPS is automatic.
- Compress images and give them sizes; lazy-load what is below the fold.
- Run **Lighthouse** in DevTools and fix the top three items it lists.
`
        ),
        {
          id: "capstone-portfolio",
          title: "Capstone: your portfolio site",
          kind: "reading",
          youtubeId: "",
          minutes: 20,
          summary: "Build and ship a personal site that shows three projects. This is the project employers look at.",
          notes: `
## The brief

Build a portfolio site and deploy it on your own domain or a Vercel URL.

- A home page with who you are and what you build, in two sentences.
- Three project cards, each with a screenshot, a one-line description, the stack, and links to the code and the live site.
- A contact section with a working form or a mailto link.
- Works on a phone, scores 90+ on Lighthouse accessibility.

## Hand it in

Push to GitHub and deploy. When the project pool opens, you will submit the repo and live link there for review and XP.
`.trim(),
          questions: [],
        },
      ],
    },
  ],
};
