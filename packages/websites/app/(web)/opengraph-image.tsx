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
          backgroundColor: "#ffffff",
          fontFamily: "monospace",
        }}
      >
        <span
          style={{
            color: "#05CE91",
            fontSize: "72px",
            fontWeight: 700,
          }}
        >
          {config.site.name}
        </span>

        <p
          style={{
            color: "#71717a",
            fontSize: "28px",
            marginTop: "16px",
          }}
        >
          A Skills Registry for AI Agents
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
