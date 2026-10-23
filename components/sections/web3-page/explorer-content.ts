/*
  The Web3 page's block-explorer framing, as pure functions.

  Everything an explorer would show is derived from the projects, networks
  and stack edited in the admin: no address, figure or event is invented. A
  contract's id is its name ("dcr:metapilot"), not a fake chain address; its
  size is read out of its own description ("2,000+ lines of Rust"); its
  events are what its badge and tags already say. Pure, so it is tested
  without a browser (see e2e/explorer-content.spec.ts).
*/

export type ListedContract = {
  slug: string;
  name: string;
  badge: string;
  description: string;
  tags: readonly string[];
};

/** The contract languages, as opposed to the rest of the toolchain. */
export const CONTRACT_LANGUAGES = ["Solidity", "Clarity", "Rust", "Move", "Motoko", "Cairo", "Vyper"] as const;

/** The frameworks an explorer would list beside the language. */
const FRAMEWORKS = ["Anchor", "Hardhat", "Foundry", "Clarinet"] as const;

/** A listing's id: its name, not an address it does not have. */
export function contractId(name: string): string {
  return `dcr:${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
}

/** Lines of code a description states ("9,700+ lines of Rust"), or 0. */
export function linesOf(description: string): number {
  const match = description.match(/(\d[\d,]*)\+?\s+lines\b/i);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

/** Whether a badge records a win. */
export function isWinner(badge: string): boolean {
  return /\bwinner\b|\bwon\b|\b1st\b|first place/i.test(badge);
}

/** "11,700" style. */
export function formatCount(value: number): string {
  return value.toLocaleString("en-GB");
}

export type Stat = { label: string; value: string };

/** The figures an explorer leads with, each counted from the listed work. */
export function explorerStats(contracts: readonly ListedContract[], networks: readonly string[], stack: readonly string[]): Stat[] {
  const lines = contracts.reduce((sum, contract) => sum + linesOf(contract.description), 0);
  const languages = stack.filter((tool) => (CONTRACT_LANGUAGES as readonly string[]).includes(tool)).length;
  const stats: Stat[] = [
    { label: "Contracts listed", value: String(contracts.length) },
    { label: "Networks", value: String(networks.length) },
  ];
  if (lines > 0) stats.push({ label: "Lines of contract code", value: `${formatCount(lines)}+` });
  if (languages > 0) stats.push({ label: "Contract languages", value: String(languages) });
  return stats;
}

/**
 * The contracts a search and a network filter leave: the query is matched
 * against the name, badge, description and tags, ignoring case; the network
 * has to be one of the contract's tags.
 */
export function searchContracts<T extends ListedContract>(contracts: readonly T[], query: string, network = ""): T[] {
  const needle = query.trim().toLowerCase();
  return contracts.filter((contract) => {
    if (network && !contract.tags.includes(network)) return false;
    if (!needle) return true;
    return [contract.name, contract.badge, contract.description, ...contract.tags].join(" ").toLowerCase().includes(needle);
  });
}

export type Fact = { label: string; value: string };

/** A contract's overview, as an explorer lays it out. */
export function contractFacts(contract: ListedContract, networks: readonly string[]): Fact[] {
  const network = contract.tags.find((tag) => networks.includes(tag));
  const language = contract.tags.find((tag) => (CONTRACT_LANGUAGES as readonly string[]).includes(tag));
  const framework = contract.tags.find((tag) => (FRAMEWORKS as readonly string[]).includes(tag));
  const lines = linesOf(contract.description);
  const area = contract.tags.filter((tag) => tag !== network && tag !== language && tag !== framework);
  return [
    { label: "Network", value: network ?? "—" },
    { label: "Language", value: language ?? "—" },
    { label: "Framework", value: framework ?? "—" },
    { label: "Size", value: lines ? `${formatCount(lines)}+ lines` : "Not stated" },
    { label: "Recognition", value: contract.badge || "—" },
    { label: "Area", value: area.join(", ") || "—" },
  ];
}

export type ContractEvent = { kind: "Award" | "Recognition" | "Deployed" | "Built"; text: string };

/** What happened to a contract, from what its listing already says. */
export function contractEvents(contract: ListedContract, networks: readonly string[]): ContractEvent[] {
  const events: ContractEvent[] = [];
  if (contract.badge) events.push({ kind: isWinner(contract.badge) ? "Award" : "Recognition", text: contract.badge });
  const network = contract.tags.find((tag) => networks.includes(tag));
  if (network) events.push({ kind: "Deployed", text: `Live on ${network}` });
  const lines = linesOf(contract.description);
  const language = contract.tags.find((tag) => (CONTRACT_LANGUAGES as readonly string[]).includes(tag));
  if (lines) events.push({ kind: "Built", text: `${formatCount(lines)}+ lines${language ? ` of ${language}` : ""}` });
  else if (language) events.push({ kind: "Built", text: `In ${language}` });
  return events;
}

/** A capability as a method name: "DeFi automation" → "defiAutomation". */
export function methodName(title: string): string {
  const words = title
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words
    .map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join("");
}

/** How many listed contracts carry each network. */
export function networkCounts(contracts: readonly ListedContract[], networks: readonly string[]): { name: string; count: number }[] {
  return networks.map((name) => ({ name, count: contracts.filter((contract) => contract.tags.includes(name)).length }));
}
