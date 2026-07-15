import Link from "next/link";

import { navLinks, siteConfig } from "@/lib/config/site";
import { Container } from "@/components/shared/container";
import { BrandMark } from "@/components/shared/brand-mark";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/shared/social-icons";
import { FooterWave } from "@/components/layout/footer-wave";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative -mt-[70px] sm:-mt-[100px]">
      <FooterWave />

      <div className="bg-card">
        <Container className="relative flex flex-col gap-6 py-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark className="size-8" />
              <span className="font-heading text-base font-medium text-foreground">
                {siteConfig.name}
              </span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

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
          </div>

          <div className="flex flex-col items-center gap-2 border-t border-border/80 pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <p>
              &copy; {year} {siteConfig.name}. All rights reserved.
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="transition-colors hover:text-foreground"
            >
              {siteConfig.email}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export { Footer };
