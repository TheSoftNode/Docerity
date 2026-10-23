"use client";

import { cn } from "@/lib/utils";
import { useExplorer } from "@/components/sections/web3-page/explorer-context";

/**
 * The supported networks, as the explorer's network picker: choosing one
 * filters the contracts above to that chain and takes the reader back up to
 * them; choosing it again clears the filter.
 */
function ExplorerNetworks({ networks }: { networks: { name: string; count: number }[] }) {
  const { network, setNetwork } = useExplorer();

  return (
    <ul className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
      {networks.map(({ name, count }) => {
        const on = name === network;
        return (
          <li key={name}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => {
                setNetwork(on ? "" : name);
                if (!on) document.getElementById("contracts")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "flex w-full flex-col items-start gap-[26px] rounded-[18px] border p-4 text-left outline-none transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2",
                on ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "border-[var(--ld-line)] bg-white text-[var(--ld-ink)]"
              )}
            >
              <span className="flex w-full items-center justify-between">
                <span
                  aria-hidden="true"
                  className={cn(
                    "ld-display grid size-[34px] place-items-center rounded-[10px] text-[15px] font-extrabold",
                    on ? "bg-[var(--ld-deep)]" : "bg-[#dfe6fb] text-[var(--ld-deep)]"
                  )}
                >
                  {name.slice(0, 2)}
                </span>
                <span aria-hidden="true" className={cn("size-2 rounded-full", on ? "bg-[var(--ld-accent)]" : "bg-[#54D696]")} />
              </span>
              <span>
                <span className="block text-[15px] font-bold">{name}</span>
                <span className="mt-0.5 block font-mono text-[10.5px] uppercase opacity-65">{count > 0 ? `${count} listed` : "Supported"}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export { ExplorerNetworks };
