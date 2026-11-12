"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { ALL_FILTER } from "@/components/sections/projects/projects-content";

type FilterState = {
  filter: string;
  setFilter: (filter: string) => void;
  /** Whether "Show all" has been pressed for the current filter. */
  showAll: boolean;
  setShowAll: (on: boolean) => void;
};

const FilterContext = createContext<FilterState | null>(null);

/* The address is the store: `?type=Web3&all=1`. Reading it through
   useSyncExternalStore keeps the server render (and hydration) on the
   default view, then picks up the address straight after, with no
   mismatch. */
const EVENT = "docerity:projects-query";
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}
const readQuery = () => window.location.search;
const serverQuery = () => "";

function writeQuery(update: (params: URLSearchParams) => void) {
  const url = new URL(window.location.href);
  update(url.searchParams);
  /* Replaced, not pushed: the back button leaves the page rather than
     stepping through every chip, but coming back to the page (from a
     project, say) finds the same filter and the same expanded list. */
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * The projects page's active filter and "Show all", shared by the hero and
 * the showcase, and kept in the address so they survive a trip to a project
 * and back, a reload, or a shared link. The page itself stays static.
 */
function ProjectsFilterProvider({ children }: { children: ReactNode }) {
  const query = useSyncExternalStore(subscribe, readQuery, serverQuery);
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const filter = params.get("type") || ALL_FILTER;
  const showAll = params.get("all") === "1";

  const setFilter = useCallback((next: string) => {
    writeQuery((p) => {
      if (next === ALL_FILTER) p.delete("type");
      else p.set("type", next);
      /* A new filter starts again from its first few. */
      p.delete("all");
    });
  }, []);
  const setShowAll = useCallback((on: boolean) => {
    writeQuery((p) => (on ? p.set("all", "1") : p.delete("all")));
  }, []);

  const value = useMemo(() => ({ filter, setFilter, showAll, setShowAll }), [filter, setFilter, showAll, setShowAll]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

function useProjectsFilter(): FilterState {
  const state = useContext(FilterContext);
  if (!state) throw new Error("useProjectsFilter must be used inside ProjectsFilterProvider.");
  return state;
}

export { ProjectsFilterProvider, useProjectsFilter };
