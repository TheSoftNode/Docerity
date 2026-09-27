import { pageMetadata } from "@/lib/content/blocks/metadata";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { Web3Hero } from "@/components/sections/web3/web3-hero";
import { Web3Projects } from "@/components/sections/web3/web3-projects";
import { Web3Ecosystems } from "@/components/sections/web3/web3-ecosystems";
import { Web3Capabilities } from "@/components/sections/web3/web3-capabilities";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("web3");

export default function Web3Page() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Web3Hero />
        <Web3Projects />
        <Web3Ecosystems />
        <Web3Capabilities />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
