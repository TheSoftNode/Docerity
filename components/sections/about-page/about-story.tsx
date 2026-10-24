import type { SectionHeading } from "@/lib/content/blocks/source";
import type { FounderView } from "@/lib/content/blocks/views";
import { StoryReader } from "@/components/sections/about-page/story-reader";
import { readingMinutes, storyBlocks } from "@/components/sections/about-page/about-content";

/** The files along the editor's tab bar. Only the README is this section; the
    other two are the sections below it, so the tabs go somewhere. */
const TABS = [
  { label: "README.md", href: null },
  { label: "CHANGELOG.md", href: "#changelog" },
  { label: "STACK", href: "#toolkit" },
] as const;

/**
 * The story, as the studio's README: the founder's story in an editor pane,
 * opening on its first paragraphs with the rest a click away, beside a
 * `docerity.json` that says who, where and when. The cursor at the end is
 * the one touch of accent. With no full story written, the short version
 * is shown whole.
 */
function AboutStory({
  heading,
  story,
  fullStory,
  founder,
}: {
  heading: SectionHeading;
  story: string[];
  fullStory?: { title: string; body: string };
  founder: FounderView;
}) {
  const written = fullStory?.body.trim() ?? "";
  const blocks = written ? storyBlocks(written) : story.map((text) => ({ kind: "paragraph" as const, text }));
  if (blocks.length === 0) return null;
  const manifest = [
    ["founder", founder.name],
    ["role", founder.role],
    ["based", founder.based],
    ["hours", founder.hours],
  ].filter(([, value]) => value);

  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,5vw,88px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
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
            <StoryReader title={written ? fullStory?.title ?? "" : "Where Docerity comes from"} blocks={blocks} minutes={readingMinutes(blocks.map((block) => block.text).join(" "))} />
          </div>
        </article>
      </div>
    </section>
  );
}

export { AboutStory };
