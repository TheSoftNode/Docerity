import Image from "next/image";

import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/section-kit";
import type { LogoView } from "@/lib/content/blocks/views";

/*
  A logo wall that earns its place, compactly.

  This was a grid of cards where one stayed expanded to show what the work
  was. That read well and took a third of a screen to say "we have worked with
  seven organisations" — on a homepage whose job is to get somebody to the
  projects, which are the real evidence.

  A marquee says the same thing in a strip. It also solves the problem the
  expanded card was there to solve, from the other end: a row that is moving
  cannot be scanned anyway, so the context belongs in the label rather than on
  screen, and the row stops when a pointer lands on it.

  No "use client": there is no state and no effect here. The movement is CSS
  keyframes, which means it also costs nothing per frame and starts before any
  JavaScript has loaded.
*/

/** Roughly one logo every six seconds, so a long row is not faster. */
const SECONDS_PER_LOGO = 6;

/*
  How many logos each half of the track has to hold.

  A marquee works by travelling half its own width, which only looks seamless
  while each half is at least as wide as the screen. Three organisations
  doubled is about 1100px: on any ordinary monitor the row simply ran out and
  left a gap, which is the loop visibly breaking rather than a subtle flaw.

  A pill is 176px plus its gap, so sixteen covers about 3000px — past the
  widest screen this is going to meet. Short lists repeat more times; long ones
  repeat once and are unaffected.
*/
const MIN_PER_HALF = 16;

function Logo({
  logo,
  "aria-hidden": ariaHidden,
}: {
  logo: LogoView;
  "aria-hidden"?: boolean;
}) {
  return (
    <li className="shrink-0" aria-hidden={ariaHidden || undefined}>
      <span
        /* The context is the whole point of having a logo wall rather than a
           list of names, and it has nowhere to be seen on a moving strip. It
           goes in the tooltip and the alt text instead of being dropped. */
        title={logo.context ? `${logo.name} — ${logo.context}` : logo.name}
        className="flex h-16 w-36 items-center justify-center rounded-xl border border-border bg-white px-5 transition-transform duration-300 hover:scale-[1.04] sm:h-[4.5rem] sm:w-44"
      >
        <Image
          src={logo.src}
          alt={logo.context ? `${logo.name} — ${logo.context}` : logo.name}
          width={160}
          height={48}
          sizes="176px"
          className="max-h-9 w-auto object-contain"
        />
      </span>
    </li>
  );
}

/**
 * One continuously travelling row.
 *
 * The list is rendered twice and the track moves exactly half its own width,
 * so the copy arrives where the original started and the loop has no seam.
 * The duplicate is `aria-hidden`, because a screen reader reading every logo
 * twice is worse than not hearing the row at all.
 */
function MarqueeRow({
  logos,
  direction,
}: {
  logos: LogoView[];
  direction: "left" | "right";
}) {
  if (logos.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(MIN_PER_HALF / logos.length));
  const half = Array.from({ length: repeats }, () => logos).flat();

  /* Timed off the original list, not the padded one, so a row of three and a
     row of six travel at the same speed rather than the short one racing. */
  const duration = `${Math.max(logos.length, 4) * SECONDS_PER_LOGO * repeats}s`;

  return (
    <div
      className={cn(
        "doc-marquee group relative flex overflow-hidden",
        /* Faded at both ends so logos arrive and leave rather than being cut
           off against the edge of the screen. */
        "[mask-image:linear-gradient(to_right,transparent,black_6rem,black_calc(100%-6rem),transparent)]"
      )}
    >
      <div
        className="doc-marquee-track flex w-max gap-3 pr-3"
        style={{
          animationName: direction === "left" ? "doc-marquee-left" : "doc-marquee-right",
          animationDuration: duration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {/* Only the first half is announced. A screen reader reading every
            logo twice — or, on a short list, sixteen times — is worse than
            not hearing the row at all. */}
        <ul className="flex shrink-0 gap-3 pr-3">
          {half.map((logo, index) => (
            <Logo key={`a-${index}-${logo.name}`} logo={logo} aria-hidden={index >= logos.length} />
          ))}
        </ul>
        <ul aria-hidden className="flex shrink-0 gap-3 pr-3">
          {half.map((logo, index) => (
            <Logo key={`b-${index}-${logo.name}`} logo={logo} aria-hidden />
          ))}
        </ul>
      </div>
    </div>
  );
}

function ClientsView({
  organisations,
  ecosystems,
}: {
  organisations: LogoView[];
  ecosystems: LogoView[];
}) {
  return (
    <section
      id="clients"
      className="relative overflow-hidden border-b border-border/80 bg-surface-step-a py-12 lg:py-16"
    >
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Worked with</Eyebrow>
          <p className="mt-3 text-pretty text-muted-foreground">
            The organisations the work was for, and the protocols it was built
            on. Two different things, kept apart on purpose.
          </p>
        </div>
      </Container>

      {/*
        Outside the Container on purpose: the rows run the full width of the
        screen and fade out at both edges, which is what makes a marquee read
        as passing through the page rather than sitting in a box on it.

        The two rows travel in opposite directions. One direction twice reads
        as a single belt that happens to have a gap in it; opposed, they read
        as two separate things, which is exactly what the sentence above says
        they are.
      */}
      <div className="relative mt-8 flex flex-col gap-3">
        <MarqueeRow logos={organisations} direction="left" />
        <MarqueeRow logos={ecosystems} direction="right" />
      </div>
    </section>
  );
}

export { ClientsView };
