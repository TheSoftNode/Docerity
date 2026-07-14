import Link from "next/link";

import { siteConfig } from "@/lib/config/site";
import { Container } from "@/components/shared/container";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/shared/social-icons";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          <Link
            href={siteConfig.socials.github}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href={siteConfig.socials.linkedin}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <LinkedinIcon className="size-4" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href={siteConfig.socials.x}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-4" />
            <span className="sr-only">X</span>
          </Link>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
