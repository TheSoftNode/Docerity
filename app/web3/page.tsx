import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { Web3Hero } from "@/components/sections/web3/web3-hero";
import { Web3Projects } from "@/components/sections/web3/web3-projects";
import { Web3Ecosystems } from "@/components/sections/web3/web3-ecosystems";
import { Web3Capabilities } from "@/components/sections/web3/web3-capabilities";

export const metadata: Metadata = {
  title: "Web3",
  description:
    "Hackathon-winning dApps and smart contract systems across Solana, Stacks, and beyond: DeFi automation, real-world asset tokenization, and AI x Web3.",
};

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
