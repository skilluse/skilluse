import { ImageResponse } from "next/og"
import { config } from "~/config"

export const alt = config.site.name
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              color: "#05CE91",
              fontSize: "72px",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#ededed" }}>&gt;</span> {config.site.name}
          </div>
          <div
            style={{
              color: "#a1a1aa",
              fontSize: "32px",
              maxWidth: "800px",
              textAlign: "center",
            }}
          >
            {config.site.tagline}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            color: "#52525b",
            fontSize: "24px",
          }}
        >
          {config.site.url.replace("https://", "")}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
