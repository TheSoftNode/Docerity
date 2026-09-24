import {
  BotIcon,
  CoinsIcon,
  LinkIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react";

export const projects = [
  {
    slug: "veriai",
    name: "VeriAI",
    badge: "MetaMask x Solana Hackathon Winner",
    description:
      "A decentralized verification platform providing cryptographic proof of AI-generated content authenticity, using Solana's oracle network to turn AI outputs into immutable, verifiable certificates.",
    tags: ["Solana", "Rust", "Anchor", "Oracles"],
    Icon: ShieldCheckIcon,
  },
  {
    slug: "metapilot",
    name: "MetaPilot",
    badge: "MetaMask x Solana Hackathon Winner",
    description:
      "A 4-program DeFi automation protocol (2,000+ lines of Rust) for autonomous DAO voting, reward claiming, AI-powered yield optimization, and token purchasing, so users never miss an on-chain opportunity.",
    tags: ["Solana", "Rust", "Anchor", "DeFi"],
    Icon: BotIcon,
  },
  {
    slug: "realpaytag",
    name: "RealPayTag Protocol",
    badge: "Enterprise-grade RWA system",
    description:
      "A multi-program system (9,700+ lines of Rust) for real-world asset tokenization: an asset registry, an identity system, an asset-backed stablecoin, and a payroll processor.",
    tags: ["Solana", "Rust", "RWA", "Stablecoins"],
    Icon: CoinsIcon,
  },
] as const;

export const ecosystems = [
  "Solana",
  "Stacks",
  "Hedera",
  "NEAR",
  "Stellar",
  "MetaMask",
  "Polkadot",
] as const;

export const capabilities: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Smart contract architecture",
    description:
      "Full-stack contract systems in Solidity, Clarity, and Rust, designed for security and long-term maintainability rather than a passing audit.",
    Icon: LinkIcon,
  },
  {
    title: "DeFi automation",
    description:
      "Autonomous protocols for voting, staking, yield optimization, and transaction scheduling that act on a user's behalf on-chain.",
    Icon: CoinsIcon,
  },
  {
    title: "Real-world asset tokenization",
    description:
      "Asset registries, identity systems, and asset-backed stablecoins for bringing off-chain value on-chain safely.",
    Icon: ShieldCheckIcon,
  },
  {
    title: "AI x Web3",
    description:
      "Where the two actually meet: AI-driven on-chain agents, and cryptographic verification of AI-generated content.",
    Icon: BotIcon,
  },
];

export const stack = [
  "Solidity",
  "Clarity",
  "Rust",
  "Anchor",
  "Ethers.js",
  "Wagmi",
  "Viem",
] as const;
