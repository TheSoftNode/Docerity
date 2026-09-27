import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getSiteSettings } from "@/lib/content/blocks/site";

export const alt = "Docerity · Engineering, Mentorship & Tech Explainers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card a shared link shows.
 *
 * It drew a plain blue rounded square where the mark goes, which was a
 * stand-in nobody replaced. The real mark is read off disk and inlined as a
 * data URI: `ImageResponse` renders on the server with no page around it, so
 * it cannot fetch a relative path, and giving it an absolute URL would have
 * the card's rendering depend on the site being reachable from itself.
 *
 * The headline and tagline come from the editable settings, so a card matches
 * the site rather than drifting from it.
 */
async function markDataUri(): Promise<string> {
  const file = await readFile(join(process.cwd(), "public", "docerity-logo.png"));
  return `data:image/png;base64,${file.toString("base64")}`;
}

export default async function Image() {
  const [site, mark] = await Promise.all([getSiteSettings(), markDataUri()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#070b16",
          color: "#f5f7fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src={mark} alt="" width={48} height={48} />
          <div style={{ fontSize: 32, fontWeight: 600 }}>{site.name}</div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 60,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 900,
            display: "flex",
          }}
        >
          Software shipped. Engineers grown. Ideas made simple.
        </div>

        <div style={{ marginTop: 28, fontSize: 26, color: "#98a4b8", display: "flex" }}>
          {site.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
