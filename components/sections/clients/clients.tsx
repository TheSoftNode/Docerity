import { ClientsView } from "@/components/sections/clients/clients-view";
import { getBlock } from "@/lib/content/blocks/source";
import type { LogoView } from "@/lib/content/blocks/views";

/**
 * The logo wall, read from the editable content rather than a file.
 *
 * A thin Server Component in front of a Client one, which is the shape every
 * animated section here takes now. The rows animate and track which card is
 * expanded, so they have to run in the browser; the content is read during the
 * render and handed down as plain data.
 */
async function Clients() {
  const clients = await getBlock("clients");

  return (
    <ClientsView
      organisations={clients.organisations as LogoView[]}
      ecosystems={clients.ecosystems as LogoView[]}
    />
  );
}

export { Clients };
