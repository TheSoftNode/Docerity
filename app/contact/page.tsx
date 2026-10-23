import { pageMetadata } from "@/lib/content/blocks/metadata";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Contact } from "@/components/sections/contact/contact";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("contact");

/*
  `?type=` picks what the form opens on: the Apply buttons link with
  `type=mentorship`. Read on the server so the first paint already shows the
  right heading and fields, rather than switching after hydration.
*/
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const { type } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <Contact initialType={Array.isArray(type) ? type[0] : type} />
      </main>
      <SiteFooter />
    </div>
  );
}
