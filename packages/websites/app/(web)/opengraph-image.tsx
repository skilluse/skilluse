import { ImageResponse } from "next/og"
import { config } from "~/config"

export const alt = config.site.name
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

const ASCII_LOGO = ` ____  _    _ _ _ _   _
/ ___|| | _(_) | | | | |___  ___
\\___ \\| |/ / | | | | | / __|/ _ \\
 ___) |   <| | | | |_| \\__ \\  __/
|____/|_|\\_\\_|_|_|\\___/|___/\\___|`

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
          padding: "48px",
        }}
      >
        {/* Terminal window */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "1000px",
            border: "1px solid #27272a",
            backgroundColor: "#09090b",
          }}
        >
          {/* Terminal header - macOS style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 20px",
              borderBottom: "1px solid #27272a",
              backgroundColor: "#18181b",
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: "8px" }}>
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#eab308",
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  opacity: 0.7,
                }}
              />
            </div>
            <span style={{ color: "#71717a", fontSize: "16px", marginLeft: "8px" }}>
              skilluse.dev
            </span>
          </div>

          {/* Terminal content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "28px 32px",
              gap: "20px",
            }}
          >
            {/* ASCII Logo */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", fontSize: "18px" }}>
                <span style={{ color: "#05CE91" }}>~</span>
                <span style={{ color: "#71717a" }}>$</span>
                <span style={{ color: "#ededed", marginLeft: "4px" }}>welcome</span>
              </div>
              <pre
                style={{
                  color: "#05CE91",
                  fontSize: "18px",
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                {ASCII_LOGO}
              </pre>
            </div>

            {/* Help commands */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", fontSize: "18px" }}>
                <span style={{ color: "#05CE91" }}>~</span>
                <span style={{ color: "#71717a" }}>$</span>
                <span style={{ color: "#ededed", marginLeft: "4px" }}>help</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginLeft: "4px", fontSize: "17px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#05CE91", minWidth: "140px" }}>login</span>
                  <span style={{ color: "#71717a" }}>- authenticate with GitHub</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#05CE91", minWidth: "140px" }}>repo add</span>
                  <span style={{ color: "#71717a" }}>- add a skill repository</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#05CE91", minWidth: "140px" }}>install</span>
                  <span style={{ color: "#71717a" }}>- install a skill</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "#05CE91", minWidth: "140px" }}>list</span>
                  <span style={{ color: "#71717a" }}>- list installed skills</span>
                </div>
              </div>
            </div>

            {/* Install command */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", fontSize: "18px" }}>
                <span style={{ color: "#05CE91" }}>~</span>
                <span style={{ color: "#71717a" }}>$</span>
                <span style={{ color: "#ededed", marginLeft: "4px" }}>
                  skilluse install code-review
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginLeft: "4px", fontSize: "17px" }}>
                <span style={{ color: "#22c55e" }}>✔</span>
                <span style={{ color: "#71717a" }}>
                  Installed code-review to .claude/skills/
                </span>
              </div>
            </div>

            {/* Active prompt with cursor */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "18px" }}>
              <span style={{ color: "#05CE91" }}>~</span>
              <span style={{ color: "#71717a" }}>$</span>
              <span style={{ color: "#05CE91", marginLeft: "4px" }}>▌</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
