import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getGroup } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LegalDocument, type LegalText } from "@/components/sections/legal-page/legal-document";

export const generateMetadata = pageMetadata("privacy", "/privacy");

/* Edited in the admin under "Privacy & terms"; saving revalidates, and this
   is the ceiling on staleness if that never lands. */
export const revalidate = 3600;

/** The privacy policy, in the shared legal layout. No contact band: a legal page ends on its questions line. */
export default async function PrivacyPage() {
  const [text, site] = await Promise.all([getGroup<LegalText>("legal", "privacy"), getSiteSettings()]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <LegalDocument text={text} email={site.email} other={{ href: "/terms", label: "Terms of use" }} />
      </main>
      <SiteFooter />
    </div>
  );
}
