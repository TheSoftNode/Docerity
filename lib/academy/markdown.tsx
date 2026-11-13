import type { ReactNode } from "react";

/**
 * Lesson notes: a small, safe subset of Markdown rendered straight to React
 * elements, never through innerHTML. Headings (## and ###), paragraphs,
 * bulleted and numbered lists, fenced code, `inline code`, **bold**,
 * *italic* and [links](https://…) (http and https only).
 */

type Block =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; lang: string; code: string };

export function parseNotes(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) body.push(lines[index++]);
      index += 1;
      blocks.push({ kind: "code", lang: fence[1], code: body.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length === 2 ? 2 : 3, text: heading[2].trim() });
      index += 1;
      continue;
    }
    const bullet = /^\s*[-*]\s+/;
    const number = /^\s*\d+\.\s+/;
    if (bullet.test(line) || number.test(line)) {
      const ordered = number.test(line);
      const pattern = ordered ? number : bullet;
      const items: string[] = [];
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(lines[index].replace(pattern, "").trim());
        index += 1;
        /* A wrapped line continues the item before it. */
        while (index < lines.length && /^\s{2,}\S/.test(lines[index]) && !bullet.test(lines[index]) && !number.test(lines[index])) {
          items[items.length - 1] += ` ${lines[index].trim()}`;
          index += 1;
        }
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }
    const text: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^```/.test(lines[index]) && !/^#{2,3}\s/.test(lines[index]) && !bullet.test(lines[index]) && !number.test(lines[index])) {
      text.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ kind: "paragraph", text: text.join(" ") });
  }
  return blocks;
}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyBase}-${n++}`;
    if (match[1]) {
      out.push(
        <code key={key} className="rounded-md bg-[var(--ld-paper-2)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--ld-deep)]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (match[2]) {
      out.push(
        <strong key={key} className="font-semibold text-[var(--ld-ink)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (match[3]) {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = match[5];
      const external = /^https?:/.test(href);
      out.push(
        <a
          key={key}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-semibold text-[var(--ld-deep)] underline decoration-[var(--ld-accent)] decoration-2 underline-offset-4"
        >
          {label}
        </a>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** The notes, laid out for reading: a comfortable measure, code on a dark panel. */
export function LessonNotes({ source }: { source: string }) {
  const blocks = parseNotes(source);
  if (!blocks.length) return null;
  return (
    <div className="max-w-[68ch] text-[16.5px] leading-[1.75] text-[var(--ld-text-2)]">
      {blocks.map((block, index) => {
        const key = `b${index}`;
        if (block.kind === "heading") {
          return block.level === 2 ? (
            <h2 key={key} className="ld-display mt-9 mb-3 text-[26px] leading-tight font-bold tracking-[-0.025em] text-[var(--ld-ink)] first:mt-0">
              {inline(block.text, key)}
            </h2>
          ) : (
            <h3 key={key} className="mt-7 mb-2 text-[19px] font-semibold text-[var(--ld-ink)]">
              {inline(block.text, key)}
            </h3>
          );
        }
        if (block.kind === "code") {
          return (
            <pre
              key={key}
              className="my-5 overflow-x-auto rounded-[16px] bg-[#0b1433] px-5 py-4 font-mono text-[13.5px] leading-[1.7] text-[#dfe6ff]"
            >
              <code>{block.code}</code>
            </pre>
          );
        }
        if (block.kind === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={key} className={`my-4 grid gap-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"} marker:text-[var(--ld-accent)]`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  {inline(item, `${key}-${itemIndex}`)}
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={key} className="my-4">
            {inline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}
