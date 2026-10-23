import type { StageView } from "@/lib/content/blocks/views";
import { splitEmphasis, type EmphasisPiece } from "@/components/sections/home/hero-content";

/*
  The mentorship page's scaffolding and pure helpers.

  Everything a visitor reads as content comes from the mentorship block in the
  admin. What lives here is the shape of the page: the code review the hero
  plays (a demonstration of the format, not a quote from anyone's work), the
  timings, and the small rules that turn editable text into the page. Pure, so
  it is tested without a browser (see e2e/mentorship-content.spec.ts).
*/

/** Where applying goes: the contact form with mentorship already chosen. */
export const APPLY_HREF = "/contact?type=mentorship";

/** How long each beat of the hero's review holds. */
export const REVIEW_BEAT_MS = 3100;

/** How long the path holds each stage before moving on. */
export const STAGE_INTERVAL_MS = 5200;

/** How long the team section lights each specialty. */
export const SPECIALTY_INTERVAL_MS = 3100;

export type DiffLine = {
  code: string;
  change?: "removed" | "added";
  /** The reviewer's comment, shown under this line. */
  note?: { text: string; state: "open" | "resolved" };
};

export type ReviewBeat = {
  status: string;
  tone: "neutral" | "warning" | "success";
  week: string;
  lines: DiffLine[];
  /** How far along the first stage this beat is, 0 to 1. */
  progress: number;
};

const COMMENT = "This fetch runs on every render, and nothing handles a failure. Load it on the server and let the page wait for it.";

const BEFORE = [
  "export function Orders({ userId }) {",
  "  const [orders, setOrders] = useState([])",
  "  fetch('/api/orders/' + userId)",
  "    .then((r) => r.json()).then(setOrders)",
  "  return <OrderList items={orders} />",
  "}",
];

const AFTER = [
  "export async function Orders({ userId }) {",
  "  const orders = await getOrders(userId)",
  "  return <OrderList items={orders} />",
  "}",
];

/**
 * The hero's review, in four beats: requested, changes asked for, the fix,
 * approved. It shows the format rather than describing it.
 */
export const REVIEW_BEATS: readonly ReviewBeat[] = [
  { status: "Review requested", tone: "neutral", week: "Week 03", progress: 0.22, lines: BEFORE.map((code) => ({ code })) },
  {
    status: "Changes requested",
    tone: "warning",
    week: "Week 03",
    progress: 0.25,
    lines: BEFORE.map((code, index) => ({
      code,
      change: index === 2 || index === 3 ? ("removed" as const) : undefined,
      note: index === 3 ? { text: COMMENT, state: "open" as const } : undefined,
    })),
  },
  {
    status: "Updated",
    tone: "neutral",
    week: "Week 03",
    progress: 0.3,
    lines: AFTER.map((code, index) => ({
      code,
      change: index < 2 ? ("added" as const) : undefined,
      note: index === 1 ? { text: COMMENT, state: "resolved" as const } : undefined,
    })),
  },
  {
    status: "Approved",
    tone: "success",
    week: "Week 04",
    progress: 0.4,
    lines: AFTER.map((code, index) => ({ code, change: index < 2 ? ("added" as const) : undefined })),
  },
];

/**
 * Which stage an audience usually starts at: the stage whose name matches
 * `startsAt`, ignoring case and spacing, or the first stage when it is blank
 * or names nothing on the path (a stage renamed after the audience was set).
 */
export function startStageIndex(startsAt: string | undefined, stages: readonly Pick<StageView, "label">[]): number {
  if (!startsAt) return 0;
  const want = startsAt.trim().toLowerCase().replace(/\s+/g, " ");
  const index = stages.findIndex((stage) => stage.label.trim().toLowerCase().replace(/\s+/g, " ") === want);
  return index === -1 ? 0 : index;
}

export type TitlePiece = EmphasisPiece & {
  /** A full stop at the end of the title, set apart so it can take the accent. */
  stop?: boolean;
};

/**
 * An editable title as the pieces the page sets: the `*emphasised*` part (or,
 * without asterisks, the last word) lit, and a closing full stop split off on
 * its own so it can carry the accent while the word before it does not.
 */
export function titlePieces(title: string): TitlePiece[] {
  const text = title.trim();
  let pieces: TitlePiece[] = splitEmphasis(text);
  if (!pieces.some((piece) => piece.emphasis)) {
    const at = text.lastIndexOf(" ");
    pieces =
      at === -1
        ? [{ text, emphasis: true }]
        : [
            { text: text.slice(0, at + 1), emphasis: false },
            { text: text.slice(at + 1), emphasis: true },
          ];
  }

  const last = pieces[pieces.length - 1];
  if (last && last.text.length > 1 && last.text.endsWith(".")) {
    return [...pieces.slice(0, -1), { ...last, text: last.text.slice(0, -1) }, { text: ".", emphasis: false, stop: true }];
  }
  return pieces;
}

/**
 * Where each specialty sits around the circle, as percentages of its box:
 * evenly spaced from the top, clockwise, on a ring that keeps the labels
 * inside the circle.
 */
export function orbitPositions(count: number, radius = 40): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(count, 1);
    return {
      x: Math.round((50 + radius * Math.cos(angle)) * 10) / 10,
      y: Math.round((50 + radius * Math.sin(angle)) * 10) / 10,
    };
  });
}

/** Where a station sits on the path, as percentages of the map. */
export type Station = { x: number; y: number; high: boolean; along: number };

/**
 * The stations along the path's curve. The curve rises and falls between
 * them, so the count decides the shape: stations alternate low and high and
 * are spread evenly from one end to the other.
 */
export function stationsFor(count: number): Station[] {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 50, y: 50, high: false, along: 100 }];
  return Array.from({ length: count }, (_, index) => {
    const high = index % 2 === 1;
    return {
      x: Math.round((5 + (90 * index) / (count - 1)) * 10) / 10,
      y: high ? 26.7 : 76.7,
      high,
      along: Math.round((100 * index) / (count - 1)),
    };
  });
}

/**
 * The SVG path through the stations, in the map's 1200 × 300 box: a smooth
 * curve whose control points sit halfway between neighbours, so it passes
 * through every station level.
 */
export function pathThrough(stations: readonly Station[]): string {
  if (stations.length === 0) return "";
  const point = (station: Station) => [Math.round(station.x * 12), Math.round(station.y * 3)] as const;
  const [x0, y0] = point(stations[0]);
  let d = `M${x0} ${y0}`;
  for (let index = 1; index < stations.length; index += 1) {
    const [px, py] = point(stations[index - 1]);
    const [x, y] = point(stations[index]);
    const mid = Math.round((px + x) / 2);
    d += ` C${mid} ${py} ${mid} ${y} ${x} ${y}`;
  }
  return d;
}

/** "3" → "03". */
export function pad(value: number): string {
  return String(value).padStart(2, "0");
}
