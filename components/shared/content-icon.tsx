import { createElement } from "react";

import { iconFor } from "@/lib/content/icons";

/**
 * Renders one of the content icons by its stored name.
 *
 * `createElement` rather than assigning `iconFor(name)` to a capitalised local
 * and rendering it as JSX. That pattern is what `react-hooks/static-components`
 * warns about, and the warning is usually right: a component built during render
 * is a new type each time, so React unmounts and remounts it and any state
 * inside is lost.
 *
 * It does not apply here, because `iconFor` looks a name up in a frozen registry
 * and returns a reference to a component that already exists. The lint rule
 * cannot see the difference, and rather than silence it in every caller, the
 * lookup lives in this one component and everything else passes a string.
 */
function ContentIcon({
  name,
  className,
  strokeWidth,
}: {
  name: string | null | undefined;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(iconFor(name), { className, strokeWidth, "aria-hidden": true });
}

export { ContentIcon };
