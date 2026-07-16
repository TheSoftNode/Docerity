import { Container } from "@/components/shared/container";
import { BlogConsole } from "@/components/sections/blog/blog-console";

function BlogIndex() {
  return (
    <section className="border-b border-border/80 bg-background">
      <div className="flex flex-col py-4 sm:py-6 lg:h-[calc(100dvh-var(--nav-h)+80px)]">
        <Container className="flex flex-1 flex-col lg:min-h-0">
          <BlogConsole />
        </Container>
      </div>
      <div aria-hidden className="h-24 sm:h-28" />
    </section>
  );
}

export { BlogIndex };
