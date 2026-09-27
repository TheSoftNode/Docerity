import { WorkProcessView } from "@/components/sections/work-program/work-process-view";
import { getGroup } from "@/lib/content/blocks/source";
import type { ProcessStepView } from "@/lib/content/blocks/views";

/**
 * The process rail, read from the editable content.
 *
 * A Server Component in front of a Client one: the rail animates a pulse along
 * itself, so it runs in the browser, and the steps are read during the render
 * and handed down as plain data with the icon as a registry name.
 */
async function WorkProcess() {
  const process = await getGroup<ProcessStepView[]>("services", "process");

  return <WorkProcessView process={process} />;
}

export { WorkProcess };
