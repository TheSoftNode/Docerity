import { pageMetadata } from "@/lib/content/blocks/metadata";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { AiHero } from "@/components/sections/ai-page/ai-hero";
import { AiSystems } from "@/components/sections/ai-page/ai-systems";
import { AiCapabilities } from "@/components/sections/ai-page/ai-capabilities";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("ai");

/* The copy is edited in the admin; saving revalidates, and this is the
   ceiling on staleness if that never lands. */
export const revalidate = 300;

export default function AiPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <AiHero />
        <AiSystems />
        <AiCapabilities />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
