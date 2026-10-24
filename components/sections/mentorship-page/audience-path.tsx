import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { AudienceView, StageView } from "@/lib/content/blocks/views";
import { AudiencePathView } from "@/components/sections/mentorship-page/audience-path-view";

/**
 * Who it is for, and the path, as one piece: picking a starting point marks
 * where that path usually begins. Read here; the two sections share their
 * state in the browser.
 */
async function AudiencePath() {
  const [audienceHeading, pathHeading, audiences, stages] = await Promise.all([
    getHeading("mentorship", "mentorship-audience"),
    getHeading("mentorship", "mentorship-path"),
    getGroup<AudienceView[]>("mentorship", "audiences"),
    getGroup<StageView[]>("mentorship", "stages"),
  ]);

  return (
    <AudiencePathView
      audienceHeading={audienceHeading}
      pathHeading={pathHeading}
      audiences={audiences ?? []}
      stages={stages ?? []}
    />
  );
}

export { AudiencePath };
