import type { PostByline } from "@/components/sections/blog/blog-data";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Who wrote it: the contributor, with their title and link and a mark when
 * they are being mentored, or the team when nobody else is named.
 */
function Byline({ author }: { author?: PostByline }) {
  const name = author?.name ?? "The Docerity team";
  const title = author ? author.title : "Engineers who explain for a living";

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
      <span className="inline-flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid size-10 place-items-center rounded-full font-mono text-xs ${
            author ? "bg-[var(--ld-tint)] text-[var(--ld-ink)]" : "bg-[var(--ld-ink)] text-[var(--ld-paper)]"
          }`}
        >
          {author ? initials(author.name) : "D"}
        </span>
        <span>
          <span className="block text-[15px] font-semibold">
            {author?.link ? (
              <a href={author.link} rel="author noopener" target="_blank" className="underline-offset-4 hover:underline">
                {name}
              </a>
            ) : (
              name
            )}
          </span>
          {title ? <span className="text-[13px] text-[var(--ld-text-muted)]">{title}</span> : null}
        </span>
      </span>
      {author?.mentee ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-[#dfe6fb] px-3 py-1.5 text-[13px]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--ld-accent)]" />
          Docerity mentee
        </span>
      ) : null}
    </span>
  );
}

export { Byline };
