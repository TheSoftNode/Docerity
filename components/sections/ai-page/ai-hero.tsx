import { getHeading } from "@/lib/content/blocks/source";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { RouterConsole } from "@/components/sections/ai-page/router-console";

/**
 * The AI page's hero: a short statement, then the router for the visitor to
 * try. The idea behind most of the AI work here is routing each request to
 * the model that fits it, and trying it says that better than describing it.
 */
async function AiHero() {
  const heading = await getHeading("ai", "ai-hero");

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(ellipse_80%_55%_at_50%_100%,rgb(28_58_140/0.8),transparent_70%),var(--ld-ink)] pt-[124px] pb-[clamp(64px,8vw,104px)] text-[var(--ld-paper)]">
      <div className="doc-shell relative">
        <div className="grid items-end gap-[clamp(24px,4vw,64px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <p className="ld-up mb-[22px] font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              {heading.eyebrow}
            </p>
            <h1 className="ld-display ld-up ld-delay-1 text-[clamp(42px,5.4vw,84px)] leading-[0.92] font-extrabold tracking-[-0.055em] text-balance">
              <TitlePieces title={heading.title} />
            </h1>
          </div>
          <div className="ld-up ld-delay-2 pb-1.5">
            {heading.lede ? <p className="text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}
            <p className="mt-3 text-[15px] text-[var(--ld-muted-3)]">
              Try the idea behind most of it below, or{" "}
              <a href="#systems" className="border-b border-[rgb(var(--ld-tint-rgb)/0.5)] text-[var(--ld-paper)]">
                see the systems
              </a>
              .
            </p>
          </div>
        </div>

        <RouterConsole />
      </div>
    </section>
  );
}

export { AiHero };
