import "server-only";

import { cache } from "react";

import { database } from "@/lib/config/env";
import { SHIPPED_BRIEFS, normaliseBriefs, type ProjectBrief } from "@/lib/academy/briefs";
import { findAcademyContent } from "@/lib/repositories/academy.repository";

export const BRIEFS_KEY = "project-briefs";

/** The project pool: the list edited in the admin if there is one, else the one that ships. */
export const getBriefs = cache(async (): Promise<ProjectBrief[]> => {
  if (!database.isConfigured) return SHIPPED_BRIEFS;
  try {
    const stored = await findAcademyContent(BRIEFS_KEY);
    const briefs = stored ? normaliseBriefs(stored.data) : [];
    return briefs.length ? briefs : SHIPPED_BRIEFS;
  } catch {
    return SHIPPED_BRIEFS;
  }
});

export async function getBrief(id: string): Promise<ProjectBrief | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return null;
  return (await getBriefs()).find((brief) => brief.id === id) ?? null;
}
