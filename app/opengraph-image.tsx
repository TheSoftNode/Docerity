import { ImageResponse } from "next/og";

export const alt = "Docerity — Engineering, Mentorship & Tech Explainers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "#0b1330",
          color: "#f3f1ea",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#c2660a",
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 600 }}>Docerity</div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 60,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Software shipped. Engineers grown. Ideas made simple.
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: "#98a2c4",
          }}
        >
          Engineering &middot; Mentorship &middot; Tech Explainers
        </div>
      </div>
    ),
    { ...size }
  );
}
