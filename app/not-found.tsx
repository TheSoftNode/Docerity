import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { getGroup } from "@/lib/content/blocks/source";

export const metadata: Metadata = {
  title: "Page not found",
};

type NotFoundCopy = { eyebrow: string; title: string; lede: string; primaryLabel: string; secondaryLabel: string };

/* The words are edited in the admin (Small pages). */
export default async function NotFound() {
  const copy = await getGroup<NotFoundCopy>("pages", "notFound");

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative flex items-center overflow-hidden border-b border-border/80 bg-background py-16 sm:min-h-[calc(100dvh-var(--nav-h))] sm:py-0">
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[16rem] leading-none font-medium text-foreground/[0.03] select-none sm:text-[26rem]"
          >
            404
          </span>

          <Container className="relative">
            <div className="mx-auto max-w-lg text-center">
              <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                {copy.eyebrow}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {copy.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {copy.lede}
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Button
                  size="lg"
                  className="h-11 w-full px-6 text-sm sm:w-auto"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  {copy.primaryLabel}
                  <ArrowRightIcon />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full px-6 text-sm sm:w-auto"
                  nativeButton={false}
                  render={<Link href="/blog" />}
                >
                  {copy.secondaryLabel}
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
