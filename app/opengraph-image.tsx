import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0b1220 0%, #111827 40%, #0f172a 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
          }}
        >
          Gatherly
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            fontWeight: 500,
            color: "rgba(255,255,255,0.86)",
            maxWidth: 960,
            lineHeight: 1.2,
          }}
        >
          Discover community events across Canada.
        </div>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {["Browse", "RSVP", "Host"].map((label) => (
            <div
              key={label}
              style={{
                fontSize: 22,
                padding: "10px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}

