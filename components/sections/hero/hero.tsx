import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "8+", label: "Years shipping software" },
  { value: "40+", label: "Projects delivered" },
  { value: "60+", label: "Engineers mentored" },
] as const;

function Hero() {
  return (
    <section className="relative border-b border-border/80">
      <Container className="relative py-24 sm:py-28 lg:py-36">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          Engineering · Mentorship · Technical Writing
        </p>

        <h1 className="mt-6 max-w-3xl font-heading text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Docerity builds software, grows engineers, and makes hard
          ideas easy to hold.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A practice for teams that need production-ready systems,
          engineers who want real mentorship, and anyone who wants
          technical concepts explained without the fluff.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            className="h-11 px-6 text-sm"
            nativeButton={false}
            render={<Link href="#contact" />}
          >
            Start a project
            <ArrowRightIcon />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-sm"
            nativeButton={false}
            render={<Link href="#work" />}
          >
            See the work
          </Button>
        </div>

        <dl className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-border/80 pt-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-heading text-2xl font-medium text-foreground sm:text-3xl">
                {stat.value}
              </dd>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

export { Hero };
