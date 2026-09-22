import { ImageResponse } from "next/og";

import { getEntryBySlug } from "@/components/sections/blog/blog-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);

  const eyebrow = entry
    ? entry.type === "explainer"
      ? entry.concept.label
      : entry.topic
    : "Docerity";
  const title = entry
    ? entry.type === "explainer"
      ? entry.analogy.label
      : entry.title
    : "Not found";

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
          background: "#f5f7fb",
          color: "#070b16",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#5b6ef5",
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 62,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 24,
            color: "rgba(11,19,48,0.5)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#070b16",
            }}
          />
          Docerity &middot; Tech Explainers
        </div>
      </div>
    ),
    { ...size }
  );
}
