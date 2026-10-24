"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { ALL_FILTER } from "@/components/sections/projects/projects-content";

type FilterState = { filter: string; setFilter: (filter: string) => void };

const FilterContext = createContext<FilterState | null>(null);

/**
 * The projects page's active filter, shared by the hero's command bar and the
 * showcase below it.
 *
 * A context rather than a URL parameter: reading search params would make the
 * page render per request, and it is revalidated and served static now. The
 * hero and showcase are rendered on the server and passed in as children, so
 * wrapping them costs nothing in what ships to the browser.
 */
function ProjectsFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState(ALL_FILTER);
  const value = useMemo(() => ({ filter, setFilter }), [filter]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

function useProjectsFilter(): FilterState {
  const state = useContext(FilterContext);
  if (!state) throw new Error("useProjectsFilter must be used inside ProjectsFilterProvider.");
  return state;
}

export { ProjectsFilterProvider, useProjectsFilter };
