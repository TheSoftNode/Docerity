import { isContentIconName } from "@/lib/content/icons";
import {
  blockFor,
  type Block,
  type BlockData,
  type BlockKey,
  type BlockRecord,
  type Field,
  type Group,
} from "@/lib/content/blocks/schema";

/**
 * Normalising and checking a section's content, against its own description.
 *
 * Shared by the editor and the save action. The editor uses it so somebody sees
 * a problem before a round trip; the action uses it because the editor can be
 * skipped entirely, and this one is a Server Action, which is a POST endpoint
 * like any other.
 *
 * Everything here is driven by the `Field` definitions rather than written per
 * section, so a new section gets validation by being described.
 */

export type BlockErrors = Record<string, string>;

/**
 * Keeps an image path to a file this site serves.
 *
 * Same rule as a post's body media, and here for the same reason: an absolute
 * URL would put somebody else's server in an `<img src>` on a public page,
 * which hands them every visitor's IP address and leaves the picture swappable
 * afterwards. Uploads produce a Cloudinary delivery URL, so those are allowed
 * explicitly rather than by pattern.
 */
const CLOUDINARY = /^https:\/\/res\.cloudinary\.com\/[A-Za-z0-9_-]+\//;

export function safeImagePath(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (CLOUDINARY.test(value)) return value;
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

function cleanValue(field: Field, raw: unknown): string | string[] {
  if (field.kind === "strings") {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean)
      /* A hard ceiling so a paste of a whole document cannot become 4,000
         list items and a page that takes a second to render. */
      .slice(0, 40)
      .map((entry) => entry.slice(0, 2000));
  }

  const value = typeof raw === "string" ? raw.trim() : "";

  if (field.kind === "image") return safeImagePath(value);
  /* An unknown icon name would resolve to the fallback icon at render time,
     which is a silent wrong answer. Blank is the honest version. */
  if (field.kind === "icon") return isContentIconName(value) ? value : "";

  return field.maxLength ? value.slice(0, field.maxLength) : value;
}

function cleanRecord(fields: Field[], raw: unknown): BlockRecord {
  const source = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const record: BlockRecord = {};
  for (const field of fields) {
    record[field.name] = cleanValue(field, source[field.name]);
  }
  return record;
}

/** True when every required field is blank, which is how a new row starts. */
function isEmpty(fields: Field[], record: BlockRecord): boolean {
  return fields.every((field) => {
    const value = record[field.name];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
}

export function cleanBlock(key: BlockKey, raw: unknown): BlockData {
  const block = blockFor(key);
  const source = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const data: BlockData = {};

  for (const group of block.groups) {
    if (group.kind === "strings") {
      const value = Array.isArray(source[group.name]) ? (source[group.name] as unknown[]) : [];
      data[group.name] = value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
        .slice(0, group.max)
        .map((entry) => entry.slice(0, group.long ? 4000 : 120));
      continue;
    }

    if (group.kind === "object") {
      data[group.name] = cleanRecord(group.fields, source[group.name]);
      continue;
    }

    const rows = Array.isArray(source[group.name]) ? (source[group.name] as unknown[]) : [];
    data[group.name] = rows
      .map((row) => cleanRecord(group.fields, row))
      /* A row somebody added and never filled in is dropped rather than
         rejected: adding one and changing your mind should not block a save
         of the twelve rows above it. */
      .filter((record) => !isEmpty(group.fields, record))
      .slice(0, group.max);
  }

  return data;
}

function missingFields(group: Group, fields: Field[], record: BlockRecord, where: string) {
  const problems: string[] = [];
  for (const field of fields) {
    if (!field.required) continue;
    const value = record[field.name];
    const blank = Array.isArray(value) ? value.length === 0 : !value;
    if (blank) problems.push(`${where} needs ${field.label.toLowerCase()}.`);
  }
  return problems;
}

/** Keyed by group name, so the editor can show each problem where it happened. */
export function validateBlock(key: BlockKey, data: BlockData): BlockErrors {
  const block: Block = blockFor(key);
  const errors: BlockErrors = {};

  for (const group of block.groups) {
    if (group.kind === "strings") {
      const value = (data[group.name] ?? []) as string[];
      if (value.length > group.max) {
        errors[group.name] = `Up to ${group.max}.`;
      }
      continue;
    }

    if (group.kind === "object") {
      const problems = missingFields(
        group,
        group.fields,
        (data[group.name] ?? {}) as BlockRecord,
        "This"
      );
      if (problems.length) errors[group.name] = problems[0];
      continue;
    }

    const rows = (data[group.name] ?? []) as BlockRecord[];

    if (group.min && rows.length < group.min) {
      errors[group.name] = `At least ${group.min} ${group.itemNoun}${group.min === 1 ? "" : "s"}.`;
      continue;
    }

    for (const [index, record] of rows.entries()) {
      const problems = missingFields(
        group,
        group.fields,
        record,
        `${group.itemNoun[0].toUpperCase()}${group.itemNoun.slice(1)} ${index + 1}`
      );
      if (problems.length) {
        errors[group.name] = problems[0];
        break;
      }
    }
  }

  return errors;
}
