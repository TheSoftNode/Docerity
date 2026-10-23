"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ExplorerState = {
  query: string;
  setQuery: (value: string) => void;
  /** "" for every network. */
  network: string;
  setNetwork: (value: string) => void;
  /** The slug of the contract whose page is open. */
  selected: string;
  setSelected: (value: string) => void;
};

const ExplorerContext = createContext<ExplorerState | null>(null);

/**
 * The explorer's shared state: the search, the network filter and the open
 * contract. The search bar in the hero, the tables, the contract page and the
 * networks grid at the foot of the page all read and set the same values.
 */
function ExplorerProvider({ initialSelected, children }: { initialSelected: string; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState("");
  const [selected, setSelected] = useState(initialSelected);
  const value = useMemo(() => ({ query, setQuery, network, setNetwork, selected, setSelected }), [query, network, selected]);
  return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
}

function useExplorer(): ExplorerState {
  const value = useContext(ExplorerContext);
  if (!value) throw new Error("useExplorer is only usable inside ExplorerProvider.");
  return value;
}

export { ExplorerProvider, useExplorer };
