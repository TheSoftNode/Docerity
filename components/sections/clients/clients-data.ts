/*
  Two honest groupings rather than one "clients" wall.

  The portfolio showed blockchains and companies in a single row of logos
  under "Trusted by Industry Leaders", which overstates the blockchains —
  Stacks is not a client, it is a protocol the work was built on. Splitting
  them says more, not less: one row is who paid for the work, the other is
  the ground it was built on, and neither needs a caveat.
*/

export type Logo = {
  name: string;
  src: string;
  /** Where this logo shows up in the work, so the row is checkable. */
  context: string;
};

export const organisations: Logo[] = [
  { name: "HitoAI", src: "/clients/hitoai.webp", context: "Full-stack development lead" },
  { name: "ALX", src: "/clients/alx.webp", context: "Software engineering, then contract" },
  { name: "Biasadra", src: "/clients/biasadra.webp", context: "Platform build" },
];

export const ecosystems: Logo[] = [
  { name: "Stacks", src: "/clients/stacks.webp", context: "StackTip, YieldNexus" },
  { name: "Hedera", src: "/clients/hedera.webp", context: "TalentChainPro" },
  { name: "NEAR", src: "/clients/near.webp", context: "NeuralTradeX" },
  { name: "Stellar", src: "/clients/stellar.webp", context: "CrossFlow" },
  { name: "MetaMask", src: "/clients/metamask.webp", context: "MetaPilot, CryptoPilot, RealPayTag" },
  { name: "Docker", src: "/clients/docker.svg", context: "Across the infrastructure work" },
];
