import Link from "next/link";

import { getSiteSettings } from "@/lib/content/blocks/site";
import { Container } from "@/components/shared/container";
import { BrandMark } from "@/components/shared/brand-mark";
import { SocialIcon } from "@/components/shared/social-icon";
import { FooterWave } from "@/components/layout/footer-wave";

async function Footer() {
  const site = await getSiteSettings();
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
                {site.name}
              </span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {site.footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Hidden entirely when there are none, rather than showing a
                row of dead marks. */}
            {site.socials.length > 0 ? (
              <div className="flex items-center gap-5">
                {site.socials.map((social) => (
                  <Link
                    key={social.url}
                    href={social.url}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SocialIcon label={social.label} className="size-4" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-2 border-t border-border/80 pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <p>
              &copy; {year} {site.name}. All rights reserved.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-foreground"
            >
              {site.email}
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}

export { Footer };
