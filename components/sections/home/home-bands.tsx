import { Fragment } from "react";

import { getBlock, getHeading } from "@/lib/content/blocks/source";
import type { LogoView } from "@/lib/content/blocks/views";
import { tracks } from "@/components/sections/home/home-data";

/**
 * Two crossed, scrolling bands between the hero and the rest of the page.
 *
 * The accent band names the organisations and the ecosystems from the same
 * editable lists the old logo wall used; the dark one behind it repeats the
 * three tracks. Names rather than logos, because a logo wall at this size is
 * a row of grey smudges, while names in the display face read as a statement.
 *
 * Each sequence is rendered twice and the track slides by half its own width,
 * which is what makes the loop seamless. The second copy is hidden from
 * assistive technology so the names are announced once.
 */
async function HomeBands() {
  const [clients, heading] = await Promise.all([getBlock("clients"), getHeading("clients", "clients")]);
  const names = [
    ...((clients.organisations ?? []) as LogoView[]),
    ...((clients.ecosystems ?? []) as LogoView[]),
  ].map((logo) => logo.name);
  const words = [...tracks.map((track) => track.label), "Ship"];

  return (
    <section
      id="clients"
      aria-label={heading.eyebrow || "Worked with"}
      className="relative h-[200px] overflow-hidden bg-[var(--ld-paper)] sm:h-[220px]"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-x-[5%] top-[66px] rotate-[2.5deg] overflow-hidden bg-[var(--ld-ink)] py-[18px] text-[var(--ld-tint)]"
      >
        <div className="ld-marquee-reverse flex w-max gap-10 font-mono text-[15px] tracking-[0.12em] whitespace-nowrap uppercase">
          {Array.from({ length: 8 }, (_, copy) =>
            words.map((word) => (
              <Fragment key={`${copy}-${word}`}>
                <span>{word}</span>
                <span>—</span>
              </Fragment>
            ))
          )}
        </div>
      </div>

      <div className="absolute -inset-x-[5%] top-[74px] -rotate-[2.5deg] overflow-hidden bg-[var(--ld-accent)] py-5 text-[var(--ld-ink)] shadow-[0_20px_40px_-20px_rgb(var(--ld-ink-rgb)/0.4)]">
        <ul className="ld-marquee ld-display flex w-max items-center gap-11 text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.02em] whitespace-nowrap">
          {[0, 1].map((copy) =>
            names.map((name) => (
              <li key={`${copy}-${name}`} aria-hidden={copy === 1} className="flex items-center gap-11">
                {name}
                <span aria-hidden="true">✦</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}

export { HomeBands };
