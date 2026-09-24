import Image from "next/image";

import { skillGroups, tools } from "@/components/sections/about/about-data";

/*
  Grouped, then shown again as marks.

  The portfolio rendered 36 unordered keywords ending in "and even more",
  which conveys volume but nothing about depth. Categories let someone scan
  for the part they care about; the tool row gives the panel something to look
  at rather than a nineteenth line of text.
*/
function ToolkitPanel() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/40"
          >
            <h3 className="font-mono text-[0.6875rem] tracking-[0.16em] text-primary uppercase">
              {group.title}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
          Day to day
        </p>
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {tools.map((tool) => (
            <li key={tool.name}>
              {/* `title` and a visually hidden label together: the mark alone
                  names nothing to a screen reader, and a tooltip alone names
                  nothing to a keyboard. */}
              <span
                title={tool.name}
                className="group flex size-14 items-center justify-center rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/40"
              >
                <Image
                  src={tool.src}
                  alt=""
                  aria-hidden
                  width={28}
                  height={28}
                  className="size-7 object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="sr-only">{tool.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { ToolkitPanel };
