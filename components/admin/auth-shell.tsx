import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";

/* Three of the studio's own shipped projects, fanned out behind the headline. */
const SHOTS = [
  { src: "/projects/crossflow.webp", className: "left-0 top-10 -rotate-[5deg] opacity-55" },
  { src: "/projects/neuraltradex.webp", className: "left-[16%] top-2.5 rotate-1 opacity-80" },
  { src: "/projects/eep.webp", className: "left-[30%] top-[70px] rotate-[5deg]" },
] as const;

/**
 * The frame for every page a signed-out person sees in the admin: sign in,
 * forgot password, choosing a new one, and accepting an invitation.
 *
 * On a wide screen, a navy panel on the left in the public site's language,
 * with real work from the projects page fanned out under the headline and the
 * footer's outlined wordmark at its foot; the form sits on paper to the right.
 * On a phone, only the form, with the mark above it.
 */
function AuthShell({
  children,
  back = { href: "/", label: "Back to the site" },
}: {
  children: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section
        aria-hidden
        className="relative hidden flex-col overflow-hidden bg-[#08102e] px-14 py-11 text-[#f4f5fa] lg:flex"
      >
        <div className="relative z-10 flex items-center gap-3">
          <BrandMark className="size-[34px]" />
          <span className="font-heading text-[22px] font-extrabold tracking-[-0.02em]">Docerity</span>
          <span className="border-l border-[rgb(244_245_250/0.2)] pl-3 text-[13px] text-[#9aa7cf]">Admin</span>
        </div>

        <p className="relative z-10 mt-14 max-w-[12ch] font-heading text-[clamp(40px,3.6vw,52px)] leading-none font-extrabold tracking-[-0.04em]">
          Everything behind the site, in one place.
        </p>
        <p className="relative z-10 mt-4 max-w-[28rem] text-[17px] leading-relaxed text-[#c4cbe3]">
          Enquiries, reviews, writing, projects and every page&apos;s words.
        </p>

        <div className="relative mt-10 min-h-[330px] flex-1">
          {SHOTS.map((shot) => (
            <div
              key={shot.src}
              className={`absolute w-[78%] overflow-hidden rounded-[14px] border border-[rgb(175_196_255/0.18)] bg-[#0b1438] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] ${shot.className}`}
            >
              <div className="flex h-[22px] items-center gap-1.5 bg-[#111d48] px-2.5">
                <i className="size-[7px] rounded-full bg-[rgb(244_245_250/0.25)]" />
                <i className="size-[7px] rounded-full bg-[rgb(244_245_250/0.25)]" />
                <i className="size-[7px] rounded-full bg-[rgb(244_245_250/0.25)]" />
              </div>
              <Image src={shot.src} alt="" width={1200} height={593} sizes="40vw" className="block h-auto w-full" />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-[linear-gradient(transparent,#08102e)]" />
        <span className="pointer-events-none absolute -bottom-14 left-10 font-heading text-[220px] leading-[0.8] font-extrabold tracking-[-0.06em] whitespace-nowrap text-transparent [-webkit-text-stroke:1.5px_rgb(175_196_255/0.14)]">
          docerity
        </span>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <ArrowLeftIcon className="size-4" />
            {back.label}
          </Link>
          <span className="flex items-center gap-2 lg:hidden">
            <BrandMark className="size-7" />
            <span className="font-heading text-lg font-extrabold tracking-[-0.02em]">Docerity</span>
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </section>
    </main>
  );
}

/** The heading and line above each form, the same on all four pages. */
function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <>
      <h1 className="font-heading text-[40px] leading-none font-extrabold tracking-[-0.04em] text-foreground">{title}</h1>
      {children ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{children}</p> : null}
    </>
  );
}

export { AuthShell, AuthHeading };
