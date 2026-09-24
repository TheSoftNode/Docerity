# Docerity

The company site: work, mentorship, tech explainers, and the admin area behind
them. Next.js 16 App Router, MongoDB Atlas, Gmail SMTP, Cloudinary.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev
```

It runs with nothing configured. Every service is optional and degrades on its
own: with no database the blog serves the eight posts built into the code, the
contact and review forms answer 503, and the admin area explains what is
missing instead of failing. `/admin` shows which services are connected.

### Environment

`.env.example` documents every key and why it is shaped the way it is. The two
that matter most:

- **`MONGODB_URI`**. Nothing is stored without it. Under Atlas Network Access,
  allow Vercel's egress or every connection from a deployment is refused.
- **`SESSION_SECRET`**. At least 32 characters, from `openssl rand -base64 32`.
  Required in production. Changing it signs everybody out.

### The first admin account

There is no sign-up route, on purpose: an open `/register` on a single-operator
site is a liability with no upside, and it is the one route no session check can
protect.

```bash
node scripts/create-admin.mjs "you@example.com" "Your Name" owner
```

The password is read from stdin, not taken as an argument, so it does not land
in shell history or the process list. Running it again for the same address
resets that account's password and signs its other sessions out.

Then sign in at `/admin/login`.

## The admin area

| Page | What it does |
| --- | --- |
| `/admin` | Counts, what is waiting, and which services are configured |
| `/admin/enquiries` | Contact form submissions, their attachments, and whether the emails were delivered |
| `/admin/reviews` | Moderation queue. Nothing is public until approved here |
| `/admin/posts` | Write, edit and publish explainers and articles |
| `/admin/subscribers` | The mailing list, and a CSV export |
| `/admin/users` | Accounts. Owners manage accounts, editors write and moderate |

### Writing a post

`/admin/posts` → **New explainer** or **New article**.

An explainer is a concept paired with an everyday thing it works like, and the
blog index tickers the two against each other, so both halves are required. An
article has a topic and an icon.

The body is a list of sections, each a heading plus paragraphs, with an optional
sidenote and media frame. It is not markdown: the article template renders
exactly these pieces and nothing else, so a markdown editor would mean shipping
a parser to support syntax with nowhere to appear. It also means a paragraph is
a plain string in the database, which cannot carry a script tag into the page.

Drafts can be incomplete and are never public. Publishing requires at least one
section with a heading and a paragraph.

The slug is derived from the title until you edit it by hand, and then never
again, because a published URL that silently changed when a typo was fixed would
break every link to it.

**The eight original posts** still live in `components/sections/blog/blog-data.ts`.
Press **Import the built-in posts** on `/admin/posts` to move them into the
database and make them editable. That file stays where it is afterwards: it is
the fallback when Atlas is unreachable, it is what an empty collection falls
back to, and it is what keeps the test suite passing with no database.

### How reviews reach the site

1. Somebody fills in the form at `/reviews`.
2. It is stored as `pending`. The status is set by the repository, never taken
   from the request body.
3. You get an email, and it appears in `/admin/reviews`.
4. Approving it publishes it to `/reviews` and the homepage rotation, and
   revalidates both.

Submissions are rate limited per IP in MongoDB rather than in memory, because
each serverless instance has its own memory and would each allow the full quota.
Photos upload straight to Cloudinary under a signed, scoped signature and are
confirmed against Cloudinary before being stored.

## Architecture

```
app/                 routes: public pages, /admin, /api
components/
  sections/          page sections, one folder per section
  admin/             the admin area's own components
  ui/                shadcn base-nova on @base-ui/react
lib/
  auth/              token (pure), session (cookies), dal (authorization)
  config/            env, site
  content/           post schema, icon registry, the DB-or-static source
  core/              errors, logger
  db/                connection and models
  repositories/      queries, and nothing else
  services/          workflows, and no queries
  http/              route wrapper and response envelope
e2e/                 Playwright, runs with no database
integration/         Playwright, runs against a real MongoDB
```

A few decisions worth knowing before changing things:

**Authorization lives in `lib/auth/dal.ts`, next to the data.** Not in a layout,
because a layout protects only what it renders, and not in `proxy.ts`, which
runs at the CDN and can see only that a cookie exists. Every Server Action
re-checks the session itself, because an action is a POST endpoint reachable
without the page ever loading. The proxy only ever redirects *towards* the login
page; redirecting away from it on an unverifiable cookie was an infinite
redirect.

**Sessions are stateless**, a signed JWT in an HttpOnly cookie. The usual
objection is that you cannot revoke one, which `sessionVersion` answers: it
travels in the payload, the DAL compares it against the stored value, and
bumping the stored number invalidates every token for that account. Changing a
password and disabling an account both bump it.

**Repositories hold the gate.** `listPublished` for reviews and
`listPublishedPosts` for posts are the only read paths the public site uses, and
they filter on status. Putting that in a caller means a new page can expose
drafts by forgetting a `where`.

**Public pages fall back to static content.** Not a placeholder: it keeps the
site up when Atlas is unreachable, keeps a fresh clone working, and keeps the
test suite honest about the degraded path.

**Icons are stored as names.** A React component cannot round-trip through
MongoDB, so a post stores a name from the explicit registry in
`lib/content/icons.ts`. Explicit rather than a dynamic import, because an
arbitrary database value used as a module path is a bad idea and a bundler
cannot tree-shake an import it cannot see.

## Tests

```bash
npm run test:e2e             # 234 tests, no database needed
npm run test:integration     # 22 tests against a real MongoDB
```

The main suite runs with no `MONGODB_URI` on purpose: that covers the degraded
path, which is a real production state and the one nobody thinks to check.

The integration suite starts an in-memory MongoDB, then a dev server that
inherits its URI, and drives the whole pipeline: signing in, submitting and
approving a review, importing and editing and publishing a post, reading an
enquiry, and the account rules. Stop any running `next dev` first, because
Next 16 refuses a second one in the same directory.

Visual baselines are recorded on macOS in dev mode. After a deliberate visual
change:

```bash
npm run test:e2e:update-snapshots
```

## Deploying

Vercel, with the same keys from `.env.example` set as environment variables.
`MONGODB_URI` and `SESSION_SECRET` are the two that change behaviour rather than
just disabling a feature.
