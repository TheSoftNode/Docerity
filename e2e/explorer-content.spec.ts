import { test, expect } from "@playwright/test";

import {
  contractEvents,
  contractFacts,
  contractId,
  explorerStats,
  isWinner,
  linesOf,
  methodName,
  networkCounts,
  searchContracts,
} from "@/components/sections/web3-page/explorer-content";
import { ecosystems, projects, stack } from "@/components/sections/web3/web3-data";

/*
  Unit tests for the Web3 page's explorer framing. Like home-content.spec.ts
  these never open a page.
*/
const contracts = projects.map(({ slug, name, badge, description, tags }) => ({ slug, name, badge, description, tags: [...tags] }));
const networks = [...ecosystems];

test.describe("what a listing says about itself", () => {
  test("ids are names, not addresses", () => {
    expect(contractId("RealPayTag Protocol")).toBe("dcr:realpaytag-protocol");
  });

  test("lines of code are read out of the description, or are absent", () => {
    expect(linesOf("A 4-program protocol (2,000+ lines of Rust)")).toBe(2000);
    expect(linesOf("A multi-program system (9,700+ lines of Rust)")).toBe(9700);
    expect(linesOf("No size stated here")).toBe(0);
  });

  test("a win is told apart from other recognition", () => {
    expect(isWinner("MetaMask x Solana Hackathon Winner")).toBe(true);
    expect(isWinner("Enterprise-grade RWA system")).toBe(false);
  });
});

test.describe("explorerStats", () => {
  test("counts only what is listed", () => {
    const stats = explorerStats(contracts, networks, [...stack]);
    expect(stats).toEqual([
      { label: "Contracts listed", value: String(contracts.length) },
      { label: "Networks", value: String(networks.length) },
      { label: "Lines of contract code", value: "11,700+" },
      { label: "Contract languages", value: "3" },
    ]);
  });

  test("leaves out a figure it cannot count", () => {
    expect(explorerStats([], [], []).map((stat) => stat.label)).toEqual(["Contracts listed", "Networks"]);
  });
});

test.describe("searchContracts", () => {
  test("matches words in the name, badge, description and tags", () => {
    expect(searchContracts(contracts, "payroll").map((contract) => contract.name)).toEqual(["RealPayTag Protocol"]);
    expect(searchContracts(contracts, "defi").map((contract) => contract.name)).toContain("MetaPilot");
    expect(searchContracts(contracts, "")).toHaveLength(contracts.length);
  });

  test("a network has to be one of the contract's tags", () => {
    expect(searchContracts(contracts, "", "Solana")).toHaveLength(contracts.length);
    expect(searchContracts(contracts, "", "Stacks")).toEqual([]);
  });
});

test.describe("a contract's page", () => {
  const metapilot = contracts.find((contract) => contract.name === "MetaPilot")!;

  test("facts are taken from its tags and description", () => {
    const facts = Object.fromEntries(contractFacts(metapilot, networks).map((fact) => [fact.label, fact.value]));
    expect(facts).toMatchObject({ Network: "Solana", Language: "Rust", Framework: "Anchor", Size: "2,000+ lines", Area: "DeFi" });
  });

  test("events are what the listing already records", () => {
    expect(contractEvents(metapilot, networks)).toEqual([
      { kind: "Award", text: "MetaMask x Solana Hackathon Winner" },
      { kind: "Deployed", text: "Live on Solana" },
      { kind: "Built", text: "2,000+ lines of Rust" },
    ]);
  });
});

test.describe("small rules", () => {
  test("method names", () => {
    expect(methodName("DeFi automation")).toBe("defiAutomation");
    expect(methodName("AI x Web3")).toBe("aiXWeb3");
  });

  test("network counts", () => {
    const counts = networkCounts(contracts, networks);
    expect(counts.find((entry) => entry.name === "Solana")?.count).toBe(contracts.length);
    expect(counts).toHaveLength(networks.length);
  });
});
