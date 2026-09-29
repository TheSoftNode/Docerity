import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Clients } from "@/components/sections/clients/clients";
import { Cta } from "@/components/sections/cta/cta";
import { ServicesHero } from "@/components/sections/services/services-hero";
import { ServicesLines } from "@/components/sections/services/services-lines";
import { pageMetadata } from "@/lib/content/blocks/metadata";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("services", "/services");

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ServicesHero />
        <ServicesLines />
        {/*
          The logo wall, between the list and the ask.

          This page claimed seven capabilities and offered no evidence for any
          of them, which is the thing a services page most has to supply: the
          reader's question after "do you do X?" is "have you actually done
          X?". Reused from the homepage rather than rebuilt, so it stays one
          editable list instead of two that drift.
        */}
        <Clients />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
