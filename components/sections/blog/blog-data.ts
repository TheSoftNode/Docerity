import {
  ArrowRightLeftIcon,
  ArmchairIcon,
  ChefHatIcon,
  ConciergeBellIcon,
  DatabaseIcon,
  GitForkIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  PenLineIcon,
  Share2Icon,
  StickyNoteIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";

import type { Media } from "@/components/shared/media-placeholder";

type Term = {
  label: string;
  caption: string;
  Icon: LucideIcon;
};

type Section = {
  heading: string;
  paragraphs: string[];
  sidenote?: string;
  media?: Media;
};

type BaseEntry = {
  slug: string;
  title: string;
  hook: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
  body: Section[];
};

export type ExplainerPost = BaseEntry & {
  type: "explainer";
  concept: Term;
  analogy: Term;
};

export type ArticlePost = BaseEntry & {
  type: "article";
  topic: string;
  Icon: LucideIcon;
};

export type BlogEntry = ExplainerPost | ArticlePost;

export const explainerPosts: ExplainerPost[] = [
  {
    type: "explainer",
    slug: "caching",
    title: "A sticky note on your monitor",
    concept: {
      label: "Caching",
      caption: "Store it once, reuse it fast",
      Icon: ZapIcon,
    },
    analogy: {
      label: "A sticky note on your monitor",
      caption: "Quick answer, no digging required",
      Icon: StickyNoteIcon,
    },
    hook: "Why do the same expensive work twice when you can just write the answer down?",
    readTime: "4 min read",
    publishedAt: "2026-05-04",
    tags: ["Performance", "Databases"],
    body: [
      {
        heading: "The problem: doing the same expensive work, over and over",
        paragraphs: [
          "Somewhere in your app, something slow keeps happening for no good reason: a database query that scans a big table, an API call to a third party, a calculation that takes real CPU time. It runs once. Then, thirty seconds later, someone asks the exact same question, and your system dutifully does all that work again: same query, same answer, same cost.",
        ],
        sidenote:
          "You wouldn't re-derive your Wi-Fi password from memory every time a guest asks for it. You'd write it on a sticky note the first time, then just glance at it.",
      },
      {
        heading: "What caching actually does",
        paragraphs: [
          "A cache sits between the request and the expensive work. Before doing the slow thing, you check: have I already computed this? If yes, hand back the stored answer immediately. If no, do the slow work once, then store the result before returning it, so the next request gets the shortcut.",
          "That's the entire idea. Everything else (Redis, CDNs, browser caches, memoization in code) is just this pattern applied at a different layer of the stack.",
        ],
        sidenote:
          "The sticky note is the cache. Writing the password down is the first slow lookup. Every glance after that is a cache hit, with no digging through settings.",
      },
      {
        heading: "The catch: stale answers",
        paragraphs: [
          "A cache is only useful if the stored answer is still true. If the underlying data changes and the cache doesn't know, you're now confidently handing out a wrong answer, fast. This is why cache invalidation, deciding when a stored answer expires or needs updating, is the genuinely hard part of caching, not the storing itself.",
        ],
        sidenote:
          "If the Wi-Fi password changes and nobody updates the sticky note, every guest who trusts it gets locked out, confidently and incorrectly.",
      },
      {
        heading: "When to reach for one",
        paragraphs: [
          "Cache things that are expensive to produce, requested often, and safe to serve slightly stale. Don't cache things that change every request or where staleness is dangerous. A bank balance is a worse candidate than, say, a list of blog post titles.",
        ],
        sidenote:
          "You'd still verbally confirm a password before letting someone into something that actually mattered. The sticky note is for convenience, not for the front door of a bank vault.",
      },
    ],
  },
  {
    type: "explainer",
    slug: "load-balancing",
    title: "A host seating restaurant guests",
    concept: {
      label: "Load Balancing",
      caption: "Spread traffic across servers",
      Icon: Share2Icon,
    },
    analogy: {
      label: "A host seating restaurant guests",
      caption: "No single table gets overwhelmed",
      Icon: ArmchairIcon,
    },
    hook: "One server can only handle so much before it falls over, so don't send everyone to the same one.",
    readTime: "4 min read",
    publishedAt: "2026-05-18",
    tags: ["Infrastructure", "Networking"],
    body: [
      {
        heading: "The problem: one server, all the traffic",
        paragraphs: [
          "If every visitor to your app is handled by a single server, that server eventually runs out of room (CPU, memory, open connections) while everything else you've paid for sits idle. Past a certain point, it doesn't get slower gracefully; it stops responding at all.",
        ],
        sidenote:
          "Imagine a restaurant with ten tables, but the host keeps seating every new party at table one because it's closest to the door. Table one is overwhelmed. Nine tables are empty.",
      },
      {
        heading: "What a load balancer actually does",
        paragraphs: [
          "A load balancer sits in front of a group of identical servers and decides, for each incoming request, which one should handle it, based on who's least busy, or simply taking turns. The client never talks to a specific server directly; it talks to the load balancer, which routes the request onward.",
        ],
        sidenote:
          "The host walking the floor, watching which tables have room, and seating each new party accordingly: that's the load balancer. Guests don't pick their table; the host routes them.",
      },
      {
        heading: "A few common strategies",
        paragraphs: [
          "Round robin just takes turns, server one, two, three, one again. Least connections sends the next request to whichever server currently has the fewest active requests. Fancier setups factor in server health, response time, or geography.",
        ],
        sidenote:
          "A good host doesn't just rotate blindly. They notice table three just got their food and freed up attention, and seat the next walk-in there instead of table one, which is still mid-order.",
      },
      {
        heading: "The catch: state",
        paragraphs: [
          "If a server remembers something about you between requests, like your logged-in session, and the next request lands on a different server that doesn't know you, things break. This is why systems either keep servers stateless (session data lives elsewhere, shared) or use “sticky sessions” to keep a user on the same server.",
        ],
        sidenote:
          "If your waiter from table one is the only one who remembers you asked for no onions, getting reseated at table five means explaining your order all over again.",
      },
    ],
  },
  {
    type: "explainer",
    slug: "api-requests",
    title: "A waiter relaying your order",
    concept: {
      label: "API Requests",
      caption: "One system asking another for data",
      Icon: ArrowRightLeftIcon,
    },
    analogy: {
      label: "A waiter relaying your order",
      caption: "You never talk to the kitchen directly",
      Icon: ConciergeBellIcon,
    },
    hook: "Two systems that have never met can still work together, as long as they agree on how to ask.",
    readTime: "3 min read",
    publishedAt: "2026-06-01",
    tags: ["Networking", "APIs"],
    body: [
      {
        heading: "The problem: systems that don't know each other",
        paragraphs: [
          "Your app needs weather data, or payment processing, or a map. It doesn't have direct access to the other company's database, and nor should it. It needs a well-defined, safe way to ask a question and get a predictable answer back, without knowing anything about how that system works internally.",
        ],
        sidenote:
          "You don't walk into the kitchen and start pulling ingredients yourself. You tell the waiter what you want, in the format the restaurant expects: off the menu, not off the fridge.",
      },
      {
        heading: "What an API request actually is",
        paragraphs: [
          "An API defines a contract: send a request shaped like this, to this address, and you'll get a response shaped like that. A request usually says what you want and any details it needs (an order); the response comes back with the result or an error (the plate, or “we're out of that”).",
        ],
        sidenote:
          "The menu is the API documentation. Ordering “table 12, the salmon, no onions” is the request. The plate that arrives is the response, or the waiter comes back and says they're out.",
      },
      {
        heading: "The catch: waiting, and things going wrong",
        paragraphs: [
          "Every request takes time, and every request can fail. The other system might be slow, down, or say no. Good systems plan for this: timeouts so you're not waiting forever, retries for the occasional hiccup, and sensible fallbacks when the answer just isn't coming.",
        ],
        sidenote:
          "Sometimes the kitchen is slammed and your order takes twenty minutes. A good waiter comes back to tell you that, instead of leaving you wondering if your order was ever heard at all.",
      },
    ],
  },
  {
    type: "explainer",
    slug: "concurrency",
    title: "Multiple chefs sharing one kitchen",
    concept: {
      label: "Concurrency",
      caption: "Many tasks making progress at once",
      Icon: GitForkIcon,
    },
    analogy: {
      label: "Multiple chefs sharing one kitchen",
      caption: "Same stove, different dishes",
      Icon: ChefHatIcon,
    },
    hook: "Concurrency isn't about doing everything at the exact same instant. It's about not blocking on any one thing.",
    readTime: "5 min read",
    publishedAt: "2026-06-15",
    tags: ["Concurrency", "Performance"],
    body: [
      {
        heading: "The problem: one slow task blocking everything else",
        paragraphs: [
          "If your system handles one task completely before starting the next, a single slow task (a big file upload, a slow network call) holds up every task behind it, even ones that have nothing to do with it and could easily run in the meantime.",
        ],
        sidenote:
          "One chef, one dish at a time: if the sauce needs to simmer for twenty minutes, everyone else's order waits, even the one that's just toast.",
      },
      {
        heading: "What concurrency actually means",
        paragraphs: [
          "Concurrency means multiple tasks make progress over the same stretch of time, by interleaving: working on one, stepping away while it waits on something (like the network or a disk), and picking up another in the meantime. This is different from true parallelism, where tasks run on genuinely separate CPU cores at the same instant; concurrency can happen even on a single core.",
        ],
        sidenote:
          "Multiple chefs, one kitchen: while one dish simmers untouched, that chef starts prepping the next order instead of standing there watching the pot.",
      },
      {
        heading: "The catch: shared resources",
        paragraphs: [
          "The moment two tasks touch the same shared thing (a variable, a file, a database row) at the same time, you risk a race condition: the outcome depends on timing you don't control, and it can be different every run. This is why concurrent systems need rules for who gets to touch what, and when.",
        ],
        sidenote:
          "Two chefs reaching for the same single stove burner at once, each assuming it's free. Someone's dish gets ruined, and which one depends on pure timing.",
      },
      {
        heading: "Why it's worth the complexity",
        paragraphs: [
          "Done well, concurrency means your system keeps serving other users while one slow operation is still in flight, instead of everyone waiting in a single-file line behind it.",
        ],
        sidenote:
          "A kitchen with three chefs sharing tasks sensibly gets vastly more tables fed per hour than one chef working alone, even with the same one stove.",
      },
    ],
  },
  {
    type: "explainer",
    slug: "database-transactions",
    title: "A bank teller who won't let you leave mid-transfer",
    concept: {
      label: "Database Transactions",
      caption: "All of it happens, or none of it does",
      Icon: DatabaseIcon,
    },
    analogy: {
      label: "A bank teller who won't let you leave mid-transfer",
      caption: "The paperwork is never half-filed",
      Icon: LandmarkIcon,
    },
    hook: "Some operations can't be allowed to happen halfway. A transaction is the database's promise that they never will.",
    readTime: "8 min read",
    publishedAt: "2026-07-10",
    tags: ["Databases", "Reliability"],
    body: [
      {
        heading: "The problem: work that can't be allowed to happen halfway",
        paragraphs: [
          "Picture a transfer of $500 from your checking account to your savings account. Under the hood, that's at least two separate writes to the database: subtract $500 from checking, then add $500 to savings. Now picture the exact wrong moment for the server to crash, the network to drop, or the process to be killed: right after the first write commits, and before the second one runs. If nothing guards against this, you've just made $500 disappear. Not stolen, not misplaced, just gone, because the system did the first half of a two-part promise and never got to the second half. Multiply this by every transfer happening across every account at a bank, every second, and it stops being a rare edge case and becomes a near-certainty that it will eventually happen to someone, on some server, at some unlucky instant.",
          "This shape of problem is everywhere once you start looking for it, and it's rarely confined to banking. An e-commerce checkout has to charge the customer's card and decrement the item's inventory count. Charge them without reserving the item, and you've sold something you don't have; reserve the item without the charge going through, and you've given away inventory for free. A signup flow creates a user record, provisions their account, and sends a welcome email. Crash between the first two steps and you've got a user who exists but can't log in, silently broken until someone notices and can't figure out why. In every one of these cases, the code that looks correct on a whiteboard, the \"first do this, then do that\" version, is quietly assuming that the computer will either finish everything or fail before starting anything, and computers don't actually offer that guarantee for free.",
        ],
        sidenote:
          "A bank teller doesn't hand you a debit receipt and then wander off to lunch before finishing the credit side of your transfer. The whole transfer happens, completely, before you're told it's done, or none of it happens at all, and you're told that instead.",
      },
      {
        heading: "What a transaction actually guarantees",
        paragraphs: [
          "A transaction is a boundary you draw around a group of operations, telling the database: treat everything inside this boundary as one indivisible unit. You open the boundary (BEGIN), perform however many reads and writes the operation actually needs, and then close it in one of exactly two ways: COMMIT, which makes every change inside permanent and visible all at once, or ROLLBACK, which undoes everything inside as if none of it had ever been attempted, including the parts that technically already ran. There is no third outcome where some of it stuck and some of it didn't. That's the entire contract, and it's a remarkably strong one: from the outside, a transaction either happened or it didn't, with nothing observable in between.",
          "Making that promise real is genuinely hard work, and it's worth knowing roughly what the database is doing on your behalf so the guarantee doesn't feel like magic. Before it touches the actual data files, it writes down, to a durable log, exactly what it's about to do and why. This is usually called a write-ahead log. If the process dies mid-transaction, the database doesn't have to guess what state it was left in; on restart, it reads that log, finishes replaying any transaction that had fully committed before the crash, and discards any partial work from transactions that hadn't. You never write this recovery logic yourself. It's the entire reason the transaction boundary is worth drawing: all of that bookkeeping happens once, correctly, inside the database, instead of being reinvented, and inevitably gotten wrong in some rare edge case, inside every application that uses it.",
        ],
        sidenote:
          "The teller doesn't tell you \"transfer complete\" and then go fill out the paperwork later from memory. The paperwork, the actual record of what happened, is what makes it real, and it's filed as part of the transfer itself, not as an afterthought.",
      },
      {
        heading: "Isolation: pretending you're the only one in the room",
        paragraphs: [
          "Real databases don't process one transaction at a time and then politely wait for the next customer. Hundreds or thousands of transactions are often in flight simultaneously, reading and writing overlapping data. Isolation is the guarantee that, even so, your transaction behaves as though it had the entire database to itself for the duration it runs. Without it, you get what are usually called read phenomena: a dirty read, where you see a change from another transaction that hasn't even committed yet and might still be rolled back; a non-repeatable read, where you query the same row twice in one transaction and get two different answers because someone else's committed change slipped in between; a phantom read, where a whole new row matching your filter appears between two identical queries in the same transaction. Each of these can quietly corrupt logic that assumed the data underneath it was holding still.",
          "The catch is that perfect isolation and high throughput pull in opposite directions. The strictest isolation level effectively serializes conflicting transactions, making them queue up and wait for each other, which is exactly what protects you from every one of those read phenomena, but it also means less real concurrency, more waiting, and more chances for one slow transaction to hold up several others behind it. This is why databases expose multiple isolation levels instead of forcing the strictest one on every query: a reporting query that can tolerate a slightly stale, consistent-enough view of the data doesn't need to pay the same cost as a transaction that's moving real money, and being able to choose the weaker guarantee where it's safe is what keeps the whole system fast.",
        ],
        sidenote:
          "A strict teller won't let another customer even glance at your paperwork while your transfer is mid-flight. A more relaxed one might let someone peek at yesterday's already-settled balance while you're being helped. Faster for everyone, as long as nobody needs to see your transfer itself while it's still happening.",
      },
      {
        heading: "Durability: surviving the crash right after you hit save",
        paragraphs: [
          "Durability is the guarantee that once a transaction has committed, once the database has told you it succeeded, that result survives, even if the power is cut to the server one millisecond later. This sounds like it should be obvious, but it's a genuinely deliberate engineering property, not a side effect of writing data to disk. A commit doesn't return \"success\" to you until the write-ahead log entry for that transaction has actually been flushed to durable storage; if the database acknowledged success before that flush and the machine lost power in between, you'd have a system that lies to you about what it saved, which is arguably worse than one that's simply slow.",
          "On restart after any crash, a database doesn't trust the last-known state of its data files at face value. It replays its write-ahead log from the last consistent checkpoint, reapplying every transaction that had fully committed and discarding every transaction that hadn't. This is exactly what lets the durability guarantee hold up against the messiest failure mode there is: not a clean shutdown, but the plug being pulled at the worst possible instant. You never have to ask \"did that actually save, though?\" after the fact. Durability is the reason that question already has a guaranteed answer.",
        ],
        sidenote:
          "The teller doesn't wait until the end of their shift to file today's transfers. Each one is filed the moment it's finalized, specifically so that if the building loses power that night, your transfer already happened, on paper and permanently, regardless of what happens to the building.",
      },
      {
        heading: "The cost: why you don't wrap everything in one giant transaction",
        paragraphs: [
          "Given how strong these guarantees are, it's tempting to reach for one big transaction around anything that touches multiple pieces of data. The cost is concurrency: a transaction typically holds locks on the rows it touches until it commits or rolls back, and the longer it stays open, the longer everything else waiting on those same rows has to sit in line behind it. A transaction that does one fast, well-scoped job returns and releases its locks quickly; a transaction that tries to do everything, including slow work like calling an external API or waiting on user input in the middle, can end up blocking a meaningful slice of your whole system for as long as it stays open.",
          "It gets harder still the moment a single logical operation spans more than one database, which is the normal case in a microservice architecture, where the order service, the inventory service, and the payments service each own their own data and their own database. A transaction, in the classic sense, doesn't stretch across that boundary; there's no single write-ahead log shared between separate services. This is exactly why distributed systems tend to trade strict, single-transaction atomicity for patterns like sagas: a sequence of local transactions, each in its own service, paired with an explicit compensating action for every step, so that if step three fails, steps one and two are deliberately undone rather than assumed to roll back automatically. It's more code to write, and it asks you to think honestly about what \"undo\" means for each step, but it's the accepted price of a system built from several databases instead of one.",
        ],
        sidenote:
          "One teller, handling your whole transfer themselves, can make the all-or-nothing promise easily. Once the job is split across tellers at three different bank branches, each keeping their own separate ledger, \"all or nothing\" stops being something any single teller can promise alone. Someone has to explicitly call the other branches and say \"undo that\" if one part fails.",
      },
    ],
  },
];

export const articlePosts: ArticlePost[] = [
  {
    type: "article",
    slug: "boring-technology",
    title: "Why I default to boring technology",
    topic: "Engineering practice",
    Icon: PenLineIcon,
    hook: "The newest framework is rarely the risk that matters. The unknowns you can't see yet are.",
    readTime: "4 min read",
    publishedAt: "2026-06-22",
    tags: ["Engineering Practice"],
    body: [
      {
        heading: "The allure of the new thing",
        paragraphs: [
          "Every project has a moment where a shiny new tool looks like it'll solve everything: a database, a framework, a queue you read about last week. It's tempting, and sometimes it's right. But most of the time, the pitch is measured against an imagined best case, not against how it behaves at 2am when it breaks in a way nobody's documented yet.",
        ],
      },
      {
        heading: "What \"boring\" actually buys you",
        paragraphs: [
          "Boring technology has already had its surprising failure modes discovered by someone else, written up, and fixed or worked around. That's not a lack of ambition. It's a transfer of risk away from your project and onto the years of production use that came before you. The interesting part of your system should be the product, not the plumbing.",
        ],
      },
      {
        heading: "When it's worth the risk",
        paragraphs: [
          "New tools earn their place when they remove a category of problem entirely, not just when they're more pleasant to write. If the boring option genuinely can't do the job, that's a real reason. \"It's more fun\" isn't. Save that appetite for the parts of the system only you are building.",
        ],
      },
    ],
  },
  {
    type: "article",
    slug: "code-reviews-people-read",
    title: "Notes on writing code reviews people actually read",
    topic: "Engineering practice",
    Icon: MessageSquareIcon,
    hook: "Most review comments get skimmed, not read. Here's what changes that.",
    readTime: "3 min read",
    publishedAt: "2026-07-02",
    tags: ["Engineering Practice", "Career"],
    body: [
      {
        heading: "The problem with most reviews",
        paragraphs: [
          "A review that's a wall of nitpicks (semicolons, naming, formatting a linter should have caught) trains people to skim your comments instead of reading them. By the time you leave a comment that actually matters, it's buried in the same tone as the trivial ones.",
        ],
      },
      {
        heading: "Lead with intent, not nitpicks",
        paragraphs: [
          "Say what you think the code is trying to do, and whether it does that safely, for the reader six months from now, not just for this PR. Everything else is secondary. If the intent and the safety are solid, most of the smaller stuff can be a suggestion, not a blocker.",
        ],
      },
      {
        heading: "Disagree in a way that invites a reply",
        paragraphs: [
          "Phrase pushback as a question you'd genuinely want answered, such as \"what happens if this runs twice?\", rather than a verdict. It gets you the same outcome when you're right, and it gets you corrected quickly when you're not, instead of the author quietly resenting a comment they disagreed with but didn't feel safe contesting.",
        ],
      },
    ],
  },
  // TEMPLATE ENTRY: demonstrates image/video embeds in an article body.
  // Replace the client, numbers, and media placeholders with a real case
  // study (and real screenshots/recordings) before launch.
  {
    type: "article",
    slug: "checkout-redesign-case-study",
    title: "Case study: rebuilding a client's checkout flow",
    topic: "Case study",
    Icon: LayoutDashboardIcon,
    hook: "A five-step checkout was quietly losing customers at step three. Here's what it looked like to fix it.",
    readTime: "6 min read",
    publishedAt: "2026-07-14",
    tags: ["Case Study", "Product Design"],
    body: [
      {
        heading: "The problem: a checkout people abandoned",
        paragraphs: [
          "The client's analytics showed the same pattern every week: plenty of people adding items to their cart, far fewer finishing the purchase. The checkout itself was a five-step form spread across five separate pages (contact info, shipping address, shipping method, payment, and a final review) and the drop-off numbers made it obvious that most people never made it past step three.",
        ],
        media: {
          type: "image",
          alt: "Screenshot of the original five-step checkout, showing the shipping method page",
          caption: "The original checkout: five separate pages before you could pay.",
        },
      },
      {
        heading: "Watching real users get stuck",
        paragraphs: [
          "Before redesigning anything, we sat in on a handful of recorded sessions of real customers checking out. The pattern was consistent: people would fill in their address, hit next, and then hesitate on the shipping method page. Not because the options were confusing, but because they'd lost track of how many steps were left and whether the price they'd been quoted was still accurate.",
        ],
        media: {
          type: "video",
          caption: "A session recording of a customer pausing at the shipping step before leaving.",
        },
      },
      {
        heading: "What changed",
        paragraphs: [
          "The fix wasn't cleverer copy on the shipping page. It was removing the uncertainty entirely. We collapsed all five steps into a single scrollable page with a running order summary pinned to the side, so the total price and item list were visible no matter which section someone was filling in. Nothing about the underlying data collection changed; only how much of it was hidden behind a click at any given moment.",
        ],
        media: {
          type: "image",
          alt: "Screenshot of the redesigned single-page checkout with an order summary sidebar",
          caption: "The redesign: one page, with the running total always visible.",
        },
      },
      {
        heading: "The result",
        paragraphs: [
          "Checkout completion improved within the first week of launch, and stayed improved. This wasn't a novelty bump that faded once people got used to a new layout. The lesson that generalized well beyond this one project: a lot of what looks like a copywriting or design problem is actually an uncertainty problem, and showing people where they stand fixes more of it than better wording ever does.",
        ],
      },
    ],
  },
];

export const entries: BlogEntry[] = [...explainerPosts, ...articlePosts];

export function getEntryBySlug(slug: string) {
  return entries.find((entry) => entry.slug === slug);
}
