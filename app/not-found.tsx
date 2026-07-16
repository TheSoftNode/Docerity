import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRightIcon } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative flex min-h-[calc(100dvh-var(--nav-h))] items-center overflow-hidden border-b border-border/80 bg-background">
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[16rem] leading-none font-medium text-foreground/[0.03] select-none sm:text-[26rem]"
          >
            404
          </span>

          <Container className="relative">
            <div className="mx-auto max-w-lg text-center">
              <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                Lost signal
              </p>
              <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                This page doesn&apos;t exist.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                The link might be broken, or the page may have moved. Let&apos;s
                get you back on track.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="h-11 px-6 text-sm"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  Back to home
                  <ArrowRightIcon />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 text-sm"
                  nativeButton={false}
                  render={<Link href="/blog" />}
                >
                  Read the blog
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
