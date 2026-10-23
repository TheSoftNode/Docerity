import type { SectionHeading } from "@/lib/content/blocks/source";
import type { FounderView } from "@/lib/content/blocks/views";
import { pad } from "@/components/sections/blog-page/blog-content";

/** The files along the editor's tab bar. Only the README is this section; the
    other two are the sections below it, so the tabs go somewhere. */
const TABS = [
  { label: "README.md", href: null },
  { label: "CHANGELOG.md", href: "#changelog" },
  { label: "STACK", href: "#toolkit" },
] as const;

/**
 * The story, as the studio's README: the founder's paragraphs in an editor
 * pane, beside a `docerity.json` that says who, where and when. The cursor
 * at the end is the one touch of accent.
 */
function AboutStory({ heading, story, founder }: { heading: SectionHeading; story: string[]; founder: FounderView }) {
  if (story.length === 0) return null;
  const manifest = [
    ["founder", founder.name],
    ["role", founder.role],
    ["based", founder.based],
    ["hours", founder.hours],
  ].filter(([, value]) => value);

  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="mx-auto grid max-w-[1240px] items-start gap-[clamp(32px,5vw,88px)] px-4 py-[clamp(64px,8vw,112px)] sm:px-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:px-8">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">README</span>
            {heading.eyebrow}
          </p>
          <h2 id="story-title" className="ld-display max-w-[12ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
            {heading.title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}

          <figure className="mt-[30px] rounded-[20px] bg-[var(--ld-ink)] px-[22px] py-5 font-mono text-[13px] leading-[1.9] text-[var(--ld-paper)]">
            <figcaption className="mb-1.5 text-[var(--ld-muted-3)]">{"// docerity.json"}</figcaption>
            <span className="text-[var(--ld-muted-3)]">{"{"}</span>
            <dl>
              {manifest.map(([key, value], index) => (
                <div key={key} className="flex flex-wrap pl-[18px]">
                  <dt className="text-[var(--ld-tint)]">
                    &quot;{key}&quot;<span className="text-[var(--ld-muted-3)]">:&nbsp;</span>
                  </dt>
                  <dd className="text-[#8de3b6]">
                    &quot;{value}&quot;
                    {index < manifest.length - 1 ? <span className="text-[var(--ld-muted-3)]">,</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
            <span className="text-[var(--ld-muted-3)]">{"}"}</span>
          </figure>
        </div>

        <article
          aria-label="The story, in the founder's words"
          className="overflow-hidden rounded-3xl border border-[var(--ld-line)] bg-white shadow-[0_40px_80px_-60px_rgb(var(--ld-ink-rgb)/0.4)]"
        >
          <nav aria-label="Files" className="flex overflow-x-auto border-b border-[var(--ld-line)] bg-[#f7f8fb] font-mono text-[12.5px]">
            {TABS.map((tab) =>
              tab.href ? (
                <a key={tab.label} href={tab.href} className="shrink-0 px-[18px] py-[13px] text-[var(--ld-text-muted)] transition-colors hover:text-[var(--ld-ink)]">
                  {tab.label}
                </a>
              ) : (
                <span
                  key={tab.label}
                  aria-current="page"
                  className="shrink-0 border-t-2 border-r border-t-[var(--ld-accent)] border-r-[var(--ld-line)] bg-white px-[18px] py-[13px] text-[var(--ld-ink)]"
                >
                  {tab.label}
                </span>
              )
            )}
          </nav>
          <div className="px-[clamp(20px,3vw,44px)] pt-[30px] pb-9">
            <p aria-hidden="true" className="mb-[22px] font-mono text-sm text-[var(--ld-deep)]">
              # Where Docerity comes from
            </p>
            <ol>
              {story.map((paragraph, index) => {
                const last = index === story.length - 1;
                return (
                  <li key={index} className="grid grid-cols-[40px_minmax(0,1fr)] gap-2 pb-[26px] last:pb-0 sm:grid-cols-[48px_minmax(0,1fr)]">
                    <span aria-hidden="true" className={`ld-display text-[22px] font-extrabold ${last ? "text-[var(--ld-accent)]" : "text-[var(--ld-deep)]"}`}>
                      {pad(index + 1)}
                    </span>
                    <p className="text-[clamp(16.5px,1.35vw,19px)] leading-[1.72] text-[var(--ld-text-2)]">
                      {paragraph}
                      {last ? (
                        <span aria-hidden="true" className="ld-blink ml-1 inline-block h-[1.1em] w-[9px] translate-y-[3px] bg-[var(--ld-accent)]" />
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}

export { AboutStory };
