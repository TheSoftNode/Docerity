import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { CapabilityView, Web3ProjectView } from "@/lib/content/blocks/views";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { ExplorerProvider } from "@/components/sections/web3-page/explorer-context";
import { ExplorerTop } from "@/components/sections/web3-page/explorer-top";
import { ExplorerContracts } from "@/components/sections/web3-page/explorer-contracts";
import { ExplorerMethods } from "@/components/sections/web3-page/explorer-methods";
import { ExplorerNetworks } from "@/components/sections/web3-page/explorer-networks";
import { explorerStats, networkCounts } from "@/components/sections/web3-page/explorer-content";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("web3");

/* The copy is edited in the admin; saving revalidates, and this is the
   ceiling on staleness if that never lands. */
export const revalidate = 300;

/**
 * The Web3 page, as a block explorer: search, latest blocks and the
 * contracts, a contract's own page, what we build as contract methods, and
 * the supported networks, which filter the contracts above. Everything an
 * explorer would show is counted or read from the content in the admin.
 */
export default async function Web3Page() {
  const [hero, projectsHeading, capabilitiesHeading, ecosystemsHeading, projects, capabilities, ecosystems, stack] = await Promise.all([
    getHeading("web3", "web3-hero"),
    getHeading("web3", "web3-projects"),
    getHeading("web3", "web3-capabilities"),
    getHeading("web3", "web3-ecosystems"),
    getGroup<Web3ProjectView[]>("web3", "projects"),
    getGroup<CapabilityView[]>("web3", "capabilities"),
    getGroup<string[]>("web3", "ecosystems"),
    getGroup<string[]>("web3", "stack"),
  ]);

  const contracts = (projects ?? []).map(({ slug, name, badge, description, tags }) => ({ slug, name, badge, description, tags: [...tags] }));
  const networks = ecosystems ?? [];
  const hints = ["Search a contract, chain or tag…", ...networks.slice(0, 2).map((name) => `Try “${name}”`), "Try “DeFi”"];

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <ExplorerProvider initialSelected={contracts[0]?.slug ?? ""}>
          <ExplorerTop heading={hero} stats={explorerStats(contracts, networks, stack ?? [])} contracts={contracts} hints={hints} />
          {contracts.length > 0 ? <ExplorerContracts heading={projectsHeading} contracts={contracts} networks={networks} /> : null}

          <section aria-labelledby="methods-title" className="bg-white text-[var(--ld-ink)]">
            <div className="doc-shell grid items-start gap-[clamp(32px,5vw,80px)] py-[clamp(64px,8vw,104px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="lg:sticky lg:top-28">
                <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
                  <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">Write contract</span>
                  {capabilitiesHeading.eyebrow}
                </p>
                <h2 id="methods-title" className="ld-display max-w-[13ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                  {capabilitiesHeading.title}
                </h2>
                {capabilitiesHeading.lede ? (
                  <p className="mt-5 max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{capabilitiesHeading.lede}</p>
                ) : null}
                {stack && stack.length > 0 ? (
                  <>
                    <p className="mt-[26px] font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Toolchain</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {stack.map((tool) => (
                        <li key={tool} className="rounded-lg bg-[#eef1f8] px-3 py-1.5 font-mono text-[12.5px]">
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
              <ExplorerMethods capabilities={capabilities ?? []} />
            </div>
          </section>

          {networks.length > 0 ? (
            <section aria-labelledby="networks-title" className="bg-[#eef1f8] text-[var(--ld-ink)]">
              <div className="doc-shell py-[clamp(64px,8vw,104px)]">
                <div className="flex flex-wrap items-end justify-between gap-[22px]">
                  <div>
                    <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{ecosystemsHeading.eyebrow}</p>
                    <h2 id="networks-title" className="ld-display max-w-[15ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                      {ecosystemsHeading.title}
                    </h2>
                  </div>
                  {ecosystemsHeading.lede ? (
                    <p className="max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{ecosystemsHeading.lede}</p>
                  ) : null}
                </div>
                <ExplorerNetworks networks={networkCounts(contracts, networks)} />
              </div>
            </section>
          ) : null}
        </ExplorerProvider>
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
