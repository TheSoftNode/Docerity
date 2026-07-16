import { ImageResponse } from "next/og";

export const alt = "Tech Explainers — Docerity";
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
          background: "#f3f1ea",
          color: "#0b1330",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#c2660a",
            fontWeight: 600,
          }}
        >
          Tech Explainers
        </div>

        <div
          style={{
            marginTop: 32,
            fontSize: 58,
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 950,
          }}
        >
          Complex ideas, explained through things you already know.
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            gap: 16,
          }}
        >
          {["Caching", "Load Balancing", "Concurrency"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(11,19,48,0.15)",
                fontSize: 22,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
